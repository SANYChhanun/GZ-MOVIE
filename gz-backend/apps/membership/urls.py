from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'plans', views.MembershipPlanViewSet, basename='membership-plan')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', views.UserMembershipViewSet.as_view({'get': 'me'}), name='membership-status'),
    path('subscribe/', views.UserMembershipViewSet.as_view({'post': 'subscribe'}), name='membership-subscribe'),
    path('cancel/', views.UserMembershipViewSet.as_view({'post': 'cancel'}), name='membership-cancel'),
]