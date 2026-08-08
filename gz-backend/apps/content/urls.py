from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'banners', views.HeroBannerViewSet, basename='hero-banner')
router.register(r'promotions', views.PromotionViewSet, basename='promotion')
router.register(r'faqs', views.FAQViewSet, basename='faq')
router.register(r'legal', views.LegalPageViewSet, basename='legal')

urlpatterns = [
    path('', include(router.urls)),
]