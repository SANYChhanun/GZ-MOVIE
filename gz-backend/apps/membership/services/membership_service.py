# app/membership/services/membership_service.py
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.membership.models import MembershipPlan, UserMembership


class MembershipService:
    @staticmethod
    def is_vip(user):
        """Check if the user currently has an active membership."""
        if not user.is_authenticated:
            return False
        try:
            membership = user.membership
            if membership.is_active and membership.expires_at:
                return membership.expires_at > timezone.now()
            return False
        except UserMembership.DoesNotExist:
            return False

    @staticmethod
    def get_active_membership(user):
        """Return the active membership or None."""
        if not user.is_authenticated:
            return None
        try:
            membership = user.membership
            if membership.is_active and membership.expires_at and membership.expires_at > timezone.now():
                return membership
        except UserMembership.DoesNotExist:
            pass
        return None

    @staticmethod
    def activate_membership(user, plan, start_date=None, auto_renew=False):
        from datetime import timedelta
        now = timezone.now()
        membership, _ = UserMembership.objects.get_or_create(user=user)

        # Free tier (no duration) = downgrade / no VIP access
        if not plan.duration_days:
            membership.plan = plan
            membership.start_date = start_date or now
            membership.expires_at = None
            membership.is_active = False
            membership.auto_renew = False
            membership.save()
            return membership

        # ★ FIX #3: previously this only stacked (added days on top of the
        # remaining expiry) when the user repurchased the EXACT SAME plan.
        # Buying a different plan (e.g. upgrading from 1-month to 3-months)
        # fell into the else branch and threw away any remaining days —
        # contradicting the stacking rule in the spec ("subscription
        # stacking must always add on top of the old expires_at, never
        # discard remaining days").
        #
        # The only thing that should decide "stack vs. start fresh" is
        # whether the user currently has *any* active, non-expired
        # membership — not which specific plan it was.
        if membership.is_active and membership.expires_at and membership.expires_at > now:
            membership.expires_at += timedelta(days=plan.duration_days)
        else:
            membership.start_date = start_date or now
            membership.expires_at = membership.start_date + timedelta(days=plan.duration_days)
            membership.is_active = True

        membership.plan = plan          # always move to the newly purchased plan
        membership.auto_renew = auto_renew
        membership.save()
        return membership

    @staticmethod
    def deactivate_membership(user):
        """Manually deactivate membership (e.g., admin action)."""
        try:
            membership = user.membership
            membership.is_active = False
            membership.expires_at = timezone.now()
            membership.save()
            return True
        except UserMembership.DoesNotExist:
            raise ValidationError("User has no membership record.")

    @staticmethod
    def check_expired_memberships():
        """Utility to be called by a Celery beat task to deactivate expired memberships."""
        now = timezone.now()
        expired = UserMembership.objects.filter(is_active=True, expires_at__lte=now)
        count = expired.update(is_active=False)
        return count