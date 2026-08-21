# apps/movies/permissions.py
from rest_framework import permissions
from django.utils import timezone


class MovieAccessPermission(permissions.BasePermission):
    """
    Check if user has access to the movie based on access_type.
    
    Rules:
    - Free: Everyone can view (even anonymous)
    - Member: Must be authenticated + VIP
    - Purchase: Must be authenticated + have purchased this movie
    """
    
    def has_permission(self, request, view):
        """Check permission at view level"""
        # Allow list for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write operations require admin
        return (
            request.user.is_authenticated and 
            request.user.is_admin()
        )
    
    def has_object_permission(self, request, view, obj):
        """Check permission at object level"""
        # Admin can do anything
        if request.user.is_authenticated and request.user.is_admin():
            return True
        
        # Read-only operations
        if request.method in permissions.SAFE_METHODS:
            return self._can_view_movie(request.user, obj)
        
        # Write operations require admin (already checked in has_permission)
        return False
    
    def _can_view_movie(self, user, movie):
        """
        Check if user can view a specific movie.
        
        Args:
            user: User instance
            movie: Movie instance
            
        Returns:
            bool: True if user can view
        """
        # Free movies - everyone can view
        if movie.access_type == 'free':
            return True
        
        # Not authenticated
        if not user or not user.is_authenticated:
            return False
        
        # Use User model's method for access check
        return user.has_access_to_movie(movie)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow anyone to read (GET, HEAD, OPTIONS), but only admin to write.
    Use this for public endpoints like movies list, banners, etc.
    """
    
    def has_permission(self, request, view):
        # Safe methods: GET, HEAD, OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write methods require admin
        return (
            request.user.is_authenticated and 
            request.user.is_admin()
        )


class IsAdminUser(permissions.BasePermission):
    """
    Allow only admin users.
    Use this for admin-only endpoints.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.is_admin()
        )


class IsVIPUser(permissions.BasePermission):
    """
    Allow only VIP users with active subscription.
    Use this for member-only content.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admin can access everything
        if request.user.is_admin():
            return True
        
        # Check VIP subscription
        return request.user.has_active_subscription()


class CanPurchaseMovie(permissions.BasePermission):
    """
    Check if user can purchase a movie.
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Admin can do anything
        if request.user.is_admin():
            return True
        
        # Check if already purchased
        if request.user.has_purchased_movie(obj):
            return False  # Already purchased
        
        # Check if movie is purchasable
        return obj.access_type == 'purchase'