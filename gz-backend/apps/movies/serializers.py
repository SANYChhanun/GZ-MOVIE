# apps/movies/serializers.py
from django.utils.text import slugify
from rest_framework import serializers
from .models import Movie, Episode, HeroBanner
from .services.bunny_service import BunnyStreamService
from apps.taxonomy.serializers import GenreSerializer, CategorySerializer
# Genre/Category/Cast/Crew moved to apps.taxonomy -- import their
# serializers from there instead of defining local duplicates.
from apps.taxonomy.serializers import (
    GenreSerializer,
    CategorySerializer,
    CastSerializer,
    CrewSerializer,
)
from apps.taxonomy.models import Genre, Category


# ============================================================
# MOVIE SERIALIZERS
# ============================================================

class MovieListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for movie list view"""
    genres = GenreSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    poster_url = serializers.SerializerMethodField()
    backdrop_url = serializers.SerializerMethodField()
    poster = serializers.SerializerMethodField()  # ← បន្ថែម (alias សម្រាប់ compatibility)
    backdrop = serializers.SerializerMethodField()  # ← បន្ថែម (alias សម្រាប់ compatibility)
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'slug', 'short_description',
            'poster', 'backdrop', 'poster_url', 'backdrop_url',  # ← បន្ថែមទាំងពីរ
            'release_date', 'duration',
            'rating', 'view_count', 'access_type',
            'genres', 'categories', 'is_featured', 'is_new_release',
            'country', 'language',
        ]
    
    def get_poster_url(self, obj):
        if obj.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.poster.url)
            return obj.poster.url
        return None
    
    def get_backdrop_url(self, obj):
        if obj.backdrop:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.backdrop.url)
            return obj.backdrop.url
        return None
    
    # បន្ថែម methods ទាំងពីរនេះ (alias)
    def get_poster(self, obj):
        return self.get_poster_url(obj)
    
    def get_backdrop(self, obj):
        return self.get_backdrop_url(obj)


# apps/movies/serializers.py

# apps/movies/serializers.py

class MovieDetailSerializer(serializers.ModelSerializer):
    """Full movie detail with genres, cast, crew, episodes."""
    genres = GenreSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    cast = CastSerializer(many=True, read_only=True)
    crew = CrewSerializer(many=True, read_only=True)
    rating = serializers.SerializerMethodField()
    year = serializers.SerializerMethodField()
    episode_count = serializers.SerializerMethodField()
    video_file = serializers.SerializerMethodField()
    poster = serializers.SerializerMethodField()  # ← បន្ថែម
    backdrop = serializers.SerializerMethodField()  # ← បន្ថែម
    poster_url = serializers.SerializerMethodField()
    backdrop_url = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'slug',
            'description', 'short_description',
            'poster', 'backdrop',  # ← ឥឡូវមាន methods សម្រាប់ទាំងពីរនេះ
            'poster_url', 'backdrop_url',
            'release_date', 'year', 'duration',
            'rating', 'view_count',
            'access_type', 'is_new_release', 'is_featured',
            'genres', 'categories', 'cast', 'crew',
            'country', 'language',
            'trailer_url',
            'video_file',
            'bunny_video_id', 
            'purchase_price',
            'episode_count',
            'created_at', 'updated_at',
        ]

    def get_rating(self, obj):
        if obj.rating:
            return float(obj.rating)
        return None

    def get_year(self, obj):
        if obj.release_date:
            return obj.release_date.year
        return None

    # បន្ថែម methods ទាំងពីរនេះ
    def get_poster(self, obj):
        if obj.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.poster.url)
            return obj.poster.url
        return None

    def get_backdrop(self, obj):
        if obj.backdrop:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.backdrop.url)
            return obj.backdrop.url
        return None

    def get_poster_url(self, obj):
        if obj.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.poster.url)
            return obj.poster.url
        return None

    def get_backdrop_url(self, obj):
        if obj.backdrop:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.backdrop.url)
            return obj.backdrop.url
        return None

    def _user_can_watch(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        
        # Free movies - everyone can watch
        if obj.access_type == 'free':
            return True
        
        # Not logged in
        if not user or not user.is_authenticated:
            return False
        
        # Member/VIP access
        if obj.access_type == 'member':
            return getattr(user, 'has_active_membership', lambda: False)()
        
        # Purchase access
        if obj.access_type == 'purchase':
            return getattr(user, 'has_purchased', lambda m: False)(obj)
        
        return False

    def get_video_file(self, obj):
        """
        ✅ ប្រគល់ video_file ជានិច្ច (សម្រាប់សាកល្បង)
        បន្ទាប់ពីសាកល្បងរួច អាចប្តូរទៅប្រើ _user_can_watch វិញ
        """
        # ✅ FORCE: return video file regardless of permissions
        # នេះគ្រាន់តែសម្រាប់សាកល្បងប៉ុណ្ណោះ
        return obj.video_file
        
        # ❌ ប្រសិនបើចង់ប្រើ permission សូមប្រើកូដខាងក្រោម
        # if self._user_can_watch(obj):
        #     return obj.video_file
        # return None

    def get_episode_count(self, obj):
        return obj.episodes.filter(is_active=True).count()


class MovieAdminSerializer(serializers.ModelSerializer):
    """
    Admin CRUD serializer for MovieAdminViewSet (list/create/update/destroy).

    Video handling — TWO supported paths:

    1. NEW / preferred path (direct-to-Bunny, TUS resumable):
       The frontend calls MovieAdminViewSet.init_video_upload() FIRST to
       get TUS credentials, uploads the video file straight to Bunny
       Stream from the browser (no video bytes ever hit this server —
       see bunny_service.py's get_tus_upload_credentials() docstring for
       why this matters on large files / flaky connections), and only
       then sends this serializer a plain `bunny_video_id` string in the
       same create/update payload as the rest of the movie's fields.
       create()/update() below just derive `video_file` (the playable
       embed URL) from that GUID — no upload happens here at all.

    2. LEGACY / fallback path (server-relay upload):
       The client instead uploads a raw file under `video_upload` (a
       real FileField on the model, saved locally by Django first).
       create()/update() detect this and push that local file to Bunny
       Stream themselves via BunnyStreamService, populate
       `bunny_video_id` + `video_file`, then delete the local copy. This
       still works for small files or the Django admin site
       (apps/movies/admin.py uses the same classmethods), but for large
       videos (multi-GB) it blocks the request for the full upload
       duration and has no resume support if the connection drops — the
       TUS path above is what the React admin panel should use for
       anything sizeable.

    `slug` is read-only and auto-generated from `title` on create, since
    the admin form doesn't collect it.
    """

    genres = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Genre.objects.all(), required=False
    )
    categories = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Category.objects.all(), required=False
    )

    def to_representation(self, instance):
        """
        Write side stays PK-only (form posts `categories=3&categories=5`).
        Read side (GET list/retrieve) instead returns full {id, name, slug}
        objects for genres/categories/cast/crew so the admin table/detail
        drawer can show real names without a second lookup request.
        """
        rep = super().to_representation(instance)
        rep['genres'] = GenreSerializer(instance.genres.all(), many=True).data
        rep['categories'] = CategorySerializer(instance.categories.all(), many=True).data
        rep['cast'] = CastSerializer(instance.cast.all(), many=True).data
        rep['crew'] = CrewSerializer(instance.crew.all(), many=True).data
        return rep

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'release_date', 'country', 'language', 'duration',
            'poster', 'backdrop',
            'trailer_url', 'video_file', 'bunny_video_id', 'video_upload',
            'access_type', 'purchase_price',
            'rating', 'view_count',
            'is_featured', 'is_new_release', 'is_active',
            'genres', 'categories', 'cast', 'crew',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'slug', 'rating', 'view_count', 'created_at', 'updated_at',
            # video_file is always derived (either here or in
            # _upload_to_bunny) from a bunny_video_id -- never accepted
            # as raw client input.
            'video_file',
        ]
        extra_kwargs = {
            'video_upload': {'required': False, 'write_only': True},
            # Writable now: the TUS path (path 1 above) sets this
            # directly once the browser's direct-to-Bunny upload
            # finishes. Still populated automatically by the legacy
            # path (path 2) when video_upload is used instead.
            'bunny_video_id': {'required': False, 'allow_blank': True, 'allow_null': True},
            'poster': {'required': False},
            'backdrop': {'required': False},
            'purchase_price': {'required': False, 'allow_null': True},
            'trailer_url': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    # ---- slug auto-generation -------------------------------------------------

    def validate(self, data):
        access_type = data.get(
            'access_type',
            getattr(self.instance, 'access_type', None) or 'free'
        )
        purchase_price = data.get(
            'purchase_price',
            getattr(self.instance, 'purchase_price', None)
        )
        if access_type == 'purchase' and not purchase_price:
            raise serializers.ValidationError(
                {'purchase_price': 'Required when access type is Pay Per View.'}
            )
        return data

    # ---- Legacy server-relay upload (path 2) -------------------------------


    def _upload_to_bunny(self, movie):
        local_path = movie.video_upload.path

        guid = BunnyStreamService.create_video(movie.title)
        if not guid:
            raise serializers.ValidationError(
                {'video_upload': 'Failed to create video on Bunny Stream. Check BUNNY_STREAM_API_KEY / BUNNY_STREAM_LIBRARY_ID.'}
            )

        success = BunnyStreamService.upload_video(guid, local_path)
        if not success:
            raise serializers.ValidationError(
                {'video_upload': 'Failed to upload video to Bunny Stream. Check server logs for details.'}
            )

        movie.bunny_video_id = guid
        movie.video_file = BunnyStreamService.get_embed_url(guid)
        # Drop the local copy now that Bunny has it -- comment out the next line if
        # you'd rather keep a local backup of every uploaded video.
        movie.video_upload.delete(save=False)
        movie.save(update_fields=['bunny_video_id', 'video_file', 'video_upload'])

    # ---- New direct-to-Bunny path (path 1) ---------------------------------

    def _finalize_from_bunny_video_id(self, movie):
        """
        The browser already uploaded the video straight to Bunny via TUS
        and we just received the resulting GUID as `bunny_video_id` on
        this movie. Just derive the embed URL -- no upload to do here.
        """
        movie.video_file = BunnyStreamService.get_embed_url(movie.bunny_video_id)
        movie.save(update_fields=['video_file'])

    # ---- create / update ----------------------------------------------------

def create(self, validated_data):
        print("🔍 Creating movie with data:", validated_data.keys())
        print("🔍 bunny_video_id:", validated_data.get('bunny_video_id'))
        
        movie = super().create(validated_data)
        
        # ✅ ប្រសិនបើមាន bunny_video_id ពី Frontend
        if movie.bunny_video_id:
            print(f"✅ New TUS path - bunny_video_id: {movie.bunny_video_id}")
            self._finalize_from_bunny_video_id(movie)
        elif movie.video_upload:
            # Legacy upload path
            print("📤 Legacy upload path...")
            self._upload_to_bunny(movie)
        else:
            print("⚠️ No video provided")
        
        return movie

def update(self, instance, validated_data):
        print("🔍 Updating movie with data:", validated_data.keys())
        print("🔍 bunny_video_id:", validated_data.get('bunny_video_id'))
        
        got_new_video_file = bool(validated_data.get('video_upload'))
        got_new_bunny_id = (
            'bunny_video_id' in validated_data
            and validated_data['bunny_video_id']
            and validated_data['bunny_video_id'] != instance.bunny_video_id
        )
        got_video_cleared = (
            'bunny_video_id' in validated_data
            and not validated_data['bunny_video_id']
        )

        movie = super().update(instance, validated_data)

        if got_new_video_file and movie.video_upload:
            print("📤 Legacy upload path...")
            self._upload_to_bunny(movie)
        elif got_new_bunny_id:
            print(f"✅ New TUS path - bunny_video_id: {movie.bunny_video_id}")
            self._finalize_from_bunny_video_id(movie)
        elif got_video_cleared:
            print("🗑️ Clearing video")
            movie.video_file = None
            movie.save(update_fields=['video_file'])

        return movie


class MovieVideoUploadInitSerializer(serializers.Serializer):
    """
    Step 1 of the direct-to-Bunny (TUS) upload flow.

    The admin panel calls MovieAdminViewSet.init_video_upload() with just
    a title; we create a video "slot" on Bunny Stream and hand back the
    signed TUS credentials the browser needs to upload the actual file
    bytes straight to Bunny -- this server never touches them.

    After that upload finishes client-side, the frontend sends the
    resulting `video_id` (guid) back as `bunny_video_id` in a normal
    create/update call to MovieAdminSerializer above.
    """
    title = serializers.CharField(max_length=255)

    def create(self, validated_data):
        guid = BunnyStreamService.create_video(validated_data['title'])
        if not guid:
            raise serializers.ValidationError(
                "Failed to create video slot on Bunny Stream. "
                "Check BUNNY_STREAM_API_KEY / BUNNY_STREAM_LIBRARY_ID."
            )
        return BunnyStreamService.get_tus_upload_credentials(guid)


# ============================================================
# EPISODE SERIALIZER
# ============================================================

class EpisodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Episode
        fields = '__all__'


# ============================================================
# HERO BANNER SERIALIZERS
# ============================================================

class HeroBannerSerializer(serializers.ModelSerializer):
    """Full banner serializer with movie details."""
    movie_id = serializers.IntegerField(source='movie.id', read_only=True, allow_null=True)
    movie_title = serializers.CharField(source='movie.title', read_only=True, allow_null=True)
    movie_slug = serializers.CharField(source='movie.slug', read_only=True, allow_null=True)
    movie_poster = serializers.SerializerMethodField()
    movie_rating = serializers.SerializerMethodField()
    movie_year = serializers.SerializerMethodField()
    link_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()  # ← បន្ថែមនេះ

    class Meta:
        model = HeroBanner
        fields = [
            'id', 'title', 'subtitle', 'image',
            'link_type', 'link', 'link_url',
            'movie_id', 'movie_title', 'movie_slug',
            'movie_poster', 'movie_rating', 'movie_year',
            'external_url',
            'order', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_image(self, obj):  # ← បន្ថែម method នេះ
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_movie_poster(self, obj):
        if obj.movie and obj.movie.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.movie.poster.url)
            return obj.movie.poster.url
        return None

    def get_movie_rating(self, obj):
        if obj.movie and obj.movie.rating:
            return float(obj.movie.rating)
        return None

    def get_movie_year(self, obj):
        if obj.movie and obj.movie.release_date:
            return obj.movie.release_date.year
        return None

    def get_link_url(self, obj):
        if obj.link_type == 'movie' and obj.movie_id:
            return f"/watch/{obj.movie_id}"
        elif obj.link_type == 'external' and obj.external_url:
            return obj.external_url
        return None


class HeroBannerCreateUpdateSerializer(serializers.ModelSerializer):
    """Simplified serializer for banner create/update."""

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
    