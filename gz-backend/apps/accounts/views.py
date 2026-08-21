# apps/accounts/views.py
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer, 
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    DeviceSerializer,
)

User = get_user_model()


# ============================================================
# AUTHENTICATION VIEWS
# ============================================================

class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.save()
        
        # បង្កើត tokens ដោយស្វ័យប្រវត្តិបន្ទាប់ពី register
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """User login endpoint - អាច login ជាមួយ username ឬ email"""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class LogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class TokenRefreshView(APIView):
    """Refresh access token"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token),
            })
        except Exception as e:
            return Response({
                'error': 'Invalid refresh token'
            }, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    """Forgot password endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # មិនបង្ហាញថា email មានឬអត់ ដើម្បីសុវត្ថិភាព
            return Response({
                'message': 'If the email exists, a password reset link has been sent.'
            })
        
        # TODO: បង្កើត និងផ្ញើ password reset token
        # សម្រាប់ពេលនេះ គ្រាន់តែប្រគល់សារ
        return Response({
            'message': 'Password reset instructions sent to your email.'
        })


class ResetPasswordView(APIView):
    """Reset password endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uid, token, new_password]):
            return Response({
                'error': 'uid, token, and new_password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: ផ្ទៀងផ្ទាត់ token និងកំណត់ password ថ្មី
        return Response({
            'message': 'Password reset successful'
        })


# ============================================================
# PROFILE VIEWS
# ============================================================

class ProfileView(APIView):
    """User profile management"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """ទាញយកព័ត៌មាន profile"""
        try:
            serializer = UserProfileSerializer(request.user, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in ProfileView: {e}")
            # ប្រគល់ទិន្នន័យមូលដ្ឋាន បើមានបញ្ហា
            return Response({
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'phone': request.user.phone,
                'avatar': request.user.avatar.url if request.user.avatar else None,
                'role': request.user.role,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser,
                'is_vip': request.user.has_active_subscription(),
                'wallet_balance': request.user.get_wallet_balance(),
            })
    
    def patch(self, request):
        """ធ្វើបច្ចុប្បន្នភាព profile"""
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        """ធ្វើបច្ចុប្បន្នភាព profile (ទាំងមូល)"""
        serializer = UserSerializer(
            request.user,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change password endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        data = serializer.validated_data
        
        # ពិនិត្យ old password
        if not user.check_password(data['old_password']):
            return Response({
                'error': 'Invalid old password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # កំណត់ new password
        user.set_password(data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        })


# ============================================================
# DEVICE MANAGEMENT VIEWS
# ============================================================

class DeviceViewSet(viewsets.ViewSet):
    """Device management viewset"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """ទាញយកបញ្ជីឧបករណ៍ដែលសកម្ម"""
        devices = request.user.devices.filter(is_active=True)
        serializer = DeviceSerializer(devices, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """ចុះឈ្មោះឧបករណ៍ថ្មី"""
        device_id = request.data.get('device_id')
        device_name = request.data.get('device_name', 'Unknown Device')
        device_type = request.data.get('device_type', 'web')
        
        if not device_id:
            return Response({
                'error': 'device_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ពិនិត្យចំនួនឧបករណ៍សកម្ម
        active_count = request.user.devices.filter(is_active=True).count()
        if active_count >= 5:
            return Response({
                'error': 'Maximum device limit reached (5 devices)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # បង្កើត ឬធ្វើបច្ចុប្បន្នភាពឧបករណ៍
        device, created = request.user.devices.get_or_create(
            device_id=device_id,
            defaults={
                'device_name': device_name,
                'device_type': device_type,
                'ip_address': request.META.get('REMOTE_ADDR'),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'is_active': True,
            }
        )
        
        if not created:
            device.device_name = device_name
            device.device_type = device_type
            device.ip_address = request.META.get('REMOTE_ADDR')
            device.user_agent = request.META.get('HTTP_USER_AGENT', '')
            device.is_active = True
            device.save()
        
        return Response(
            DeviceSerializer(device).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def deactivate(self, request):
        """បិទឧបករណ៍"""
        device_id = request.data.get('device_id')
        
        if not device_id:
            return Response({
                'error': 'device_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            device = request.user.devices.get(device_id=device_id)
            device.deactivate()
            return Response({
                'message': 'Device deactivated successfully'
            })
        except request.user.devices.model.DoesNotExist:
            return Response({
                'error': 'Device not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def destroy(self, request, pk=None):
        """លុបឧបករណ៍"""
        try:
            device = request.user.devices.get(id=pk)
            device.delete()
            return Response({
                'message': 'Device removed successfully'
            })
        except request.user.devices.model.DoesNotExist:
            return Response({
                'error': 'Device not found'
            }, status=status.HTTP_404_NOT_FOUND)


# ============================================================
# ADMIN VIEWS
# ============================================================

class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin viewset សម្រាប់គ្រប់គ្រង users។
    មានតែ Admin ប៉ុណ្ណោះដែលអាចចូលប្រើបាន។
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # តម្រងតាម search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                username__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                phone__icontains=search
            )
        
        # តម្រងតាម role
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # តម្រងតាម status
        is_active = self.request.query_params.get('is_active', None)
        if is_active:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.select_related().prefetch_related('subscriptions', 'devices')
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """បញ្ឈប់គណនី user"""
        user = self.get_object()
        reason = request.data.get('reason', '')
        
        user.is_suspended = True
        user.suspended_reason = reason
        user.save()
        
        return Response({
            'message': f'User {user.username} suspended successfully'
        })
    
    @action(detail=True, methods=['post'])
    def unsuspend(self, request, pk=None):
        """ដោះការបញ្ឈប់គណនី user"""
        user = self.get_object()
        
        user.is_suspended = False
        user.suspended_reason = None
        user.save()
        
        return Response({
            'message': f'User {user.username} unsuspended successfully'
        })