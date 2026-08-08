from django.urls import path

from apps.streaming.views import (
    StreamSessionEndView,
    StreamTokenView,
    WatchProgressView,
)


urlpatterns = [
    path(
        "stream/token/",
        StreamTokenView.as_view(),
        name="stream-token",
    ),

    path(
        "progress/",
        WatchProgressView.as_view(),
        name="watch-progress",
    ),

    path(
        "stream/session/<uuid:session_id>/end/",
        StreamSessionEndView.as_view(),
        name="stream-session-end",
    ),
]