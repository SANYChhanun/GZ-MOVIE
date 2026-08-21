# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    """
    Custom User model for GZ Movie platform.
    """
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        USER = 'USER', 'User'
    
    # Basic Info
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER,
        db_index=True,
    )
    phone = models.CharField(
        max_length=20, 
        unique=True, 
        null=True, 
        blank=True,
        db_index=True,
    )
    avatar = models.ImageField(
        upload_to="avatars/", 
        null=True, 
        blank=True
    )
    
    # Verification
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Account Status
    is_suspended = models.BooleanField(default=False)
    suspended_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email', 'is_active']),
            models.Index(fields=['phone', 'is_phone_verified']),
            models.Index(fields=['role', 'is_active']),
        ]

    def __str__(self):
        return self.email or self.username
    
    # ============================================================
    # Role & Permission Methods
    # ============================================================
    
    def is_admin(self):
        """
        Check if user is admin.
        ពិនិត្យទាំង role, is_staff, និង is_superuser
        """
        return (
            self.role == self.Role.ADMIN or 
            self.is_staff or 
            self.is_superuser
        )
    
    def can_access_admin_panel(self):
        """Check if user can access admin panel"""
        return self.is_admin()
    
    # ============================================================
    # Subscription Methods
    # ============================================================
    
    def has_active_subscription(self):
        """Check if user has active VIP subscription"""
        return self.subscriptions.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).exists()
    
    def get_active_subscription(self):
        """Get current active subscription"""
        return self.subscriptions.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).order_by('-expires_at').first()
    
    def get_vip_status(self):
        """Get detailed VIP status"""
        active_sub = self.get_active_subscription()
        if not active_sub:
            return {
                'is_vip': False,
                'subscription': None,
                'days_remaining': 0,
            }
        
        return {
            'is_vip': True,
            'subscription': {
                'id': active_sub.id,
                'plan_name': active_sub.get_duration_days_display(),
                'duration_days': active_sub.duration_days,
                'start_date': active_sub.start_date,
                'expires_at': active_sub.expires_at,
            },
            'days_remaining': active_sub.days_remaining,
        }
    
    # ============================================================
    # Movie Access Methods
    # ============================================================
    
    # apps/accounts/models.py - ក្នុង User model

    def has_access_to_movie(self, movie):
        """
        Check if user can watch a movie.
        
        Rules:
        - Admin/Staff/Superuser: Can watch everything
        - Free: Everyone can watch
        - Member: Requires VIP subscription
        - Purchase: Requires purchase
        """
        # ✅ Admin/Staff/Superuser អាចមើលបានទាំងអស់
        if self.is_admin() or self.is_staff or self.is_superuser:
            return True
        
        # Suspended users have no access
        if self.is_suspended:
            return False
        
        # Free movies - everyone can watch
        if movie.access_type == 'free':
            return True
        
        # Member movies - require VIP
        if movie.access_type == 'member':
            return self.has_active_subscription()
        
        # Purchase movies - require purchase
        if movie.access_type == 'purchase':
            return self.has_purchased_movie(movie)
        
        return False
    
    def has_purchased_movie(self, movie):
        """Check if user has purchased a specific movie"""
        return self.purchases.filter(
            movie=movie,
            valid_until__gt=timezone.now()
        ).exists()
    
    def get_purchased_movies(self):
        """Get all movies user has purchased"""
        from apps.movies.models import Movie
        
        purchased_ids = self.purchases.filter(
            valid_until__gt=timezone.now()
        ).values_list('movie_id', flat=True)
        
        return Movie.objects.filter(id__in=purchased_ids)
    
    # ============================================================
    # Wallet Methods
    # ============================================================
    
    def get_wallet(self):
        """Get or create user's wallet"""
        from apps.wallet.models import Wallet
        
        wallet, created = Wallet.objects.get_or_create(
            user=self,
            defaults={'balance': 0}
        )
        return wallet
    
    def get_wallet_balance(self):
        """Get user's wallet balance"""
        try:
            return self.get_wallet().balance
        except Exception:
            return 0
    
    def has_sufficient_balance(self, amount):
        """Check if user has enough balance"""
        if amount <= 0:
            return True
        return self.get_wallet_balance() >= amount
    
    # ============================================================
    # Watch Progress Methods
    # ============================================================
    
    def get_recently_watched(self, limit=10):
        """Get recently watched movies"""
        from apps.streaming.models import WatchProgress
        
        recent = WatchProgress.objects.filter(
            user=self,
            movie__isnull=False
        ).select_related('movie').order_by('-updated_at')[:limit]
        
        return [progress.movie for progress in recent if progress.movie]
    
    def get_watch_progress(self, movie, episode=None):
        """Get watch progress for specific movie/episode"""
        from apps.streaming.models import WatchProgress
        
        query = {'user': self, 'movie': movie}
        if episode:
            query['episode'] = episode
        
        return WatchProgress.objects.filter(**query).first()
    
    def get_continue_watching(self, limit=5):
        """Get movies/episodes to continue watching"""
        from apps.streaming.models import WatchProgress
        
        progress_list = WatchProgress.objects.filter(
            user=self,
            last_position__gt=0,
            is_completed=False
        ).select_related('movie', 'episode').order_by('-updated_at')[:limit]
        
        return [
            {
                'movie': progress.movie,
                'episode': progress.episode,
                'position': progress.last_position,
                'duration': progress.duration,
                'progress_percent': (
                    progress.last_position / progress.duration * 100
                ) if progress.duration else 0,
                'updated_at': progress.updated_at,
            }
            for progress in progress_list
        ]


