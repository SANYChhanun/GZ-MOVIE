# apps/movies/serializers.py
from django.utils.text import slugify
from rest_framework import serializers
from .models import Movie, Episode, HeroBanner
from .services.bunny_service import BunnyStreamService

from apps.taxonomy.serializers import (
    GenreSerializer,
    CategorySerializer,
    CastSerializer,
    CrewSerializer,
    CountrySerializer,
    SeriesTypeSerializer,
)
from apps.taxonomy.models import Genre, Category, Country, SeriesType


class MediaURLMixin:
    """Mixin សម្រាប់បង្កើត absolute URL សម្រាប់ media files"""
    
    def _get_media_url(self, media_file):
        """បង្កើត absolute URL ពី media file"""
        if not media_file:
            return None
        
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(media_file.url)
        return media_file.url


# ============================================================
# MOVIE SERIALIZERS
# ============================================================

class MovieListSerializer(MediaURLMixin, serializers.ModelSerializer):
    """Lightweight serializer for movie list view"""
    genres = GenreSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    countries = CountrySerializer(many=True, read_only=True)
    series_types = SeriesTypeSerializer(many=True, read_only=True)
    
    poster_url = serializers.SerializerMethodField()
    backdrop_url = serializers.SerializerMethodField()
    year = serializers.SerializerMethodField()
    episode_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'slug', 'short_description',
            'poster_url', 'backdrop_url',
            'release_date', 'year', 'duration',
            'rating', 'view_count', 'access_type',
            'genres', 'categories', 'countries', 'series_types',
            'is_featured', 'is_new_release',
            'country', 'language',
            'content_type', 'has_khmer_dub', 'has_khmer_sub',
            'total_episodes', 'episode_count',
        ]
    
    def get_poster_url(self, obj):
        return self._get_media_url(obj.poster)
    
    def get_backdrop_url(self, obj):
        return self._get_media_url(obj.backdrop)
    
    def get_year(self, obj):
        return obj.release_date.year if obj.release_date else None
    
    def get_episode_count(self, obj):
        return obj.episodes.filter(is_active=True).count()


# apps/movies/serializers.py - MovieDetailSerializer (Fixed)

class MovieDetailSerializer(MediaURLMixin, serializers.ModelSerializer):
    """Full movie detail with genres, cast, crew, episodes"""
    genres = GenreSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    countries = CountrySerializer(many=True, read_only=True)
    series_types = SeriesTypeSerializer(many=True, read_only=True)
    episodes = serializers.SerializerMethodField()
    
    poster_url = serializers.SerializerMethodField()
    backdrop_url = serializers.SerializerMethodField()
    year = serializers.SerializerMethodField()
    episode_count = serializers.SerializerMethodField()
    video_file = serializers.SerializerMethodField()
    can_watch = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'slug',
            'description', 'short_description',
            'poster_url', 'backdrop_url',
            'release_date', 'year', 'duration',
            'rating', 'view_count',
            'access_type', 'is_new_release', 'is_featured',
            'genres', 'categories', 'countries', 'series_types',
            'episodes',
            'country', 'language',
            'trailer_url', 'video_file', 'bunny_video_id',
            'purchase_price', 'episode_count',
            'content_type', 'has_khmer_dub', 'has_khmer_sub',
            'total_episodes', 'can_watch',
            'created_at', 'updated_at',
        ]
    
    def get_poster_url(self, obj):
        return self._get_media_url(obj.poster)
    
    def get_backdrop_url(self, obj):
        return self._get_media_url(obj.backdrop)
    
    def get_year(self, obj):
        return obj.release_date.year if obj.release_date else None
    
    def get_episode_count(self, obj):
        return obj.episodes.filter(is_active=True).count()
    
    def get_episodes(self, obj):
        """Get episodes only for series"""
        if obj.content_type == 'series':
            episodes = obj.episodes.filter(is_active=True)
            return EpisodeSerializer(episodes, many=True, context=self.context).data
        return []
    
    def get_video_file(self, obj):
        """✅ ពិនិត្យ permission ត្រឹមត្រូវ"""
        if self._user_can_watch(obj):
            return obj.video_file
        return None
    
    def get_can_watch(self, obj):
        """Check if current user can watch"""
        return self._user_can_watch(obj)
    
    def _user_can_watch(self, obj):
        """
        Check if user can watch this movie.
        
        Rules:
        - Admin/Staff/Superuser: Can watch everything
        - Free movies: Everyone can watch
        - Member movies: Requires VIP subscription
        - Purchase movies: Requires purchase
        """
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        
        # ✅ Admin, Staff, Superuser អាចមើលបានទាំងអស់
        if user and user.is_authenticated:
            if user.is_admin() or user.is_staff or user.is_superuser:
                return True
        
        # Free movies - everyone can watch
        if obj.access_type == 'free':
            return True
        
        # Not logged in
        if not user or not user.is_authenticated:
            return False
        
        # Check access using User model method
        return user.has_access_to_movie(obj)


