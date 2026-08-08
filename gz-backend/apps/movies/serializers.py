# movies/serializers.py
from rest_framework import serializers
from .models import Movie, Episode, Genre, Category, Cast, Crew
from django.utils import timezone


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