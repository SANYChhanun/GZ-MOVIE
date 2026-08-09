# movies/serializers.py
from rest_framework import serializers
from .models import Movie, Episode, Genre, Category, Cast, Crew
from django.utils import timezone
from django.utils.text import slugify


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class CastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cast
        fields = ['id', 'name', 'photo', 'character_name']


class CrewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crew
        fields = ['id', 'name', 'role', 'photo']


class EpisodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Episode
        fields = ['id', 'episode_number', 'title', 'description', 'duration', 'video_file_id', 'thumbnail']


class MovieListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views (browse, search).
    """
    genres = serializers.StringRelatedField(many=True)
    categories = serializers.StringRelatedField(many=True)

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'slug', 'short_description', 'release_date',
            'poster', 'duration', 'access_type', 'purchase_price',
            'rating', 'is_featured', 'is_new_release',
            'genres', 'categories',
        ]


class MovieAdminSerializer(serializers.ModelSerializer):
    """Writable serializer for the admin movie form."""
    synopsis = serializers.CharField(source='description', required=False, default='', allow_blank=True)
    release_date = serializers.DateField(required=False, default=timezone.localdate)
    duration_minutes = serializers.IntegerField(source='duration', required=False, default=0)
    country = serializers.CharField(required=False, default='Unknown')
    language = serializers.CharField(required=False, default='Unknown')
    genres = serializers.PrimaryKeyRelatedField(queryset=Genre.objects.all(), many=True, required=False)
    categories = CategorySerializer(many=True, read_only=True)
    # field សម្រាប់ save ពេល create/edit (ផ្ញើ id list ចូល)
    category_ids = serializers.PrimaryKeyRelatedField(
        source="categories", queryset=Category.objects.all(),
        many=True, write_only=True, required=False,
    )

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'synopsis', 'release_date', 'duration_minutes',
            'rating', 'access_type', 'is_active', 'poster', 'video_file',
            'country', 'language', 'genres', 'categories', 'category_ids',
        ]

    def create(self, validated_data):
        validated_data['slug'] = self._unique_slug(validated_data['title'])
        return super().create(validated_data)

    def _unique_slug(self, title):
        base_slug = slugify(title) or 'movie'
        candidate = base_slug
        suffix = 2
        while Movie.objects.filter(slug=candidate).exists():
            candidate = f'{base_slug}-{suffix}'
            suffix += 1
        return candidate


class MovieDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for the detail page. Includes nested episodes, cast, crew.
    """
    genres = GenreSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    cast = CastSerializer(many=True, read_only=True)
    crew = CrewSerializer(many=True, read_only=True)
    episodes = EpisodeSerializer(many=True, read_only=True)
    # Access control flags will be handled in the view/permissions; we still include access_type.
    # Include a field to indicate if the user has access (we'll set it dynamically).
    user_has_access = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = '__all__'

    def get_user_has_access(self, obj):
        """Determine if the current request user can watch this movie.
        The logic is placed here for convenience, but real access control happens in the streaming token view.
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return obj.is_free  # anonymous can only view free
        user = request.user
        # Check VIP status for member-only content
        if obj.is_membership_required:
            from apps.membership.services.membership_service import MembershipService
            if MembershipService.is_vip(user):
                return True
        # Check purchase for PPV content
        if obj.is_purchase_required:
            from apps.purchases.models import MoviePurchase
            if MoviePurchase.objects.filter(user=user, movie=obj, valid_until__gte=timezone.now()).exists():
                return True
        # Free or already handled
        return obj.is_free