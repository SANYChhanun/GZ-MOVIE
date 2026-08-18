# apps/movies/views.py — Complete & Fixed Version
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Movie, Episode, HeroBanner, SeriesType
from .serializers import (
    MovieListSerializer,
    MovieDetailSerializer,
    MovieAdminSerializer,
    MovieVideoUploadInitSerializer,
    EpisodeSerializer,
    HeroBannerSerializer,
    HeroBannerCreateUpdateSerializer,
    SeriesTypeSerializer,
)
# Genre/Category moved to apps.taxonomy -- the public genres/categories
# actions on MovieViewSet below (used by dropdown filters, HomePage.jsx,
# etc.) now read from there instead of apps.movies. Admin CRUD for these
# also moved -- see apps/taxonomy/views.py + apps/taxonomy/urls.py,
# included directly in the project's root urls.py.
from apps.taxonomy.models import Genre, Category
from apps.taxonomy.serializers import GenreSerializer, CategorySerializer
from .filters import MovieFilter
from .permissions import MovieAccessPermission, IsAdminOrReadOnly


# ============================================================
# PUBLIC ENDPOINTS — AllowAny for list/retrieve
# ============================================================

class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public movie endpoints.
    - GET /api/movies/              → List all movies (with filters, search, pagination)
    - GET /api/movies/{id}/         → Movie detail
    - GET /api/movies/featured/     → Featured movies
    - GET /api/movies/new_releases/ → New releases
    - GET /api/movies/free/         → Free movies
    - GET /api/movies/genres/       → All genres
    - GET /api/movies/categories/   → All categories
    """
    queryset = Movie.objects.filter(is_active=True).prefetch_related(
        'genres', 'categories', 'cast', 'crew', 'episodes'
    ).select_related()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MovieFilter
    search_fields = ['title', 'description', 'short_description', 'genres__name', 'cast__name', 'crew__name']
    ordering_fields = ['release_date', 'rating', 'view_count', 'created_at', 'title']
    ordering = ['-release_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return MovieListSerializer
        return MovieDetailSerializer

    def get_permissions(self):
        """
        Public can list/retrieve movies, plus all the read-only custom
        actions below (genres, categories, featured, new_releases, free,
        popular) -- these back public homepage/browse UI and must not
        require admin auth. Only list/retrieve were covered here before,
        so every custom @action fell through to IsAdminUser() and
        returned 403 for ordinary logged-out/non-admin visitors (e.g.
        HomePage.jsx calling GET /api/movies/genres/).
        """
        if self.action in [
            'list', 'retrieve',
            'featured', 'new_releases', 'free', 'popular',
            'genres', 'categories',
        ]:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_context(self):
        """
        Pass request to serializer so _user_can_watch() can access
        the current user.
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    # ========== CUSTOM ACTIONS ==========

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Return featured movies for homepage hero section."""
        featured = Movie.objects.filter(is_featured=True, is_active=True)[:10]
        serializer = MovieListSerializer(featured, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_releases(self, request):
        """Return new release movies."""
        new_releases = Movie.objects.filter(is_new_release=True, is_active=True).order_by('-release_date')[:20]
        serializer = MovieListSerializer(new_releases, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def free(self, request):
        """Return free movies."""
        free_movies = Movie.objects.filter(access_type='free', is_active=True)
        serializer = MovieListSerializer(free_movies, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Return popular movies sorted by view count."""
        popular = Movie.objects.filter(is_active=True).order_by('-view_count')[:20]
        serializer = MovieListSerializer(popular, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def genres(self, request):
        """Return all genres (for filter dropdowns). Genre now lives in apps.taxonomy."""
        genres = Genre.objects.all().order_by('name')
        serializer = GenreSerializer(genres, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Return all categories. Category now lives in apps.taxonomy."""
        categories = Category.objects.all().order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class EpisodeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public episode endpoints.
    - GET /api/episodes/              → List all episodes
    - GET /api/episodes/{id}/         → Episode detail
    - GET /api/movies/{movie_id}/episodes/ → Episodes for a specific movie
    """
    queryset = Episode.objects.filter(is_active=True).select_related('movie')
    serializer_class = EpisodeSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['movie', 'is_active']
    ordering_fields = ['episode_number']
    ordering = ['episode_number']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by movie_id if provided in URL
        movie_id = self.request.query_params.get('movie_id')
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        return queryset


# ============================================================
# BANNER ENDPOINTS
# ============================================================

class HeroBannerViewSet(viewsets.ModelViewSet):
    """
    Banner CRUD + public active banners.
    - GET /api/banners/         → List all banners (admin)
    - POST /api/banners/        → Create banner (admin)
    - GET /api/banners/{id}/    → Get banner detail
    - PUT /api/banners/{id}/    → Update banner (admin)
    - DELETE /api/banners/{id}/ → Delete banner (admin)
    - GET /api/banners/active/  → Active banners (public)
    - GET /api/banners/movies/  → Movies for dropdown (admin)
    """
    queryset = HeroBanner.objects.all().select_related('movie')
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['link_type', 'is_active']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return HeroBannerCreateUpdateSerializer
        return HeroBannerSerializer

    def get_permissions(self):
        """Public can see active banners, admin can do everything."""
        if self.action in ['list', 'retrieve', 'active', 'movies']:
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Return only active banners for public homepage."""
        banners = HeroBanner.objects.filter(is_active=True).select_related('movie')
        serializer = HeroBannerSerializer(banners, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def movies(self, request):
        """Return movies for admin dropdown selection."""
        movies = Movie.objects.filter(is_active=True).only('id', 'title', 'release_date', 'rating')
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

# apps/movies/views.py (បន្ថែម)
class SeriesTypeViewSet(viewsets.ModelViewSet):
    queryset = SeriesType.objects.all()
    serializer_class = SeriesTypeSerializer
# apps/movies/views.py

class MovieAdminViewSet(viewsets.ModelViewSet):
    """
    Admin CRUD for movies.
    """
    queryset = Movie.objects.all().prefetch_related('genres', 'categories', 'cast', 'crew')
    serializer_class = MovieAdminSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MovieFilter
    search_fields = ['title', 'description']
    ordering_fields = ['release_date', 'rating', 'view_count', 'created_at', 'title']

    # ✅ បន្ថែម method នេះ
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['post'], url_path='init-video-upload')
    def init_video_upload(self, request):
        # ... existing code ...
        """
        Step 1 of the direct-to-Bunny (TUS) video upload flow.

        POST { "title": "..." }
        -> { "endpoint", "video_id", "library_id", "signature", "expiration_time" }

        The admin panel calls this BEFORE picking up the video file. It
        creates a video slot on Bunny Stream and returns signed TUS
        credentials so the browser can upload the file bytes straight to
        Bunny -- this server never receives them, so there's no request
        size limit, no worker blocked for the upload duration, and the
        upload can resume automatically if the connection drops
        (see bunny_service.py for details).

        Once that direct upload finishes client-side, the frontend sends
        the resulting `video_id` back as `bunny_video_id` in a normal
        create/update call to this viewset (MovieAdminSerializer), which
        just derives the playable embed URL from it -- see
        MovieAdminSerializer._finalize_from_bunny_video_id().
        """
        serializer = MovieVideoUploadInitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        credentials = serializer.save()
        return Response(credentials)