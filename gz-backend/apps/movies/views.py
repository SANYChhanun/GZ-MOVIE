# movies/views.py
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Movie, Episode, Genre, Category, Cast, Crew
from .serializers import (
    MovieListSerializer, MovieDetailSerializer,
    EpisodeSerializer, GenreSerializer, CategorySerializer,
    CastSerializer, CrewSerializer,
)
from .filters import MovieFilter
from .permissions import MovieAccessPermission

from rest_framework import viewsets, mixins, permissions
from .models import Genre, Category
from .serializers import GenreSerializer, CategorySerializer
from .admin_views import MovieAdminViewSet

# ---- Admin management views (staff only) ----

# class BaseAdminViewSet(
#     mixins.CreateModelMixin,
#     mixins.DestroyModelMixin,
#     mixins.ListModelMixin,
#     viewsets.GenericViewSet
# ):
#     permission_classes = [permissions.IsAdminUser]
#     pagination_class = None


class GenreAdminViewSet(MovieAdminViewSet):
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class CategoryAdminViewSet(MovieAdminViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides list and detail actions for movies.
    Filtering, search, and ordering are supported.
    Access to detail view is controlled by MovieAccessPermission.
    """
    queryset = Movie.objects.filter(is_active=True).prefetch_related(
        'genres', 'categories', 'cast', 'crew', 'episodes'
    ).select_related()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MovieFilter
    search_fields = ['title', 'description', 'short_description', 'genres__name', 'cast__name', 'crew__name']
    ordering_fields = ['release_date', 'rating', 'view_count', 'created_at']
    ordering = ['-release_date']
    pagination_class = None  # We'll handle pagination in the frontend or via custom pagination if needed.

    def get_serializer_class(self):
        if self.action == 'list':
            return MovieListSerializer
        return MovieDetailSerializer

    def get_permissions(self):
        # List endpoint is public, but detail enforces access
        if self.action == 'retrieve':
            return [MovieAccessPermission()]
        return []

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Return featured movies for hero banner (max 10)."""
        featured = Movie.objects.filter(is_featured=True, is_active=True)[:10]
        serializer = MovieListSerializer(featured, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_releases(self, request):
        """Return latest releases."""
        new_releases = Movie.objects.filter(is_new_release=True, is_active=True)[:20]
        serializer = MovieListSerializer(new_releases, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def free(self, request):
        """Return only free movies."""
        free_movies = Movie.objects.filter(access_type='free', is_active=True)
        serializer = MovieListSerializer(free_movies, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[MovieAccessPermission])
    def member(self, request):
        """Return member-only movies (requires VIP)."""
        # This endpoint itself requires VIP; the queryset is already filtered.
        member_movies = Movie.objects.filter(access_type='member', is_active=True)
        serializer = MovieListSerializer(member_movies, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def purchase(self, request):
        """Return purchase-required movies."""
        purchase_movies = Movie.objects.filter(access_type='purchase', is_active=True)
        serializer = MovieListSerializer(purchase_movies, many=True, context={'request': request})
        return Response(serializer.data)

    # Additional utility endpoints for genres, categories, cast, crew
    @action(detail=False, methods=['get'])
    def genres(self, request):
        genres = Genre.objects.all()
        serializer = GenreSerializer(genres, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class EpisodeViewSet(viewsets.ReadOnlyModelViewSet):
    """Optional: retrieve episodes independently, but usually nested in movie detail."""
    queryset = Episode.objects.filter(is_active=True)
    serializer_class = EpisodeSerializer
    lookup_field = 'id'