# apps/movies/serializers.py
class MovieAdminSerializer(MediaURLMixin, serializers.ModelSerializer):
    """
    Admin CRUD serializer for MovieAdminViewSet.
    """
    
    genres = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Genre.objects.all(), required=False
    )
    categories = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Category.objects.all(), required=False
    )
    countries = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Country.objects.all(), required=False
    )
    series_types = serializers.PrimaryKeyRelatedField(
        many=True, queryset=SeriesType.objects.all(), required=False
    )
    poster_url = serializers.SerializerMethodField(read_only=True)
    backdrop_url = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'release_date', 'country', 'language', 'duration',
            'poster', 'backdrop', 'poster_url', 'backdrop_url',
            'trailer_url', 'video_file', 'bunny_video_id', 'video_upload',
            'access_type', 'purchase_price',
            'rating', 'view_count',
            'is_featured', 'is_new_release', 'is_active',
            'genres', 'categories',
            'countries', 'series_types',
            'content_type', 'has_khmer_dub', 'has_khmer_sub',
            'total_episodes',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'slug', 'rating', 'view_count',
            'created_at', 'updated_at', 'video_file',
        ]
        extra_kwargs = {
            'video_upload': {'required': False, 'write_only': True},
            'bunny_video_id': {'required': False, 'allow_blank': True, 'allow_null': True},
            'poster': {'required': False},
            'backdrop': {'required': False},
            'purchase_price': {'required': False, 'allow_null': True},  # ✅ គ្មាន allow_blank
            'trailer_url': {'required': False, 'allow_blank': True, 'allow_null': True},
            'total_episodes': {'required': False, 'allow_null': True},  # ✅ គ្មាន allow_blank
            'access_type': {'required': False, 'default': 'free'},
        }
    
    def get_poster_url(self, obj):
        return self._get_media_url(obj.poster)
    
    def get_backdrop_url(self, obj):
        return self._get_media_url(obj.backdrop)
    
    def to_representation(self, instance):
        """Return full objects for M2M fields in read operations"""
        rep = super().to_representation(instance)
        rep['genres'] = GenreSerializer(instance.genres.all(), many=True).data
        rep['categories'] = CategorySerializer(instance.categories.all(), many=True).data
        rep['countries'] = CountrySerializer(instance.countries.all(), many=True).data
        rep['series_types'] = SeriesTypeSerializer(instance.series_types.all(), many=True).data
        return rep
    
    def _generate_unique_slug(self, title):
        """Generate unique slug from title"""
        base = slugify(title) or 'movie'
        slug = base
        counter = 1
        while Movie.objects.filter(slug=slug).exists():
            counter += 1
            slug = f"{base}-{counter}"
        return slug
    
    def validate(self, data):
        """Validate movie data with access_type handling"""
        access_type = data.get('access_type', getattr(self.instance, 'access_type', 'free'))
        purchase_price = data.get('purchase_price', getattr(self.instance, 'purchase_price', None))
        
        # ពិនិត្យ purchase price សម្រាប់ access_type='purchase'
        if access_type == 'purchase':
            if purchase_price is None or purchase_price == '':
                raise serializers.ValidationError({
                    'purchase_price': 'Purchase price is required when access type is Pay Per View.'
                })
            
            try:
                price = float(purchase_price)
                if price <= 0:
                    raise serializers.ValidationError({
                        'purchase_price': 'Purchase price must be greater than 0.'
                    })
            except (TypeError, ValueError):
                raise serializers.ValidationError({
                    'purchase_price': 'Purchase price must be a valid number.'
                })
        
        # សម្រាប់ free និង member - មិនត្រូវការ purchase_price
        if access_type in ['free', 'member']:
            data['purchase_price'] = None
        
        return data
    
    def create(self, validated_data):
        """Create movie with slug and video handling"""
        validated_data['slug'] = self._generate_unique_slug(validated_data.get('title', ''))
        
        series_types_data = validated_data.pop('series_types', [])
        genres_data = validated_data.pop('genres', [])
        categories_data = validated_data.pop('categories', [])
        countries_data = validated_data.pop('countries', [])
        
        if validated_data.get('access_type') != 'purchase':
            validated_data['purchase_price'] = None
        
        movie = super().create(validated_data)
        
        if series_types_data:
            movie.series_types.set(series_types_data)
        if genres_data:
            movie.genres.set(genres_data)
        if categories_data:
            movie.categories.set(categories_data)
        if countries_data:
            movie.countries.set(countries_data)
        
        self._handle_video(movie)
        return movie
    
    def update(self, instance, validated_data):
        """Update movie"""
        series_types_data = validated_data.pop('series_types', None)
        genres_data = validated_data.pop('genres', None)
        categories_data = validated_data.pop('categories', None)
        countries_data = validated_data.pop('countries', None)
        
        if validated_data.get('access_type', instance.access_type) != 'purchase':
            validated_data['purchase_price'] = None
        
        movie = super().update(instance, validated_data)
        
        if series_types_data is not None:
            movie.series_types.set(series_types_data)
        if genres_data is not None:
            movie.genres.set(genres_data)
        if categories_data is not None:
            movie.categories.set(categories_data)
        if countries_data is not None:
            movie.countries.set(countries_data)
        
        self._handle_video(movie, is_update=True)
        return movie
    
    def _handle_video(self, movie, is_update=False):
        """Handle video upload"""
        if movie.bunny_video_id:
            movie.video_file = BunnyStreamService.get_embed_url(movie.bunny_video_id)
            movie.save(update_fields=['video_file'])
        elif movie.video_upload:
            self._upload_to_bunny(movie)
    
    def _upload_to_bunny(self, movie):
        """Upload video to Bunny Stream"""
        local_path = movie.video_upload.path
        
        guid = BunnyStreamService.create_video(movie.title)
        if not guid:
            raise serializers.ValidationError({
                'video_upload': 'Failed to create video on Bunny Stream.'
            })
        
        success = BunnyStreamService.upload_video(guid, local_path)
        if not success:
            raise serializers.ValidationError({
                'video_upload': 'Failed to upload video to Bunny Stream.'
            })
        
        movie.bunny_video_id = guid
        movie.video_file = BunnyStreamService.get_embed_url(guid)
        movie.video_upload.delete(save=False)
        movie.save(update_fields=['bunny_video_id', 'video_file', 'video_upload'])


