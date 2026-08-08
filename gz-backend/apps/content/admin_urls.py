# apps/content/admin_urls.py
from rest_framework.routers import DefaultRouter
from . import admin_views

router = DefaultRouter()
router.register(r'banners', admin_views.HeroBannerAdminViewSet, basename='admin-banner')
router.register(r'promotions', admin_views.PromotionAdminViewSet, basename='admin-promotion')

urlpatterns = router.urls