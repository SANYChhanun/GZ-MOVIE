from django.db import models
from django.conf import settings


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    reference_id = models.CharField(max_length=100, unique=True, help_text="Our unique transaction ID")
    payment_type = models.CharField(max_length=30, default='topup',
                                    help_text="'topup' or 'membership'")
    # If payment is for a membership, link the plan
    membership_plan = models.ForeignKey(
        'membership.MembershipPlan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    qr_code_data = models.TextField(blank=True, help_text="KHQR deep link or raw data")
    # The following are set after webhook verification
    transaction_hash = models.CharField(max_length=255, blank=True, null=True)
    bakong_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.reference_id} - {self.status}"


class WebhookLog(models.Model):
    """Record every webhook request for audit and debugging."""
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True)
    payload = models.JSONField()
    headers = models.JSONField()
    ip_address = models.GenericIPAddressField()
    is_valid = models.BooleanField(default=False)
    processed = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)

    received_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Webhook {self.id} - Valid: {self.is_valid}"