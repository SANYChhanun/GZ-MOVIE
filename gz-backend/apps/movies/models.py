# apps/movies/models.py
#
# Genre, Category, Cast, and Crew moved out to apps.taxonomy -- see that
# app's models.py. Cross-app FK/M2M fields below reference them by the
# 'app_label.ModelName' string form, which is required (and preferred by
# Django) whenever a model references another app's model, since it
# avoids a hard import dependency between the two apps.
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
import uuid


# apps/movies/models.py

class Movie(models.Model):
    ACCESS_TYPE_CHOICES = [
        ('free', 'Free'),
        ('member', 'Membership Required'),
        ('purchase', 'Pay Per View'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, allow_unicode=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)

    release_date = models.DateField()
    country = models.CharField(max_length=100)
    language = models.CharField(max_length=100)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")

    # ============ VIDEO FIELDS ============
    # ✅ បន្ថែម field ថ្មីសម្រាប់ Upload Video ដោយផ្ទាល់
    video_upload = models.FileField(
        upload_to='movies/videos/',
        max_length=255,
        blank=True,
        null=True,
        help_text="Upload video file directly (MP4, MOV, MKV, WebM)"
    )

    video_file = models.URLField(blank=True, null=True, help_text="Bunny.net video URL")
    bunny_video_id = models.CharField(max_length=255, blank=True, null=True, help_text="Bunny Stream Video ID")

    poster = models.ImageField(upload_to='movies/posters/')
    backdrop = models.ImageField(upload_to='movies/backdrops/', blank=True, null=True)
    trailer_url = models.URLField(blank=True, null=True)

    # Access control
    access_type = models.CharField(max_length=10, choices=ACCESS_TYPE_CHOICES, default='free')
    purchase_price = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True,
                                         help_text="Required if access_type is 'purchase'")

    # Metadata
    rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True,
                                 validators=[MinValueValidator(0), MaxValueValidator(10)],
                                 help_text="Average rating (0-10)")
    view_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False, help_text="Show in hero banner / featured sections")
    is_new_release = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Relationships -- Genre/Category/Cast/Crew now live in apps.taxonomy,
    # referenced here by the 'taxonomy.ModelName' string form.
    genres = models.ManyToManyField('taxonomy.Genre', related_name='movies')
    categories = models.ManyToManyField('taxonomy.Category', related_name='movies')
    cast = models.ManyToManyField('taxonomy.Cast', blank=True, related_name='movies')
    crew = models.ManyToManyField('taxonomy.Crew', blank=True, related_name='movies')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-release_date', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title, allow_unicode=True)
            if not base:
                base = f"movie-{uuid.uuid4().hex[:8]}"
            slug = base
            n = 1
            while Movie.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                n += 1
                slug = f"{base}-{n}"
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def is_free(self):
        return self.access_type == 'free'

    @property
    def is_membership_required(self):
        return self.access_type == 'member'

    @property
    def is_purchase_required(self):
        return self.access_type == 'purchase'


class Episode(models.Model):
    """For TV series or multi-part content"""
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='episodes')
    episode_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    video_file_id = models.CharField(max_length=100, help_text="Bunny.net video ID or GUID")
    thumbnail = models.ImageField(upload_to='episodes/thumbnails/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['movie', 'episode_number']
        ordering = ['movie', 'episode_number']

    def __str__(self):
        return f"{self.movie.title} - Ep {self.episode_number}: {self.title}"


# បន្ថែម/កែក្នុង apps/movies/models.py

class HeroBanner(models.Model):
    """Top hero banner displayed on the landing page."""

    LINK_TYPE_CHOICES = [
        ('movie', 'Movie (Internal)'),
        ('external', 'External URL'),
        ('none', 'No Link'),
    ]

    title = models.CharField(max_length=255, help_text="Banner headline text")
    subtitle = models.TextField(blank=True, help_text="Optional subtitle")
    image = models.ImageField(upload_to='content/banners/', help_text="Recommended: 1600×900")

    # ✅ NEW FIELDS
    link_type = models.CharField(max_length=10, choices=LINK_TYPE_CHOICES, default='movie')
    movie = models.ForeignKey(
        'Movie',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hero_banners'
    )
    external_url = models.URLField(blank=True, null=True)

    # Keep old field for backward compatibility
    link = models.URLField(blank=True, help_text="Auto-generated from movie or external_url")

    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'Hero Banner'
        verbose_name_plural = 'Hero Banners'

    def __str__(self):
        movie_name = self.movie.title if self.movie else 'No movie'
        return f"Banner #{self.order}: {self.title} → {movie_name}"

    def save(self, *args, **kwargs):
        """Auto-generate link from movie or external_url."""
        if self.link_type == 'movie' and self.movie:
            self.link = f"/watch/{self.movie.id}"
        elif self.link_type == 'external' and self.external_url:
            self.link = self.external_url
        else:
            self.link = ''
        super().save(*args, **kwargs)