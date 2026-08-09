# apps/accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),
    
    # User Profile
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('check-vip/', views.CheckVIPStatusView.as_view(), name='check_vip'),
]

# Admin only endpoints
urlpatterns += [
    path('admin/users/', views.UserListView.as_view(), name='admin_users'),
    path('admin/users/<int:pk>/role/', views.UserRoleUpdateView.as_view(), name='admin_user_role'),
]