# apps/taxonomy/urls.py
#
# Registers the same URL names the frontend already calls
# (adminApi.js: /admin/genres/, /admin/categories/, ...) so moving these
# models out of apps.movies doesn't require any frontend changes -- only
# how this router gets included in the project's root urls.py changes.
# See the integration note where this is wired in for the exact prefix
# to use so the final paths match what adminApi.js expects.
from rest_framework.routers import DefaultRouter
from .views import (
    GenreAdminViewSet,
    CategoryAdminViewSet,
    CastAdminViewSet,
    CrewAdminViewSet,
)

router = DefaultRouter()
router.register('genres', GenreAdminViewSet, basename='admin-genres')
router.register('categories', CategoryAdminViewSet, basename='admin-categories')
router.register('cast', CastAdminViewSet, basename='admin-cast')
router.register('crew', CrewAdminViewSet, basename='admin-crew')

urlpatterns = router.urls