import hashlib
import time

from django.conf import settings


class BunnyTokenService:
    """
    Generates signed Bunny Stream playback tokens.

    Token format:
        SHA256(library_id + api_key + expiration + video_id)
    """

    def __init__(self):
        self.library_id = settings.BUNNY_STREAM_LIBRARY_ID
        self.api_key = settings.BUNNY_STREAM_API_KEY

        self.expiry_seconds = getattr(
            settings,
            "BUNNY_TOKEN_EXPIRY_SECONDS",
            60 * 60 * 2,
        )

    def generate_token(self, video_id: str):
        expiration = int(time.time()) + self.expiry_seconds

        value = (
            f"{self.library_id}"
            f"{self.api_key}"
            f"{expiration}"
            f"{video_id}"
        )

        token = hashlib.sha256(
            value.encode("utf-8")
        ).hexdigest()

        return {
            "token": token,
            "expires_at": expiration,
            "expires_in": self.expiry_seconds,
        }

    def build_video_url(self, video_id: str):
        data = self.generate_token(video_id)

        hostname = getattr(
            settings,
            "BUNNY_STREAM_HOSTNAME",
            "",
        ).rstrip("/")

        url = (
            f"{hostname}/{video_id}/"
            f"playlist.m3u8"
            f"?token={data['token']}"
            f"&expires={data['expires_at']}"
        )

        return {
            **data,
            "video_id": video_id,
            "url": url,
        }