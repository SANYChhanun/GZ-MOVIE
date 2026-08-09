# apps/accounts/permissions.py
from rest_framework import permissions
from django.utils import timezone

class IsAdminUser(permissions.BasePermission):
    """Allow access only to admin users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin()

class CanWatchMovie(permissions.BasePermission):
    """Check if user has permission to watch a movie"""
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin can watch everything
        if user.is_admin():
            return True
        
        # Free movies - everyone can watch
        if obj.access_type == 'free':
            return True
        
        # Member movies - need active subscription
        if obj.access_type == 'member':
            return user.has_active_subscription()
        
        # Purchase movies - need to have bought this specific movie
        if obj.access_type == 'purchase':
            from apps.purchases.models import MoviePurchase
            return MoviePurchase.has_active_access(user, obj)
        
        return False

class CanAccessVIPContent(permissions.BasePermission):
    """Allow access to VIP content for users with active subscription"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.is_admin() or request.user.has_active_subscription())
        )