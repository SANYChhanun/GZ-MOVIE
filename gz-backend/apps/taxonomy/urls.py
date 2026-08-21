# apps/taxonomy/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GenreViewSet, 
    CategoryViewSet, 
    CountryViewSet, 
    SeriesTypeViewSet,
)

router = DefaultRouter()
router.register(r'genres', GenreViewSet, basename='genre')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'countries', CountryViewSet, basename='country')
router.register(r'series-types', SeriesTypeViewSet, basename='series-type')

urlpatterns = [
    path('', include(router.urls)),
]