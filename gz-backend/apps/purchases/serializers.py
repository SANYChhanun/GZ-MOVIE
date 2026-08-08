from rest_framework import serializers
from .models import MoviePurchase


class MoviePurchaseSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    movie_slug = serializers.CharField(source='movie.slug', read_only=True)

    class Meta:
        model = MoviePurchase
        fields = [
            'id', 'movie', 'movie_title', 'movie_slug',
            'amount', 'purchase_date', 'valid_until',
        ]
        read_only_fields = ['id', 'purchase_date', 'valid_until']


class PurchaseCreateSerializer(serializers.Serializer):
    movie_id = serializers.IntegerField(required=True)