import uuid

from django.conf import settings
from django.db import models


class WatchProgress(models.Model):
    """
    Stores the user's latest playback position for a video.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="watch_progress",
    )

    video = models.ForeignKey(
        "movies.Movie",
        on_delete=models.CASCADE,
        related_name="watch_progress",
    )

    last_watched_second = models.PositiveIntegerField(default=0)

    duration_seconds = models.PositiveIntegerField(default=0)

    completed = models.BooleanField(default=False)

    last_watched_at = models.DateTimeField(auto_now=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "watch_progress"

        constraints = [
            models.UniqueConstraint(
                fields=["user", "video"],
                name="unique_user_video_progress",
            )
        ]

        indexes = [
            models.Index(fields=["user", "video"]),
            models.Index(fields=["user", "-last_watched_at"]),
        ]

        ordering = ["-last_watched_at"]

    def __str__(self):
        return f"{self.user} - {self.video} - {self.last_watched_second}s"


class StreamSession(models.Model):
    """
    Represents one playback session.
    """

    STATUS_CHOICES = [
        ("active", "Active"),
        ("expired", "Expired"),
        ("ended", "Ended"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="stream_sessions",
    )

    video = models.ForeignKey(
        "movies.Movie",
        on_delete=models.CASCADE,
        related_name="stream_sessions",
    )

    token = models.TextField()

    expires_at = models.DateTimeField()

    last_watched_second = models.PositiveIntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    user_agent = models.TextField(
        blank=True,
        default="",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "stream_sessions"

        indexes = [
            models.Index(fields=["user", "video"]),
            models.Index(fields=["expires_at"]),
            models.Index(fields=["status"]),
        ]

        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.video} - {self.status}"

    @property
    def is_expired(self):
        from django.utils import timezone

        return timezone.now() >= self.expires_at