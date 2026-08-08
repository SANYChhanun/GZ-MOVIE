from rest_framework.permissions import BasePermission


class IsDashboardAdmin(BasePermission):
    """
    Allows access only to users with admin privileges.
    This can be based on is_staff, is_superuser, or a custom role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.is_superuser)
            # You can extend to check a custom role: request.user.role == 'admin'
        )