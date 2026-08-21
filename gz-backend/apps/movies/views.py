# apps/movies/views.py — Complete & Fixed Version
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Movie, Episode, HeroBanner
from .serializers import (
    MovieListSerializer,
    MovieDetailSerializer,
    MovieAdminSerializer,
    MovieVideoUploadInitSerializer,
    EpisodeSerializer,
    HeroBannerSerializer,
    HeroBannerCreateUpdateSerializer,
)
from apps.taxonomy.models import Genre, Category
from apps.taxonomy.serializers import GenreSerializer, CategorySerializer
from .filters import MovieFilter
from .permissions import IsAdminOrReadOnly


# ============================================================
# PUBLIC MOVIE ENDPOINTS
# ============================================================

class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public movie endpoints.
    
    Endpoints:
    - GET /api/movies/                  → List all movies
    - GET /api/movies/{id}/             → Movie detail
    - GET /api/movies/featured/         → Featured movies
    - GET /api/movies/new-releases/     → New releases
    - GET /api/movies/free/             → Free movies
    - GET /api/movies/popular/          → Popular movies
    - GET /api/movies/genres/           → All genres
    - GET /api/movies/categories/       → All categories
    - GET /api/movies/related/?movie_id={id} → Related movies
    """
    queryset = Movie.objects.filter(is_active=True).prefetch_related(
        'genres', 'categories', 'countries', 'series_types', 'episodes'
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MovieFilter
    search_fields = ['title', 'description', 'short_description', 'genres__name']
    ordering_fields = ['release_date', 'rating', 'view_count', 'created_at', 'title']
    ordering = ['-release_date']
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        """ប្រើ serializer ផ្សេងៗគ្នាតាម action"""
        if self.action == 'list':
            return MovieListSerializer
        return MovieDetailSerializer

    def get_serializer_context(self):
        """Pass request to serializer for user permission checks"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def retrieve(self, request, *args, **kwargs):
        """បង្កើន view_count នៅពេលមើលលម្អិត"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # ========== CUSTOM ACTIONS ==========

    @action(detail=False, methods=['get'], url_path='featured')
    def featured(self, request):
        """Return featured movies for homepage hero section."""
        featured = Movie.objects.filter(
            is_featured=True, 
            is_active=True
        ).prefetch_related('genres', 'categories')[:10]
        serializer = MovieListSerializer(
            featured, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='new-releases')
    def new_releases(self, request):
        """Return new release movies."""
        new_releases = Movie.objects.filter(
            is_new_release=True, 
            is_active=True
        ).order_by('-release_date')[:20]
        serializer = MovieListSerializer(
            new_releases, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='free')
    def free(self, request):
        """Return free movies."""
        free_movies = Movie.objects.filter(
            access_type='free', 
            is_active=True
        ).order_by('-release_date')
        serializer = MovieListSerializer(
            free_movies, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='popular')
    def popular(self, request):
        """Return popular movies sorted by view count."""
        popular = Movie.objects.filter(
            is_active=True
        ).order_by('-view_count')[:20]
        serializer = MovieListSerializer(
            popular, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='genres')
    def genres(self, request):
        """Return all genres for filter dropdowns."""
        genres = Genre.objects.all().order_by('name')
        serializer = GenreSerializer(genres, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='categories')
    def categories(self, request):
        """Return all categories for filter dropdowns."""
        categories = Category.objects.all().order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='related')
    def related(self, request):
        """Return related movies based on genre."""
        movie_id = request.query_params.get('movie_id')
        if not movie_id:
            return Response(
                {'error': 'movie_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            movie = Movie.objects.get(id=movie_id, is_active=True)
            related = Movie.objects.filter(
                genres__in=movie.genres.all(),
                is_active=True
            ).exclude(id=movie.id).distinct()[:10]
            serializer = MovieListSerializer(
                related, 
                many=True, 
                context={'request': request}
            )
            return Response(serializer.data)
        except Movie.DoesNotExist:
            return Response(
                {'error': 'Movie not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


# ============================================================
# EPISODE ENDPOINTS
# ============================================================

# apps/movies/views.py - ពិនិត្យថាមាន EpisodeViewSet

class EpisodeViewSet(viewsets.ReadOnlyModelViewSet):
    """Public episode endpoints"""
    queryset = Episode.objects.filter(is_active=True).select_related('movie')
    serializer_class = EpisodeSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['movie', 'is_active']
    ordering_fields = ['episode_number']
    ordering = ['episode_number']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        movie_id = self.request.query_params.get('movie_id')
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        return queryset


# ============================================================
# BANNER ENDPOINTS
# ============================================================

# apps/movies/views.py - កែ HeroBannerViewSet
class HeroBannerViewSet(viewsets.ModelViewSet):
    """Banner CRUD + public active banners"""
    queryset = HeroBanner.objects.all().select_related('movie')
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['link_type', 'is_active']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return HeroBannerCreateUpdateSerializer
        return HeroBannerSerializer
    
    def get_permissions(self):
        """Public can see active banners, admin can do everything"""
        if self.action in ['list', 'retrieve', 'active', 'movies']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_serializer_context(self):
        """Pass request to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        """Return only active banners for public homepage"""
        banners = HeroBanner.objects.filter(
            is_active=True
        ).select_related('movie').order_by('order')
        serializer = HeroBannerSerializer(
            banners, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='movies')
    def movies(self, request):
        """Return movies for admin dropdown"""
        movies = Movie.objects.filter(is_active=True).only(
            'id', 'title', 'release_date', 'rating'
        ).order_by('title')
        
        data = [
            {
                'id': m.id,
                'title': m.title,
                'release_date': m.release_date,
                'rating': float(m.rating) if m.rating else None,
            }
            for m in movies
        ]
        return Response(data)