class MovieVideoUploadInitSerializer(serializers.Serializer):
    """Serializer for initiating video upload"""
    title = serializers.CharField(max_length=255)
    
    def create(self, validated_data):
        guid = BunnyStreamService.create_video(validated_data['title'])
        if not guid:
            raise serializers.ValidationError(
                "Failed to create video slot on Bunny Stream."
            )
        return BunnyStreamService.get_tus_upload_credentials(guid)


# ============================================================
# EPISODE SERIALIZER
# ============================================================

class EpisodeSerializer(serializers.ModelSerializer):
    """Episode serializer"""
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    
    class Meta:
        model = Episode
        fields = [
            'id', 'movie', 'movie_title', 'title', 'episode_number',
            'description', 'video_file', 'bunny_video_id',
            'duration', 'thumbnail', 'view_count', 'is_active',
            'created_at', 'updated_at',
        ]


# ============================================================
# HERO BANNER SERIALIZERS
# ============================================================

class HeroBannerSerializer(serializers.ModelSerializer):
    """Full banner serializer with movie details"""
    movie_id = serializers.IntegerField(source='movie.id', read_only=True, allow_null=True)
    movie_title = serializers.CharField(source='movie.title', read_only=True, allow_null=True)
    movie_slug = serializers.CharField(source='movie.slug', read_only=True, allow_null=True)
    movie_poster = serializers.SerializerMethodField()
    movie_rating = serializers.SerializerMethodField()
    movie_year = serializers.SerializerMethodField()
    link_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = HeroBanner
        fields = [
            'id', 'title', 'subtitle', 'image', 'image_url',
            'link_type', 'movie', 'movie_id', 'external_url', 'link_url',
            'movie_title', 'movie_slug', 'movie_poster',
            'movie_rating', 'movie_year',
            'order', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get full image URL"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_movie_poster(self, obj):
        """Get movie poster URL"""
        if obj.movie and obj.movie.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.movie.poster.url)
            return obj.movie.poster.url
        return None
    
    def get_movie_rating(self, obj):
        """Get movie rating"""
        if obj.movie and obj.movie.rating:
            return float(obj.movie.rating)
        return None
    
    def get_movie_year(self, obj):
        """Get movie release year"""
        if obj.movie and obj.movie.release_date:
            return obj.movie.release_date.year
        return None
    
    def get_link_url(self, obj):
        """Get banner link URL"""
        return obj.get_link_url()


