# apps/movies/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
import uuid


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
    country = models.CharField(max_length=100)  # ← ចាស់ ទុកដូចដើម
    language = models.CharField(max_length=100)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")

    # ============ VIDEO FIELDS ============
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

    # Relationships
    genres = models.ManyToManyField('taxonomy.Genre', related_name='movies')
    categories = models.ManyToManyField('taxonomy.Category', related_name='movies')
    cast = models.ManyToManyField('taxonomy.Cast', blank=True, related_name='movies')
    crew = models.ManyToManyField('taxonomy.Crew', blank=True, related_name='movies')

    # ============ FIELD ថ្មីៗ ============
    content_type = models.CharField(
        max_length=20,
        choices=[
            ('movie', 'រឿងដុំ'),
            ('tv_show', 'រឿងភាគ'),
        ],
        default='movie',
        help_text='ជ្រើសរើសថាជារឿងដុំ ឬរឿងភាគ'
    )

    countries = models.ManyToManyField(
        'taxonomy.Country',
        related_name='movies',
        blank=True,
        help_text='ប្រទេសដូចជា ខ្មែរ ចិន កូរេ ជាដើម'
    )

    has_khmer_dub = models.BooleanField(
        default=False,
        help_text='ធីកបើមានសំឡេងនិយាយខ្មែរ'
    )

    has_khmer_sub = models.BooleanField(
        default=False,
        help_text='ធីកបើមានអក្សររត់ពីក្រោមខ្មែរ'
    )

    # ============ បន្ថែម fields ថ្មីៗ ============
    series_types = models.ManyToManyField(
        'taxonomy.SeriesType',
        related_name='movies',
        blank=True,
        help_text='ប្រភេទរឿងភាគដូចជា រឿងភាគចិន ហូលីវូត ជាដើម (សម្រាប់ TV Shows)'
    )

    total_episodes = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text='ចំនួនភាគសរុប (សម្រាប់ TV Shows)'
    )
    # ============ បញ្ចប់ការបន្ថែម ============

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

# apps/movies/models.py (បន្ថែម)
class SeriesType(models.Model):
    name = models.CharField(max_length=100)
    flag = models.CharField(max_length=10, blank=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

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

    link_type = models.CharField(max_length=10, choices=LINK_TYPE_CHOICES, default='movie')
    movie = models.ForeignKey(
        'Movie',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hero_banners'
    )
    external_url = models.URLField(blank=True, null=True)

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