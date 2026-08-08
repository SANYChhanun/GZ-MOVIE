# movies/urls.py
from rest_framework.routers import DefaultRouter

from . import views


router = DefaultRouter()

router.register(
    r'movies',
    views.MovieViewSet,
    basename='movie'
)

router.register(
    r'episodes',
    views.EpisodeViewSet,
    basename='episode'
)

urlpatterns = router.urls