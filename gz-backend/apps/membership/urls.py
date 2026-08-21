# apps/membership/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MembershipPlanViewSet

router = DefaultRouter()
router.register(r'plans', MembershipPlanViewSet, basename='membership-plan')

urlpatterns = [
    path('', include(router.urls)),
]