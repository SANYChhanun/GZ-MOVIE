# apps/movies/admin_views.py
from rest_framework import viewsets, permissions, mixins
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Movie
from .serializers import MovieAdminSerializer


class AdminCRUDViewSet(mixins.ListModelMixin,
                        mixins.CreateModelMixin,
                        mixins.UpdateModelMixin,   # PATCH/PUT
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    Generic list/create/update/destroy base for admin-only resources.
    Subclasses MUST set their own `queryset` and `serializer_class`
    (Genre, Category, Movie, ...).
    """
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None


class MovieAdminViewSet(AdminCRUDViewSet):
    queryset = Movie.objects.all().order_by('-release_date')
    serializer_class = MovieAdminSerializer
    # Explicit multipart/form parsers so `poster` (image) and `video_upload`
    # (video) both arrive as real file objects on request.FILES. The actual
    # Bunny Stream upload now happens inside MovieAdminSerializer.create()/
    # update() (see video_upload field there) -- this viewset no longer needs
    # a separate upload-video action.
    parser_classes = [MultiPartParser, FormParser, JSONParser]