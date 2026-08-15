# apps/taxonomy/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Genre, Category, Cast, Crew
from .serializers import GenreSerializer, CategorySerializer, CastSerializer, CrewSerializer


class GenreAdminViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None


class CategoryAdminViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    pagination_class = None


class CastAdminViewSet(viewsets.ModelViewSet):
    queryset = Cast.objects.all().order_by('name')
    serializer_class = CastSerializer
    permission_classes = [IsAdminUser]
    search_fields = ['name', 'character_name']


class CrewAdminViewSet(viewsets.ModelViewSet):
    queryset = Crew.objects.all().order_by('name')
    serializer_class = CrewSerializer
    permission_classes = [IsAdminUser]
    search_fields = ['name', 'role']