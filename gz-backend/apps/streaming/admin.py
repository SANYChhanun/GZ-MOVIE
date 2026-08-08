from django.contrib import admin

from apps.streaming.models import (
    StreamSession,
    WatchProgress,
)


@admin.register(WatchProgress)
class WatchProgressAdmin(admin.ModelAdmin):

    list_display = [
        "user",
        "video",
        "last_watched_second",
        "duration_seconds",
        "completed",
        "last_watched_at",
    ]

    list_filter = [
        "completed",
        "last_watched_at",
    ]

    search_fields = [
        "user__username",
        "user__email",
        "video__title",
    ]

    readonly_fields = [
        "created_at",
        "last_watched_at",
    ]


@admin.register(StreamSession)
class StreamSessionAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "user",
        "video",
        "status",
        "expires_at",
        "created_at",
    ]

    list_filter = [
        "status",
        "created_at",
    ]

    search_fields = [
        "user__username",
        "user__email",
        "video__title",
        "id",
    ]

    readonly_fields = [
        "id",
        "token",
        "created_at",
        "updated_at",
    ]