# apps/accounts/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    is_vip = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'avatar', 
                  'role', 'is_vip', 'password',
                  'is_phone_verified', 'is_email_verified']
        read_only_fields = ['role']
    
    def get_is_vip(self, obj):
        return obj.has_active_subscription()
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Add custom claims to JWT token"""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['role'] = user.role
        token['is_vip'] = user.has_active_subscription()
        token['username'] = user.username
        token['user_id'] = user.id
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra data to response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'is_vip': self.user.has_active_subscription(),
        }
        
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Detailed user profile with subscription info"""
    active_subscription = serializers.SerializerMethodField()
    purchased_movies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'avatar', 'role',
                  'is_phone_verified', 'is_email_verified', 'created_at',
                  'active_subscription', 'purchased_movies_count']
        read_only_fields = ['role', 'created_at']
    
    def get_active_subscription(self, obj):
        active_sub = obj.subscriptions.filter(
            is_active=True, 
            expires_at__gt=timezone.now()
        ).first()
        if active_sub:
            return {
                'id': active_sub.id,
                'duration_days': active_sub.duration_days,
                'start_date': active_sub.start_date,
                'expires_at': active_sub.expires_at,
                'days_remaining': (active_sub.expires_at - timezone.now()).days
            }
        return None
    
    def get_purchased_movies_count(self, obj):
        from apps.purchases.models import MoviePurchase
        return MoviePurchase.objects.filter(
            user=obj,
            valid_until__gt=timezone.now()
        ).count()