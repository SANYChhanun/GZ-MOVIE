from rest_framework import serializers

from apps.streaming.models import WatchProgress, StreamSession


class StreamTokenRequestSerializer(serializers.Serializer):

    video_id = serializers.IntegerField()


class StreamTokenResponseSerializer(serializers.Serializer):

    video_id = serializers.IntegerField()
    token = serializers.CharField()
    url = serializers.URLField()
    expires_at = serializers.IntegerField()
    expires_in = serializers.IntegerField()
    session_id = serializers.UUIDField()


class WatchProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = WatchProgress
        fields = [
            "id",
            "video",
            "last_watched_second",
            "duration_seconds",
            "completed",
            "last_watched_at",
        ]

        read_only_fields = [
            "id",
            "last_watched_at",
        ]


class SaveProgressSerializer(serializers.Serializer):

    video_id = serializers.IntegerField()

    current_second = serializers.IntegerField(
        min_value=0
    )

    duration_seconds = serializers.IntegerField(
        min_value=0,
        required=False,
        default=0,
    )