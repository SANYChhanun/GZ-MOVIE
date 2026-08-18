# apps/movies/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovieViewSet, EpisodeViewSet, HeroBannerViewSet, SeriesTypeViewSet  # ← បន្ថែម import

router = DefaultRouter()
router.register(r'movies', MovieViewSet, basename='movie')
router.register(r'episodes', EpisodeViewSet, basename='episode')
router.register(r'banners', HeroBannerViewSet, basename='banner')
router.register(r'series-types', SeriesTypeViewSet, basename='series-type')  # ← បន្ថែម

urlpatterns = [
    path('', include(router.urls)),
]