from django.db import models
from django.conf import settings
from django.utils import timezone


class MoviePurchase(models.Model):
    """
    Records a user's purchase of a movie for a limited time.
    Access is valid for 30 days from purchase_date.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='movie_purchases')
    movie = models.ForeignKey('movies.Movie', on_delete=models.CASCADE, related_name='purchases')
    amount = models.DecimalField(max_digits=6, decimal_places=2, help_text="Price paid")
    purchase_date = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField()
    transaction_id = models.CharField(max_length=100, blank=True, null=True, help_text="Wallet transaction reference")

    class Meta:
        verbose_name = 'Movie Purchase'
        verbose_name_plural = 'Movie Purchases'
        ordering = ['-purchase_date']
        unique_together = ['user', 'movie']  # One purchase per movie per user at a time (overwrites old)

    def __str__(self):
        return f"{self.user.email} bought '{self.movie.title}' until {self.valid_until:%Y-%m-%d}"

    @classmethod
    def has_active_access(cls, user, movie):
        """Check if the user has a valid (non-expired) purchase for the given movie."""
        if not user.is_authenticated:
            return False
        return cls.objects.filter(
            user=user,
            movie=movie,
            valid_until__gte=timezone.now()
        ).exists()