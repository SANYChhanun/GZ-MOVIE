# apps/movies/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MovieViewSet,
    EpisodeViewSet,
    HeroBannerViewSet,
    MovieAdminViewSet,
    GenreAdminViewSet,
    CategoryAdminViewSet,
    CastAdminViewSet,
    CrewAdminViewSet,
)

router = DefaultRouter()

# Public endpoints
router.register(r'movies', MovieViewSet, basename='movie')
router.register(r'episodes', EpisodeViewSet, basename='episode')
router.register(r'banners', HeroBannerViewSet, basename='banner')

# Admin endpoints
router.register(r'admin/movies', MovieAdminViewSet, basename='admin-movie')
router.register(r'admin/genres', GenreAdminViewSet, basename='admin-genre')
router.register(r'admin/categories', CategoryAdminViewSet, basename='admin-category')
router.register(r'admin/cast', CastAdminViewSet, basename='admin-cast')
router.register(r'admin/crew', CrewAdminViewSet, basename='admin-crew')

urlpatterns = [
    path('', include(router.urls)),  # ✅ កែពី 'api/' ទៅ ''
]