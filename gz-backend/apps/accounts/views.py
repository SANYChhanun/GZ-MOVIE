# apps/accounts/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from .serializers import (
    UserSerializer, 
    CustomTokenObtainPairSerializer, 
    UserProfileSerializer
)
from .permissions import IsAdminUser

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint that returns JWT with role and VIP info"""
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get/Update current user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """Admin only: List all users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class CheckVIPStatusView(APIView):
    """Check if current user has VIP status"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        is_vip = user.has_active_subscription()
        
        response_data = {
            'is_vip': is_vip,
            'role': user.role,
        }
        
        if is_vip:
            active_sub = user.subscriptions.filter(
                is_active=True,
                expires_at__gt=timezone.now()
            ).first()
            response_data['subscription'] = {
                'expires_at': active_sub.expires_at,
                'days_remaining': (active_sub.expires_at - timezone.now()).days
            }
        
        return Response(response_data)


class RegisterView(generics.CreateAPIView):
    """Register new user"""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
    
    def perform_create(self, serializer):
        user = serializer.save()
        user.set_password(self.request.data.get('password'))
        user.save()


class UserRoleUpdateView(generics.UpdateAPIView):
    """Admin only: Update user role"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]  # កែត្រង់នេះ
    lookup_field = 'pk'