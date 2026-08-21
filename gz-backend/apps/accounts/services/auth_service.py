# apps/accounts/services/auth_service.py
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    def register_user(email, password, username=None, phone=None, **extra_fields):
        """
        Register a new user.
        
        Returns:
            tuple: (user, error) - user if successful, error message if failed
        """
        try:
            with transaction.atomic():
                # Check if email already exists
                if User.objects.filter(email=email).exists():
                    return None, "Email already registered"
                
                # Check if phone already exists
                if phone and User.objects.filter(phone=phone).exists():
                    return None, "Phone number already registered"
                
                # Create user
                user = User.objects.create_user(
                    username=username or email.split('@')[0],
                    email=email,
                    password=password,
                    phone=phone,
                    **extra_fields
                )
                
                return user, None
                
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def generate_tokens(user):
        """Generate JWT tokens for user"""
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh['role'] = user.role
        refresh['is_vip'] = user.has_active_subscription()
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    
    @staticmethod
    def login_user(email_or_phone, password):
        """
        Login user with email or phone.
        
        Returns:
            tuple: (user, error) - user if successful, error message if failed
        """
        User = get_user_model()
        
        # Try to find user by email or phone
        user = None
        if '@' in email_or_phone:
            user = User.objects.filter(email=email_or_phone).first()
        else:
            user = User.objects.filter(phone=email_or_phone).first()
        
        if not user:
            return None, "User not found"
        
        if not user.check_password(password):
            return None, "Invalid password"
        
        if not user.is_active:
            return None, "Account is disabled"
        
        if user.is_suspended:
            return None, "Account is suspended"
        
        return user, None