# apps/movies/services/bunny_service.py
import hashlib
import time

import requests
from django.conf import settings


class BunnyStreamService:
    """
    Single source of truth for talking to Bunny.net Stream's HTTP API.

    Used by BOTH upload paths in this project, which is why it exposes
    two different calling styles:

    1. apps/movies/admin.py (Django's built-in /admin/ site) calls the
       classmethods directly — create_video(title), upload_video(id, path),
       get_embed_url(id) — working with a temp file PATH on disk, and
       expects None/False on failure (it already prints its own
       success/failure messages).

    2. apps/movies/serializers.py (the React admin panel's DRF API)
       instantiates this class and calls .upload(file_obj, title) —
       working with an in-memory UploadedFile object, and expects
       exceptions on failure so DRF can turn them into a proper 400
       response instead of silently doing nothing.

    Both styles share the same two underlying Bunny API calls:
      1. POST /library/{id}/videos        -> create a "slot", get a GUID
      2. PUT  /library/{id}/videos/{guid}  -> stream the raw bytes into it

    ---------------------------------------------------------------------
    NEW: get_tus_upload_credentials()

    For large files (Bunny recommends this for anything over ~2GB, or any
    upload over an unstable connection), the direct PUT above has no
    resume support — if the connection drops partway through a 10GB
    upload, the whole thing restarts from byte zero.

    Bunny's TUS endpoint (https://video.bunnycdn.com/tusupload) solves
    this: the browser uploads directly to Bunny in resumable chunks,
    without the file ever touching our server or Django's request/
    response cycle. This method only generates the short-lived signed
    credentials the frontend needs to talk to that endpoint directly —
    it does NOT move any video bytes itself.

    Flow:
      1. create_video(title)                    -> guid
      2. get_tus_upload_credentials(guid)        -> signature/expiry/etc.
      3. (frontend) tus-js-client uploads directly to Bunny using those
         credentials, with resume-on-failure built in. tus-js-client
         handles the full two-step TUS protocol itself: POST to create
         the upload resource (using the LibraryId/VideoId/Authorization*
         headers below), then PATCH chunks to the Location it gets back.
         Do NOT hand-roll this with a single XHR PATCH -- Bunny will
         reject it with "Invalid file id" because the upload resource
         was never created via the required POST step first.
    """

    BASE_URL = "https://video.bunnycdn.com/library"
    TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload"

    # ---------------------------------------------------------------
    # Shared internals
    # ---------------------------------------------------------------

    @classmethod
    def _library_id(cls):
        library_id = settings.BUNNY_STREAM_LIBRARY_ID
        return str(library_id).strip()

    @classmethod
    def _api_key(cls):
        return settings.BUNNY_STREAM_API_KEY

    @classmethod
    def _headers(cls, content_type="application/json"):
        return {
            "AccessKey": cls._api_key(),
            "Accept": "application/json",
            "Content-Type": content_type,
        }

    # ---------------------------------------------------------------
    # Static/classmethod API — used by apps/movies/admin.py
    # ---------------------------------------------------------------

    @classmethod
    def create_video(cls, title: str):
        """Returns the new video's GUID, or None on failure."""
        library_id = cls._library_id()
        api_key = cls._api_key()
        if not library_id or not api_key:
            print("BunnyStreamService: BUNNY_STREAM_LIBRARY_ID/BUNNY_STREAM_API_KEY not configured.")
            return None
        try:
            response = requests.post(
                f"{cls.BASE_URL}/{library_id}/videos",
                headers=cls._headers(),
                json={"title": title},
                timeout=30,
            )
            response.raise_for_status()
            return response.json()["guid"]
        except requests.RequestException as exc:
            print(f"BunnyStreamService.create_video failed: {exc}")
            return None

    @classmethod
    def upload_video(cls, video_id: str, file_path: str) -> bool:
        """
        Uploads the file at file_path to the given video_id via a direct
        PUT. Returns True/False.

        NOTE: this has no resume support. Fine for small/medium files,
        but for anything large (multi-GB) or uploaded over a flaky
        connection, prefer get_tus_upload_credentials() + a TUS client
        on the frontend instead — see the class docstring above.
        """
        library_id = cls._library_id()
        try:
            with open(file_path, "rb") as f:
                response = requests.put(
                    f"{cls.BASE_URL}/{library_id}/videos/{video_id}",
                    headers=cls._headers(content_type="application/octet-stream"),
                    data=f,
                    timeout=(30, 7200),
                )
            response.raise_for_status()
            return True
        except (requests.RequestException, OSError) as exc:
            print(f"BunnyStreamService.upload_video failed: {exc}")
            return False

    @classmethod
    def get_embed_url(cls, video_id: str) -> str:
        library_id = cls._library_id()
        return f"https://iframe.mediadelivery.net/embed/{library_id}/{video_id}"

    @classmethod
    def get_tus_upload_credentials(cls, video_id: str, expiration_seconds: int = 3600) -> dict:
        """
        Returns everything a browser-side TUS client (tus-js-client)
        needs to upload directly to Bunny Stream for the given video_id
        -- no video bytes ever pass through our server.

        Bunny's required signature is:
            SHA256(library_id + api_key + expiration_time + video_id)
        """
        library_id = cls._library_id()
        api_key = cls._api_key()
        if not library_id or not api_key:
            raise RuntimeError(
                "BUNNY_STREAM_LIBRARY_ID / BUNNY_STREAM_API_KEY are not configured "
                "(see config/settings.py)."
            )

        expiration_time = str(int(time.time()) + expiration_seconds)

        # Bunny Stream signature calculation
        signature_string = f"{library_id}{api_key}{expiration_time}{video_id}"
        signature = hashlib.sha256(signature_string.encode()).hexdigest()

        endpoint = cls.TUS_ENDPOINT

        return {
            "endpoint": endpoint,
            "video_id": video_id,
            "library_id": library_id,
            "signature": signature,
            "expiration_time": expiration_time,
        }

    # ---------------------------------------------------------------
    # Instance API — used by apps/movies/serializers.py
    # (raises RuntimeError instead of returning None/False, so DRF can
    # surface a real error message in the API response)
    # ---------------------------------------------------------------

    def __init__(self):
        self.library_id = self._library_id()
        self.api_key = self._api_key()
        if not self.library_id or not self.api_key:
            raise RuntimeError(
                "BUNNY_STREAM_LIBRARY_ID / BUNNY_STREAM_API_KEY are not configured "
                "(see config/settings.py)."
            )

    def upload(self, file_obj, title: str) -> str:
        """
        file_obj: an open, readable Django UploadedFile (e.g. from
                   request.FILES['video_file']).
        Returns the Bunny video GUID on success; raises RuntimeError on
        failure.

        NOTE: same caveat as the classmethod upload_video() above — this
        is a single-shot PUT with no resume. Prefer the TUS flow
        (get_tus_upload_credentials) for large files.
        """
        guid = self.create_video(title)
        if not guid:
            raise RuntimeError("Bunny: failed to create video slot.")

        file_obj.seek(0)
        response = requests.put(
            f"{self.BASE_URL}/{self.library_id}/videos/{guid}",
            headers=self._headers(content_type="application/octet-stream"),
            data=file_obj,
            timeout=(30, 7200),
        )
        if response.status_code not in (200, 201):
            raise RuntimeError(
                f"Bunny: failed to upload video binary for {guid} "
                f"(status {response.status_code}): {response.text}"
            )
        return guid

    # ================================================================
    # NEW: Helper methods for checking videos in Bunny
    # ================================================================

    @classmethod
    def get_all_videos(cls, page: int = 1, per_page: int = 100) -> dict:
        """
        Get all videos from Bunny Stream library.
        Returns dict with 'items' list and 'totalItems' count.
        """
        library_id = cls._library_id()
        api_key = cls._api_key()
        
        if not library_id or not api_key:
            print("BunnyStreamService: BUNNY_STREAM_LIBRARY_ID/BUNNY_STREAM_API_KEY not configured.")
            return {"items": [], "totalItems": 0}

        try:
            response = requests.get(
                f"{cls.BASE_URL}/{library_id}/videos",
                headers=cls._headers(),
                params={"page": page, "perPage": per_page},
                timeout=30,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as exc:
            print(f"BunnyStreamService.get_all_videos failed: {exc}")
            return {"items": [], "totalItems": 0}

    @classmethod
    def get_video(cls, video_id: str) -> dict:
        """
        Get a specific video from Bunny Stream by its GUID.
        Returns video data dict or None if not found.
        """
        library_id = cls._library_id()
        api_key = cls._api_key()
        
        if not library_id or not api_key:
            print("BunnyStreamService: BUNNY_STREAM_LIBRARY_ID/BUNNY_STREAM_API_KEY not configured.")
            return None

        try:
            response = requests.get(
                f"{cls.BASE_URL}/{library_id}/videos/{video_id}",
                headers=cls._headers(),
                timeout=30,
            )
            if response.status_code == 200:
                return response.json()
            return None
        except requests.RequestException as exc:
            print(f"BunnyStreamService.get_video failed: {exc}")
            return None

    @classmethod
    def delete_video(cls, video_id: str) -> bool:
        """
        Delete a video from Bunny Stream by its GUID.
        Returns True on success, False on failure.
        """
        library_id = cls._library_id()
        api_key = cls._api_key()
        
        if not library_id or not api_key:
            print("BunnyStreamService: BUNNY_STREAM_LIBRARY_ID/BUNNY_STREAM_API_KEY not configured.")
            return False

        try:
            response = requests.delete(
                f"{cls.BASE_URL}/{library_id}/videos/{video_id}",
                headers=cls._headers(),
                timeout=30,
            )
            response.raise_for_status()
            return True
        except requests.RequestException as exc:
            print(f"BunnyStreamService.delete_video failed: {exc}")
            return False

    @classmethod
    def get_video_embed_html(cls, video_id: str, autoplay: bool = True) -> str:
        """
        Get HTML embed code for a video from Bunny Stream.
        """
        embed_url = cls.get_embed_url(video_id)
        if autoplay:
            embed_url += "?autoplay=1"
        return f'<iframe src="{embed_url}" width="100%" height="100%" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture; fullscreen"></iframe>'