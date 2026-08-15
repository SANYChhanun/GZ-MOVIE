# apps/movies/admin_urls.py
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# ★ FIX: prefix was 'movies-admin', which made the real endpoint
# /api/admin/movies-admin/ -- but adminApi.js (and everywhere else in
# the frontend) calls /admin/movies/. Every movie create/update/delete
# request was hitting a URL that didn't exist (404), regardless of file
# size -- this alone could explain "large movie never appears in the
# list" (and quite possibly small movies too, depending on how/when
# this was introduced).
router.register(
    r'movies',
    views.MovieAdminViewSet,
    basename='admin-movie',
)

# genres/categories/cast/crew moved to apps.taxonomy -- see
# apps/taxonomy/urls.py, included directly in the project's root
# urls.py under the same 'api/admin/' prefix so the final paths
# (/api/admin/genres/, /api/admin/categories/, ...) are unchanged for
# the frontend.

urlpatterns = router.urls