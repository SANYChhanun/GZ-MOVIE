from django.db import models
from django.conf import settings


class ActivityLog(models.Model):
    """Track administrative and important user actions for audit purposes."""
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('purchase', 'Purchase'),
        ('topup', 'Top‑up'),
        ('membership_change', 'Membership Change'),
        ('admin_action', 'Admin Action'),
        ('report_export', 'Report Export'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'

    def __str__(self):
        user = self.user.email if self.user else 'Anonymous'
        return f'{user} – {self.action} at {self.timestamp:%Y-%m-%d %H:%M}'