# apps/taxonomy/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GenreViewSet, CategoryViewSet,
    GenreAdminViewSet, CategoryAdminViewSet,
    CastAdminViewSet, CrewAdminViewSet
)

router = DefaultRouter()

# ============ PUBLIC ROUTES (AllowAny) ============
router.register(r'genres', GenreViewSet, basename='genre')
router.register(r'categories', CategoryViewSet, basename='category')

# ============ ADMIN ROUTES (Admin only) ============
router.register(r'admin/genres', GenreAdminViewSet, basename='admin-genre')
router.register(r'admin/categories', CategoryAdminViewSet, basename='admin-category')
router.register(r'admin/cast', CastAdminViewSet, basename='admin-cast')
router.register(r'admin/crew', CrewAdminViewSet, basename='admin-crew')

urlpatterns = [
    path('', include(router.urls)),
]