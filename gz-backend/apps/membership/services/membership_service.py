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
        """
        Activate (or renew) a membership for the user.
        If the user already has an expired membership, we extend it from now.
        """
        from datetime import timedelta

        now = timezone.now()
        membership, created = UserMembership.objects.get_or_create(user=user)
        # If currently active and not expired, extend the expiry date
        if membership.is_active and membership.expires_at and membership.expires_at > now:
            membership.expires_at += timedelta(days=plan.duration_days)
        else:
            membership.start_date = start_date or now
            membership.expires_at = membership.start_date + timedelta(days=plan.duration_days)
            membership.is_active = True
            membership.plan = plan
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