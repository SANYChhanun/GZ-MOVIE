# app/membership/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .serializers import MembershipPlanAdminSerializer

from .models import MembershipPlan, UserMembership
from .serializers import (
    MembershipPlanSerializer,
    UserMembershipSerializer,
    SubscribeSerializer,
)
from .services.membership_service import MembershipService


class MembershipPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """Public list/detail of available membership plans."""
    queryset = MembershipPlan.objects.filter(is_active=True)
    serializer_class = MembershipPlanSerializer
    permission_classes = [permissions.AllowAny]  # anyone can see plans
    lookup_field = 'slug'


class UserMembershipViewSet(viewsets.GenericViewSet):
    """
    Manage the current user's membership:
    - GET /membership/me/ → status
    - POST /membership/subscribe/ → purchase a plan (payment assumed done)
    - POST /membership/cancel/ → cancel auto-renewal
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'subscribe':
            return SubscribeSerializer
        return UserMembershipSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Return current user's membership status."""
        try:
            membership = request.user.membership
            serializer = self.get_serializer(membership)
            return Response(serializer.data)
        except UserMembership.DoesNotExist:
            return Response({
                'plan': None,
                'is_active': False,
                'expires_at': None,
                'detail': 'No membership yet.'
            })

    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        """
        Activate/renew a membership for the authenticated user.
        In production, you would verify that a payment for this plan was completed.
        For now, we trust the request (because the frontend should have already processed payment).
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.validated_data['plan_slug']
        auto_renew = serializer.validated_data.get('auto_renew', False)

        # Activate membership
        membership = MembershipService.activate_membership(
            user=request.user,
            plan=plan,
            auto_renew=auto_renew
        )
        output_serializer = UserMembershipSerializer(membership)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def cancel(self, request):
        """Cancel auto-renewal (or deactivate if needed)."""
        try:
            membership = request.user.membership
            membership.auto_renew = False
            membership.save()
            serializer = self.get_serializer(membership)
            return Response(serializer.data)
        except UserMembership.DoesNotExist:
            return Response({'detail': 'No membership found.'}, status=status.HTTP_404_NOT_FOUND)


# Admin viewset for managing membership plans (CRUD)
class MembershipPlanAdminViewSet(viewsets.ModelViewSet):
    """Admin CRUD — includes inactive plans + live subscriber counts."""
    queryset = MembershipPlan.objects.all()
    serializer_class = MembershipPlanAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def ppv_stats(self, request):
        """Stats for the 'Special' pay-per-video tier — sourced from purchases, not MembershipPlan."""
        from apps.purchases.models import MoviePurchase
        active = MoviePurchase.objects.filter(valid_until__gte=timezone.now())
        return Response({
            'active_purchase_count': active.count(),
            'active_purchasers': active.values('user').distinct().count(),
        })