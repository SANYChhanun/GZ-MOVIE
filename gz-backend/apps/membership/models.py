from django.db import models
from django.conf import settings


class MembershipPlan(models.Model):
    """A subscription plan with price, duration, and features."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)  # USD
    duration_days = models.PositiveIntegerField(help_text='Number of days the membership is valid')
    features = models.JSONField(default=list, blank=True, help_text='List of feature strings')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['price']

    def __str__(self):
        return f"{self.name} – {self.duration_days} days / ${self.price}"


class UserMembership(models.Model):
    """Records a user's active/inactive membership period."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='membership'
    )
    plan = models.ForeignKey(MembershipPlan, on_delete=models.SET_NULL, null=True, blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    auto_renew = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} – {self.plan.name if self.plan else 'No plan'}"