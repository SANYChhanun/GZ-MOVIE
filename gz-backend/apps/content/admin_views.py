# apps/content/admin_views.py
from rest_framework import viewsets, permissions, mixins, parsers
from .models import HeroBanner, Promotion
from .serializers import HeroBannerSerializer, PromotionSerializer

class HeroBannerAdminViewSet(mixins.CreateModelMixin,
                             mixins.ListModelMixin,
                             mixins.DestroyModelMixin,
                             viewsets.GenericViewSet,
                             mixins.UpdateModelMixin,
                             ):
    queryset = HeroBanner.objects.all().order_by('-id')
    serializer_class = HeroBannerSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    pagination_class = None

class PromotionAdminViewSet(mixins.CreateModelMixin,
                            mixins.ListModelMixin,
                            mixins.DestroyModelMixin,
                            mixins.UpdateModelMixin,
                            viewsets.GenericViewSet):
    queryset = Promotion.objects.all().order_by('-id')
    serializer_class = PromotionSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    pagination_class = None