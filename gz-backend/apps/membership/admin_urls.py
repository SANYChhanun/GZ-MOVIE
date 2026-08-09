# app/membership/admin_urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'membership-plans', views.MembershipPlanAdminViewSet, basename='membership-plan-admin')

urlpatterns = [
    path('', include(router.urls)),
]