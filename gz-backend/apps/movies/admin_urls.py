# movies/admin_urls.py
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(
    r"genres",
    views.GenreAdminViewSet,
    basename="admin-genre"
)

router.register(
    r"categories",
    views.CategoryAdminViewSet,
    basename="admin-category"
)

router.register(
    r'movies-admin', 
    views.MovieAdminViewSet, 
    basename='admin-movie')

urlpatterns = router.urls