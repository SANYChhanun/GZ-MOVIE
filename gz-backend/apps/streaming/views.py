from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.movies.models import Movie

from apps.streaming.models import StreamSession
from apps.streaming.serializers import (
    SaveProgressSerializer,
    StreamTokenRequestSerializer,
    WatchProgressSerializer,
)
from apps.streaming.services.bunny_token_service import (
    BunnyTokenService,
)
from apps.streaming.services.progress_service import (
    ProgressService,
)


class StreamTokenView(APIView):
    """
    POST /api/stream/token/
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):

        serializer = StreamTokenRequestSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        video_id = serializer.validated_data["video_id"]

        video = get_object_or_404(
            Movie,
            id=video_id,
        )

        # Optional:
        # Add your own movie access / membership check here.
        #
        # Example:
        # if not video.is_published:
        #     return Response(
        #         {"detail": "Video unavailable."},
        #         status=status.HTTP_403_FORBIDDEN,
        #     )

        bunny_service = BunnyTokenService()

        token_data = bunny_service.build_video_url(
            str(video_id)
        )

        expires_at = timezone.datetime.fromtimestamp(
            token_data["expires_at"],
            tz=timezone.utc,
        )

        session = StreamSession.objects.create(
            user=request.user,
            video=video,
            token=token_data["token"],
            expires_at=expires_at,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get(
                "HTTP_USER_AGENT",
                "",
            ),
        )

        return Response(
            {
                "video_id": video_id,
                "token": token_data["token"],
                "url": token_data["url"],
                "expires_at": token_data["expires_at"],
                "expires_in": token_data["expires_in"],
                "session_id": session.id,
            },
            status=status.HTTP_200_OK,
        )

    @staticmethod
    def get_client_ip(request):

        forwarded = request.META.get(
            "HTTP_X_FORWARDED_FOR"
        )

        if forwarded:
            return forwarded.split(",")[0].strip()

        return request.META.get(
            "REMOTE_ADDR"
        )


class WatchProgressView(APIView):
    """
    GET  /api/progress/?video_id=123
    POST /api/progress/
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):

        video_id = request.query_params.get(
            "video_id"
        )

        if not video_id:
            return Response(
                {
                    "detail": "video_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        video = get_object_or_404(
            Movie,
            id=video_id,
        )

        progress = ProgressService.get_progress(
            user=request.user,
            video=video,
        )

        if not progress:
            return Response(
                {
                    "video_id": video.id,
                    "last_watched_second": 0,
                    "duration_seconds": 0,
                    "completed": False,
                },
                status=status.HTTP_200_OK,
            )

        serializer = WatchProgressSerializer(
            progress
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):

        serializer = SaveProgressSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        video_id = serializer.validated_data[
            "video_id"
        ]

        video = get_object_or_404(
            Movie,
            id=video_id,
        )

        progress = ProgressService.save_progress(
            user=request.user,
            video=video,
            current_second=serializer.validated_data[
                "current_second"
            ],
            duration_seconds=serializer.validated_data[
                "duration_seconds"
            ],
        )

        return Response(
            WatchProgressSerializer(
                progress
            ).data,
            status=status.HTTP_200_OK,
        )


class StreamSessionEndView(APIView):
    """
    POST /api/stream/session/<uuid>/end/
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request, session_id):

        session = get_object_or_404(
            StreamSession,
            id=session_id,
            user=request.user,
        )

        session.status = "ended"
        session.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "detail": "Stream session ended."
            },
            status=status.HTTP_200_OK,
        )