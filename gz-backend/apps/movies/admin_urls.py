# apps/movies/admin_urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovieAdminViewSet, EpisodeAdminViewSet   # ✅ បន្ថែម EpisodeAdminViewSet

router = DefaultRouter()
router.register(r'movies', MovieAdminViewSet, basename='admin-movie')
router.register(r'episodes', EpisodeAdminViewSet, basename='admin-episode')   # ✅ បន្ថែម

urlpatterns = [
    path('', include(router.urls)),
]