class Subscription(models.Model):
    """VIP Subscription"""
    
    class Duration(models.IntegerChoices):
        WEEKLY = 7, 'Weekly'
        MONTHLY = 30, 'Monthly'
        QUARTERLY = 90, 'Quarterly'
        YEARLY = 365, 'Yearly'
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='subscriptions'
    )
    duration_days = models.IntegerField(
        choices=Duration.choices,
        default=Duration.MONTHLY
    )
    start_date = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True, db_index=True)
    auto_renew = models.BooleanField(default=False)
    payment = models.ForeignKey(
        'payments.Payment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active', 'expires_at']),
            models.Index(fields=['expires_at', 'is_active']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = self.start_date + timedelta(days=self.duration_days)
        
        if self.expires_at <= timezone.now():
            self.is_active = False
        
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        return self.expires_at <= timezone.now()
    
    @property
    def days_remaining(self):
        if self.is_expired:
            return 0
        return (self.expires_at - timezone.now()).days
    
    def extend(self, days=None):
        """Extend subscription"""
        if days is None:
            days = self.duration_days
        
        if self.is_expired:
            self.start_date = timezone.now()
            self.expires_at = self.start_date + timedelta(days=days)
        else:
            self.expires_at += timedelta(days=days)
        
        self.is_active = True
        self.save()
    
    def deactivate(self):
        """Deactivate subscription"""
        self.is_active = False
        self.save(update_fields=['is_active', 'updated_at'])


class Device(models.Model):
    """User device tracking"""
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="devices"
    )
    device_id = models.CharField(max_length=255)
    device_name = models.CharField(max_length=255, blank=True)
    device_type = models.CharField(
        max_length=50,
        choices=[
            ('web', 'Web Browser'),
            ('android', 'Android'),
            ('ios', 'iOS'),
            ('smart_tv', 'Smart TV'),
            ('other', 'Other'),
        ],
        default='web'
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    last_login_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ("user", "device_id")
        ordering = ['-last_login_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.device_name or self.device_id}"
    
    def deactivate(self):
        self.is_active = False
        self.save(update_fields=['is_active'])
    
    def update_last_login(self, ip_address=None):
        self.last_login_at = timezone.now()
        if ip_address:
            self.ip_address = ip_address
        self.save(update_fields=['last_login_at', 'ip_address'])


class OTPCode(models.Model):
    """OTP codes for phone/email verification"""
    
    PURPOSE_CHOICES = [
        ('phone_verify', 'Phone Verification'),
        ('email_verify', 'Email Verification'),
        ('password_reset', 'Password Reset'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='otp_codes'
    )
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    expires_at = models.DateTimeField(default=timezone.now)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.purpose}"
    
    @property
    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()
    
    def mark_used(self):
        self.is_used = True
        self.save(update_fields=['is_used'])