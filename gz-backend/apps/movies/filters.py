# apps/movies/filters.py
import django_filters
from .models import Movie


class MovieFilter(django_filters.FilterSet):
    """Filter for Movie model"""
    
    # ប្រើ choices ពី model ត្រឹមត្រូវ
    access_type = django_filters.ChoiceFilter(
        choices=Movie.AccessType.choices  # ✅ ប្រើ AccessType ជំនួស ACCESS_TYPE_CHOICES
    )
    content_type = django_filters.ChoiceFilter(
        choices=Movie.ContentType.choices  # ✅ ប្រើ ContentType ជំនួស CONTENT_TYPE_CHOICES
    )
    
    # តម្រងតាម genre
    genre = django_filters.CharFilter(
        field_name='genres__slug',
        lookup_expr='iexact'
    )
    
    # តម្រងតាម category
    category = django_filters.CharFilter(
        field_name='categories__slug',
        lookup_expr='iexact'
    )
    
    # តម្រងតាម country
    country = django_filters.CharFilter(
        field_name='countries__slug',
        lookup_expr='iexact'
    )
    
    # តម្រងតាម series type
    series_type = django_filters.CharFilter(
        field_name='series_types__slug',
        lookup_expr='iexact'
    )
    
    # តម្រងតាម year
    year = django_filters.NumberFilter(
        field_name='release_date__year',
        lookup_expr='exact'
    )
    
    # តម្រងតាម rating អប្បបរមា
    min_rating = django_filters.NumberFilter(
        field_name='rating',
        lookup_expr='gte'
    )
    
    # តម្រងតាម rating អតិបរមា
    max_rating = django_filters.NumberFilter(
        field_name='rating',
        lookup_expr='lte'
    )
    
    # តម្រងតាម has_khmer_dub
    has_khmer_dub = django_filters.BooleanFilter(
        field_name='has_khmer_dub'
    )
    
    # តម្រងតាម has_khmer_sub
    has_khmer_sub = django_filters.BooleanFilter(
        field_name='has_khmer_sub'
    )
    
    class Meta:
        model = Movie
        fields = [
            'access_type',
            'content_type',
            'genre',
            'category',
            'country',
            'series_type',
            'year',
            'min_rating',
            'max_rating',
            'has_khmer_dub',
            'has_khmer_sub',
            'is_featured',
            'is_new_release',
            'is_active',
        ]