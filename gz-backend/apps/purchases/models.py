# apps/purchases/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone


class MoviePurchase(models.Model):
    """Records a user's purchase of a movie"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='purchases'
    )
    movie = models.ForeignKey(
        'movies.Movie', 
        on_delete=models.CASCADE, 
        related_name='purchases'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_date = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField(db_index=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        verbose_name = 'Movie Purchase'
        verbose_name_plural = 'Movie Purchases'
        ordering = ['-purchase_date']
        unique_together = ['user', 'movie']
    
    def __str__(self):
        return f"{self.user.email} bought '{self.movie.title}'"
    
    @classmethod
    def has_active_access(cls, user, movie):
        if not user or not user.is_authenticated:
            return False
        return cls.objects.filter(
            user=user,
            movie=movie,
            valid_until__gte=timezone.now()
        ).exists()
    
    @classmethod
    def get_active_purchase(cls, user, movie):
        return cls.objects.filter(
            user=user,
            movie=movie,
            valid_until__gte=timezone.now()
        ).first()
    
    @property
    def is_expired(self):
        return self.valid_until <= timezone.now()
    
    @property
    def days_remaining(self):
        if self.is_expired:
            return 0
        return (self.valid_until - timezone.now()).days