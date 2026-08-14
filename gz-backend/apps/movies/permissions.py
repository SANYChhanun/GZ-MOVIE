# apps/movies/permissions.py
from rest_framework import permissions


class MovieAccessPermission(permissions.BasePermission):
    """
    Check if user has access to the movie based on access_type.
    
    Rules:
    - Free: Everyone can view (even anonymous)
    - Member: Must be authenticated + VIP
    - Purchase: Must be authenticated + have purchased this movie
    """
    
    def has_permission(self, request, view):
        # Allow list/view for everyone (detail check in has_object_permission)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write operations require admin
        return request.user.is_authenticated and request.user.is_staff
    
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.is_authenticated and request.user.is_staff:
            return True
        
        # Free movies - everyone can view
        if obj.access_type == 'free':
            return True
        
        # Member movies - require authentication + VIP
        if obj.access_type == 'member':
            return request.user.is_authenticated and getattr(request.user, 'is_vip', False)
        
        # Purchase movies - require authentication + purchase
        if obj.access_type == 'purchase':
            if not request.user.is_authenticated:
                return False
            # Check if user has purchased this movie
            # Note: 'purchases' related_name must exist on Purchase model
            if hasattr(obj, 'purchases'):
                return obj.purchases.filter(user=request.user, is_active=True).exists()
            return False
        
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow anyone to read (GET, HEAD, OPTIONS), but only admin to write (POST, PUT, PATCH, DELETE).
    Use this for public endpoints like movies list, banners, etc.
    """
    
    def has_permission(self, request, view):
        # Safe methods: GET, HEAD, OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write methods require admin (staff)
        return request.user.is_authenticated and request.user.is_staff


class IsAdminUser(permissions.BasePermission):
    """
    Allow only admin (staff) users.
    Use this for admin-only endpoints.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff