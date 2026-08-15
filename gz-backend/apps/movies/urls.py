# apps/movies/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovieViewSet, EpisodeViewSet, HeroBannerViewSet

router = DefaultRouter()
router.register(r'movies', MovieViewSet, basename='movie')
router.register(r'episodes', EpisodeViewSet, basename='episode')
router.register(r'banners', HeroBannerViewSet, basename='banner')

urlpatterns = [
    path('', include(router.urls)),
]