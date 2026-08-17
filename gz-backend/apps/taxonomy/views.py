# apps/taxonomy/views.py
from rest_framework import viewsets, permissions
from .models import Genre, Category, Cast, Crew
from .serializers import GenreSerializer, CategorySerializer, CastSerializer, CrewSerializer


# ============ PUBLIC VIEWSETS (AllowAny) ============
class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    """Public endpoint for genres"""
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Return all at once


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Public endpoint for categories"""
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


# ============ ADMIN VIEWSETS ============
class GenreAdminViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None


class CategoryAdminViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None


class CastAdminViewSet(viewsets.ModelViewSet):
    queryset = Cast.objects.all().order_by('name')
    serializer_class = CastSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ['name', 'character_name']


class CrewAdminViewSet(viewsets.ModelViewSet):
    queryset = Crew.objects.all().order_by('name')
    serializer_class = CrewSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ['name', 'role']