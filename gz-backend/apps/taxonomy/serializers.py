# apps/taxonomy/serializers.py
from rest_framework import serializers
from .models import Genre, Country, Category, Cast, Crew, SeriesType


class UsageCountMixin(serializers.ModelSerializer):
    """
    Adds a read-only `movies_count` field to any taxonomy serializer whose
    model has a `movies` related_name (Genre, Country, Category, SeriesType
    all do — see apps/movies/models.py: Movie.genres/countries/categories/
    series_types all use related_name='movies').

    The frontend uses this to:
      - show "used by N titles" next to each tag
      - block delete when count > 0
    """
    movies_count = serializers.SerializerMethodField()

    def get_movies_count(self, obj):
        return obj.movies.count()


class GenreSerializer(UsageCountMixin):
    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug', 'movies_count']


class CountrySerializer(UsageCountMixin):
    class Meta:
        model = Country
        fields = ['id', 'name', 'slug', 'flag', 'movies_count']


class CategorySerializer(UsageCountMixin):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'movies_count']


class SeriesTypeSerializer(UsageCountMixin):
    class Meta:
        model = SeriesType
        fields = ['id', 'name', 'slug', 'flag', 'movies_count']


class CastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cast
        fields = ['id', 'name', 'photo', 'character_name']


class CrewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crew
        fields = ['id', 'name', 'role', 'photo']