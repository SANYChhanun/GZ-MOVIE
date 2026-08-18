from rest_framework import viewsets, filters
from rest_framework.permissions import IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Genre, Country, Category, Cast, Crew, SeriesType  # ← បន្ថែម SeriesType
from .serializers import (
    GenreSerializer,
    CountrySerializer,
    CategorySerializer,
    CastSerializer,
    CrewSerializer,
    SeriesTypeSerializer,  # ← បន្ថែម SeriesTypeSerializer
)


class GenreViewSet(viewsets.ModelViewSet):
    """Admin អាច CRUD ប្រភេទរឿង អ្នកប្រើប្រាស់ធម្មតាអាចមើល"""
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug']
    ordering_fields = ['name']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class CountryViewSet(viewsets.ModelViewSet):
    """Admin អាច CRUD ប្រទេស អ្នកប្រើប្រាស់ធម្មតាអាចមើល"""
    queryset = Country.objects.all().order_by('name')
    serializer_class = CountrySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug']
    ordering_fields = ['name']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class CategoryViewSet(viewsets.ModelViewSet):
    """Admin អាច CRUD ក្រុម អ្នកប្រើប្រាស់ធម្មតាអាចមើល"""
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug']
    ordering_fields = ['name']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


# ============ បន្ថែម SeriesTypeViewSet នៅទីនេះ ============
class SeriesTypeViewSet(viewsets.ModelViewSet):
    """Admin អាច CRUD ប្រភេទរឿងភាគ អ្នកប្រើប្រាស់ធម្មតាអាចមើល"""
    queryset = SeriesType.objects.all().order_by('name')
    serializer_class = SeriesTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug']
    ordering_fields = ['name']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
# ============ បញ្ចប់ការបន្ថែម ============


class CastViewSet(viewsets.ModelViewSet):
    queryset = Cast.objects.all().order_by('name')
    serializer_class = CastSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'character_name']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class CrewViewSet(viewsets.ModelViewSet):
    queryset = Crew.objects.all().order_by('name')
    serializer_class = CrewSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'role']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]