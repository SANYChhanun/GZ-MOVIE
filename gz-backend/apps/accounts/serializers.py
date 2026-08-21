# apps/accounts/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Subscription, Device

User = get_user_model()


# ============================================================
# BASIC SERIALIZERS
# ============================================================

class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer"""
    is_vip = serializers.SerializerMethodField()
    wallet_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'avatar',
            'role', 'is_staff', 'is_superuser',  # ✅ បន្ថែម
            'is_vip', 'wallet_balance',
            'is_phone_verified', 'is_email_verified',
            'is_suspended',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'role', 'is_staff', 'is_superuser', 'is_suspended',
            'created_at', 'updated_at',
        ]
    
    def get_is_vip(self, obj):
        return obj.has_active_subscription()
    
    def get_wallet_balance(self, obj):
        return obj.get_wallet_balance()


# ============================================================
# AUTH SERIALIZERS
# ============================================================

class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration"""
    username = serializers.CharField(required=False)
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(min_length=6, write_only=True)
    password_confirm = serializers.CharField(min_length=6, write_only=True)
    
    def validate(self, data):
        # ពិនិត្យ password និង password_confirm
        if data['password'] != data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match'
            })
        
        # ពិនិត្យ email uniqueness
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                'email': 'Email already registered'
            })
        
        # ពិនិត្យ phone uniqueness
        if data.get('phone') and User.objects.filter(phone=data['phone']).exists():
            raise serializers.ValidationError({
                'phone': 'Phone number already registered'
            })
        
        return data
    
    def create(self, validated_data):
        # ដក password_confirm ចេញ
        validated_data.pop('password_confirm', None)
        
        # បង្កើត username បើមិនមាន
        if not validated_data.get('username'):
            validated_data['username'] = validated_data['email'].split('@')[0]
        
        # បង្កើត user
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer ដែលអាច login ជាមួយ username ឬ email"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['role'] = user.role
        token['is_vip'] = user.has_active_subscription()
        token['email'] = user.email
        token['user_id'] = user.id
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        
        return token
    
    def validate(self, attrs):
        # កែឱ្យ login បានជាមួយ username ឬ email
        username = attrs.get('username', '')
        
        # បើជា email ស្វែងរក username ពិត
        if '@' in username:
            try:
                user = User.objects.get(email=username)
                attrs['username'] = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'error': 'Invalid credentials'
                })
        
        data = super().validate(attrs)
        
        # បន្ថែម user data ទៅក្នុង response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'phone': self.user.phone,
            'avatar': self.user.avatar.url if self.user.avatar else None,
            'role': self.user.role,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
            'is_vip': self.user.has_active_subscription(),
            'wallet_balance': self.user.get_wallet_balance(),
        }
        
        return data


# ============================================================
# PROFILE SERIALIZERS
# ============================================================

class UserProfileSerializer(serializers.ModelSerializer):
    """Detailed user profile - កែឱ្យសាមញ្ញ និងមិនខូច"""
    is_vip = serializers.SerializerMethodField()
    wallet_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'avatar',
            'role', 'is_staff', 'is_superuser',
            'is_vip', 'wallet_balance',
            'is_phone_verified', 'is_email_verified',
            'is_suspended',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields
    
    def get_is_vip(self, obj):
        """Check if user is VIP"""
        try:
            return obj.has_active_subscription()
        except:
            return False
    
    def get_wallet_balance(self, obj):
        """Get user's wallet balance"""
        try:
            return obj.get_wallet_balance()
        except:
            return 0

# ============================================================
# DEVICE SERIALIZERS
# ============================================================

class DeviceSerializer(serializers.ModelSerializer):
    """Device serializer"""
    
    class Meta:
        model = Device
        fields = [
            'id', 'device_id', 'device_name', 'device_type',
            'ip_address', 'last_login_at', 'is_active',
        ]
        read_only_fields = ['id', 'last_login_at', 'is_active']


# ============================================================
# PASSWORD SERIALIZERS
# ============================================================

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=6, write_only=True)
    confirm_password = serializers.CharField(min_length=6, write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match'
            })
        return data


# ============================================================
# VERIFICATION SERIALIZERS
# ============================================================

class PhoneVerifySerializer(serializers.Serializer):
    """Serializer for phone verification"""
    phone = serializers.CharField()
    otp_code = serializers.CharField(max_length=6)


class EmailVerifySerializer(serializers.Serializer):
    """Serializer for email verification"""
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)