import django_filters
from .models import Movie, Genre, Category


class MovieFilter(django_filters.FilterSet):
    genre = django_filters.ModelMultipleChoiceFilter(
        field_name='genres__slug',
        to_field_name='slug',
        queryset=Genre.objects.all(),
        label='Genre slug(s)',
    )
    category = django_filters.ModelMultipleChoiceFilter(
        field_name='categories__slug',
        to_field_name='slug',
        queryset=Category.objects.all(),
        label='Category slug(s)',
    )
    year = django_filters.NumberFilter(field_name='release_date', lookup_expr='year')
    country = django_filters.CharFilter(field_name='country', lookup_expr='icontains')
    language = django_filters.CharFilter(field_name='language', lookup_expr='icontains')
    access_type = django_filters.ChoiceFilter(choices=Movie.ACCESS_TYPE_CHOICES)
    is_new_release = django_filters.BooleanFilter()
    is_featured = django_filters.BooleanFilter()

    class Meta:
        model = Movie
        fields = ['genre', 'category', 'year', 'country', 'language', 'access_type', 'is_new_release', 'is_featured']