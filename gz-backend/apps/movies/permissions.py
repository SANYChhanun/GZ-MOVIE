# movies/permissions.py
from rest_framework.permissions import BasePermission
from django.utils import timezone


class MovieAccessPermission(BasePermission):
    """
    Allow access to a movie detail only if the user has the appropriate rights:
    - Free movies: always allowed.
    - Member-only movies: user must have an active VIP membership.
    - Purchase-required movies: user must have a valid purchase.
    """
    def has_object_permission(self, request, view, obj):
        # Always allow read if the movie is free
        if obj.is_free:
            return True

        # Anonymous users cannot access non-free movies
        if not request.user.is_authenticated:
            return False

        user = request.user
        if obj.is_membership_required:
            # Check VIP status
            from apps.membership.services.membership_service import MembershipService
            return MembershipService.is_vip(user)

        if obj.is_purchase_required:
            from apps.purchases.models import MoviePurchase
            return MoviePurchase.objects.filter(
                user=user,
                movie=obj,
                valid_until__gte=timezone.now()
            ).exists()

        return False  # Fallback