# apps/taxonomy/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from .models import Genre, Category, Country, SeriesType
from .serializers import (
    GenreSerializer,
    CategorySerializer,
    CountrySerializer,
    SeriesTypeSerializer,
)


class ProtectedTaxonomyDeleteMixin:
    """
    Blocks hard-deletion of a taxonomy term (Genre / Category / Country /
    SeriesType) while it is still attached to any Movie.

    Rationale: these terms are referenced by Movie.<field> ManyToMany
    relations. Deleting a term that's still in use would silently strip
    that tag off every movie using it, with no audit trail and no way to
    undo it. Big catalog products (Shopify collections, WordPress terms,
    Netflix-style admin tools) all require you to detach content from a
    term before the term itself can be deleted.

    To actually remove an in-use term, an admin must first remove it from
    every movie (via the movie edit form, or a future bulk-reassign tool),
    then delete it here.
    """

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        usage_count = instance.movies.count()

        if usage_count > 0:
            return Response(
                {
                    "detail": (
                        f"មិនអាចលុប \"{instance.name}\" បានទេ ព្រោះកំពុងប្រើប្រាស់ដោយ "
                        f"{usage_count} រឿង។ សូមដកវាចេញពីរឿងទាំងនោះជាមុនសិន។"
                    ),
                    "code": "taxonomy_in_use",
                    "movies_count": usage_count,
                },
                status=status.HTTP_409_CONFLICT,
            )

        return super().destroy(request, *args, **kwargs)


class GenreViewSet(ProtectedTaxonomyDeleteMixin, viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


class CategoryViewSet(ProtectedTaxonomyDeleteMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


class CountryViewSet(ProtectedTaxonomyDeleteMixin, viewsets.ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


class SeriesTypeViewSet(ProtectedTaxonomyDeleteMixin, viewsets.ModelViewSet):
    queryset = SeriesType.objects.all()
    serializer_class = SeriesTypeSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]