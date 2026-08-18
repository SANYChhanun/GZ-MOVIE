from rest_framework import serializers
from .models import Genre, Country, Category, Cast, Crew, SeriesType  # ← បន្ថែម SeriesType import


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug']


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name', 'slug', 'flag']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


# ============ បន្ថែម SeriesTypeSerializer នៅទីនេះ ============
class SeriesTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeriesType
        fields = ['id', 'name', 'slug', 'flag']
# ============ បញ្ចប់ការបន្ថែម ============


class CastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cast
        fields = ['id', 'name', 'photo', 'character_name']


class CrewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crew
        fields = ['id', 'name', 'role', 'photo']