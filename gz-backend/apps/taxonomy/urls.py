from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GenreViewSet,
    CountryViewSet,
    CategoryViewSet,
    CastViewSet,
    CrewViewSet,
    SeriesTypeViewSet,  # ← បន្ថែម import
)

router = DefaultRouter()
router.register(r'genres', GenreViewSet, basename='genre')
router.register(r'countries', CountryViewSet, basename='country')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'cast', CastViewSet, basename='cast')
router.register(r'crew', CrewViewSet, basename='crew')
router.register(r'series-types', SeriesTypeViewSet, basename='series-type')  # ← បន្ថែម route

urlpatterns = [
    path('', include(router.urls)),
]