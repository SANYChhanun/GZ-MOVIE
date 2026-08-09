# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        USER = 'USER', 'User'
    
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER
    )
    
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)

    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
    
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    def has_active_subscription(self):
        """Check if user has any active VIP subscription"""
        return self.subscriptions.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).exists()
    
    def has_access_to_movie(self, movie):
        """Check if user can watch a specific movie"""
        if self.is_admin():
            return True
        
        if movie.access_type == 'free':
            return True
        
        if movie.access_type == 'member':
            return self.has_active_subscription()
        
        if movie.access_type == 'purchase':
            # ប្រើ purchases.MoviePurchase model
            from apps.purchases.models import MoviePurchase
            return MoviePurchase.has_active_access(self, movie)
        
        return False


class Subscription(models.Model):
    """VIP Subscription plans"""
    DURATION_CHOICES = [
        (14, '14 Days'),
        (30, '30 Days'),
        (90, '90 Days'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='subscriptions'
    )
    duration_days = models.IntegerField(choices=DURATION_CHOICES)
    start_date = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = self.start_date + timedelta(days=self.duration_days)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_duration_days_display()} (expires: {self.expires_at.date()})"
    
    class Meta:
        ordering = ['-created_at']


class Device(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="devices")
    device_id = models.CharField(max_length=255)
    device_name = models.CharField(max_length=255, blank=True)
    last_login_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("user", "device_id")

    def __str__(self):
        return f"{self.user.username} - {self.device_name or self.device_id}"