from django.db import transaction

from apps.streaming.models import WatchProgress


class ProgressService:

    @staticmethod
    @transaction.atomic
    def save_progress(
        *,
        user,
        video,
        current_second,
        duration_seconds=0,
    ):
        current_second = max(
            0,
            int(current_second),
        )

        duration_seconds = max(
            0,
            int(duration_seconds or 0),
        )

        completed = False

        if duration_seconds > 0:
            completed = (
                current_second >= duration_seconds * 0.95
            )

        progress, created = WatchProgress.objects.update_or_create(
            user=user,
            video=video,
            defaults={
                "last_watched_second": current_second,
                "duration_seconds": duration_seconds,
                "completed": completed,
            },
        )

        return progress

    @staticmethod
    def get_progress(*, user, video):
        return WatchProgress.objects.filter(
            user=user,
            video=video,
        ).first()

    @staticmethod
    @transaction.atomic
    def delete_progress(*, user, video):
        return WatchProgress.objects.filter(
            user=user,
            video=video,
        ).delete()