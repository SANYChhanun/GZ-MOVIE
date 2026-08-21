# apps/dashboard/permissions.py
from rest_framework.permissions import BasePermission


class IsDashboardAdmin(BasePermission):
    """
    Allows access only to users with admin privileges.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return (
            request.user.is_staff or 
            request.user.is_superuser or
            getattr(request.user, 'role', '') == 'ADMIN'
        )