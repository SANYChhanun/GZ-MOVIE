# apps/purchases/serializers.py
from rest_framework import serializers
from .models import MoviePurchase


class MoviePurchaseSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    movie_slug = serializers.CharField(source='movie.slug', read_only=True)
    movie_poster = serializers.SerializerMethodField()
    days_remaining = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = MoviePurchase
        fields = [
            'id', 'movie', 'movie_title', 'movie_slug', 'movie_poster',
            'amount', 'purchase_date', 'valid_until',
            'days_remaining', 'is_expired',
            'transaction_id',
        ]
        read_only_fields = [
            'id', 'purchase_date', 'valid_until',
            'days_remaining', 'is_expired',
        ]
    
    def get_movie_poster(self, obj):
        if obj.movie.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.movie.poster.url)
            return obj.movie.poster.url
        return None


class PurchaseCreateSerializer(serializers.Serializer):
    movie_id = serializers.IntegerField(required=True)