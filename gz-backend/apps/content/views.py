from rest_framework import viewsets, permissions
from .models import HeroBanner, Promotion, FAQ, LegalPage
from .serializers import (
    HeroBannerSerializer,
    PromotionSerializer,
    FAQSerializer,
    LegalPageSerializer
)

class HeroBannerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HeroBanner.objects.filter(is_active=True).order_by('order', '-id')
    serializer_class = HeroBannerSerializer
    permission_classes = [permissions.AllowAny]

class PromotionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Promotion.objects.filter(is_active=True).order_by('-id')
    serializer_class = PromotionSerializer
    permission_classes = [permissions.AllowAny]

class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [permissions.AllowAny]

class LegalPageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LegalPage.objects.filter(is_active=True)
    serializer_class = LegalPageSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'