class HeroBannerCreateUpdateSerializer(serializers.ModelSerializer):
    """Simplified serializer for banner create/update"""
    
    class Meta:
        model = HeroBanner
        fields = [
            'title', 'subtitle', 'image',
            'link_type', 'movie', 'external_url',
            'order', 'is_active',
        ]
    
    def validate(self, data):
        link_type = data.get('link_type', 'movie')
        movie = data.get('movie')
        external_url = data.get('external_url')
        
        if link_type == 'movie' and not movie:
            raise serializers.ValidationError({
                'movie': 'Please select a movie.'
            })
        
        if link_type == 'external' and not external_url:
            raise serializers.ValidationError({
                'external_url': 'Please provide an external URL.'
            })
        
        return data

# ============================================================
# EPISODE ADMIN SERIALIZER
# ============================================================

class EpisodeAdminSerializer(serializers.ModelSerializer):
    """
    Admin CRUD serializer for Episode.

    Video handling mirrors MovieAdminSerializer: the frontend uploads
    directly to Bunny Stream via TUS (using the same
    /api/admin/movies/init-video-upload/ endpoint), then sends back
    just the resulting bunny_video_id. This serializer turns that
    bunny_video_id into a playable embed URL on save — no video bytes
    ever pass through this serializer or the Django server.
    """
    movie_title = serializers.CharField(source='movie.title', read_only=True)

    class Meta:
        model = Episode
        fields = [
            'id', 'movie', 'movie_title', 'title', 'episode_number',
            'description', 'video_file', 'bunny_video_id',
            'duration', 'thumbnail', 'view_count', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'view_count', 'video_file', 'created_at', 'updated_at']
        extra_kwargs = {
            'bunny_video_id': {'required': False, 'allow_blank': True, 'allow_null': True},
            'thumbnail': {'required': False},
            'description': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        episode = super().create(validated_data)
        self._sync_video_file(episode)
        return episode

    def update(self, instance, validated_data):
        episode = super().update(instance, validated_data)
        self._sync_video_file(episode)
        return episode

    def _sync_video_file(self, episode):
        """
        If bunny_video_id is set (from a completed TUS upload on the
        frontend), (re)generate the video_file embed URL from it.
        """
        if episode.bunny_video_id:
            episode.video_file = BunnyStreamService.get_embed_url(episode.bunny_video_id)
            episode.save(update_fields=['video_file'])