# ============================================================
# ADMIN ENDPOINTS
# ============================================================

class MovieAdminViewSet(viewsets.ModelViewSet):
    """
    Admin CRUD for movies.
    Supports direct-to-Bunny (TUS) and legacy server-relay upload.
    
    Endpoints:
    - GET /api/admin/movies/                    → List all movies (admin)
    - POST /api/admin/movies/                   → Create movie (admin)
    - GET /api/admin/movies/{id}/               → Movie detail (admin)
    - PATCH /api/admin/movies/{id}/             → Update movie (admin)
    - DELETE /api/admin/movies/{id}/            → Delete movie (admin)
    - POST /api/admin/movies/init-video-upload/ → Init TUS upload (admin)
    """
    queryset = Movie.objects.all().prefetch_related(
        'genres', 'categories', 'countries', 'series_types'
    )
    serializer_class = MovieAdminSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MovieFilter
    search_fields = ['title', 'description']
    ordering_fields = ['release_date', 'rating', 'view_count', 'created_at', 'title']
    ordering = ['-created_at']

    def get_serializer_context(self):
        """Pass request to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['post'], url_path='init-video-upload')
    def init_video_upload(self, request):
        """
        Step 1 of the direct-to-Bunny (TUS) video upload flow.
        
        POST { "title": "..." }
        Returns signed TUS credentials for browser upload.
        """
        serializer = MovieVideoUploadInitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        credentials = serializer.save()
        return Response(credentials)

from .serializers import EpisodeAdminSerializer

class EpisodeAdminViewSet(viewsets.ModelViewSet):
    """
    Admin CRUD for episodes.
    
    Endpoints:
    - GET    /api/admin/episodes/?movie=<id>  → List episodes for a movie
    - POST   /api/admin/episodes/             → Create episode
    - GET    /api/admin/episodes/{id}/        → Episode detail
    - PATCH  /api/admin/episodes/{id}/        → Update episode
    - DELETE /api/admin/episodes/{id}/        → Delete episode
    """
    queryset = Episode.objects.all().select_related('movie')
    serializer_class = EpisodeAdminSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['movie', 'is_active']
    ordering = ['movie', 'episode_number']

    def get_queryset(self):
        queryset = super().get_queryset()
        movie_id = self.request.query_params.get('movie')
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        return queryset