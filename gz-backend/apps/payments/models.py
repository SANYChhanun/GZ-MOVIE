# apps/payments/models.py
from django.db import models
from django.conf import settings
import uuid


class Payment(models.Model):
    """Payment model"""
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'
    
    class PaymentType(models.TextChoices):
        TOPUP = 'topup', 'Wallet Top-up'
        MEMBERSHIP = 'membership', 'Membership'
        PURCHASE = 'purchase', 'Movie Purchase'
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    reference_id = models.CharField(
        max_length=100, 
        unique=True, 
        blank=True,
        db_index=True
    )
    payment_type = models.CharField(
        max_length=20,
        choices=PaymentType.choices,
        default=PaymentType.TOPUP
    )
    membership_plan = models.ForeignKey(
        'membership.MembershipPlan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    qr_code_data = models.TextField(blank=True, null=True)
    transaction_hash = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['reference_id', 'status']),
        ]
    
    def __str__(self):
        return f"{self.reference_id} - {self.amount} {self.currency}"
    
    def save(self, *args, **kwargs):
        if not self.reference_id:
            self.reference_id = f"PAY-{uuid.uuid4().hex[:12].upper()}"
        
        if self.status == self.Status.COMPLETED and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def mark_completed(self, transaction_hash=None):
        """Mark payment as completed"""
        from django.utils import timezone
        self.status = self.Status.COMPLETED
        self.completed_at = timezone.now()
        if transaction_hash:
            self.transaction_hash = transaction_hash
        self.save()
    
    def mark_failed(self):
        """Mark payment as failed"""
        self.status = self.Status.FAILED
        self.save()


class WebhookLog(models.Model):
    """Webhook log for debugging"""
    
    event_type = models.CharField(max_length=100)
    payload = models.JSONField(default=dict)
    status = models.CharField(max_length=20, default='received')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.event_type} - {self.status}"