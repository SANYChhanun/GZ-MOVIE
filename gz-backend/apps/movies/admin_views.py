from rest_framework import viewsets, permissions, mixins
from .models import Movie
from .serializers import MovieListSerializer   # ឬ MovieAdminSerializer

class MovieAdminViewSet(mixins.ListModelMixin,
                        mixins.UpdateModelMixin,   # PATCH/PUT
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    queryset = Movie.objects.all().order_by('-release_date')
    serializer_class = MovieListSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None