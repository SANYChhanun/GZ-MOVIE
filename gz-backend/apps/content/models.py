from django.db import models

class HeroBanner(models.Model):
    """Top hero banner displayed on the landing page."""
    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True)
    image = models.ImageField(upload_to='content/banners/')
    link = models.URLField(blank=True, help_text="Optional link when banner is clicked")
    order = models.PositiveIntegerField(default=0, help_text="Lower values appear first")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return self.title


class Promotion(models.Model):
    """Special promotions / marketing offers shown on the landing page."""
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='content/promotions/', blank=True, null=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class FAQ(models.Model):
    """Frequently Asked Questions, grouped by category."""
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('account', 'Account'),
        ('payment', 'Payment'),
        ('membership', 'Membership'),
        ('technical', 'Technical'),
    ]
    question = models.CharField(max_length=500)
    answer = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'order']

    def __str__(self):
        return self.question


class LegalPage(models.Model):
    """Legal documents like Terms of Service, Privacy Policy, Refund Policy, etc."""
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    last_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title