# apps/movies/models.py
from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class Movie(models.Model):
    """Movie/Series model"""
    
    class AccessType(models.TextChoices):
        FREE = 'free', 'Free'
        MEMBER = 'member', 'Member Only'
        PURCHASE = 'purchase', 'Pay Per View'
    
    access_type = models.CharField(
        max_length=20,
        choices=AccessType.choices,
        default=AccessType.FREE,
        db_index=True,
    )
    purchase_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    
    class ContentType(models.TextChoices):
        MOVIE = 'movie', 'Movie'
        SERIES = 'series', 'Series'
        DOCUMENTARY = 'documentary', 'Documentary'
        ANIME = 'anime', 'Anime'
    
    # Basic Info
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    short_description = models.TextField(max_length=500, blank=True)
    
    # Media
    poster = models.ImageField(upload_to='movies/posters/', null=True, blank=True)
    backdrop = models.ImageField(upload_to='movies/backdrops/', null=True, blank=True)
    trailer_url = models.URLField(blank=True, null=True)
    
    # Video
    video_file = models.URLField(blank=True, null=True, help_text="Bunny.net embed URL")
    bunny_video_id = models.CharField(max_length=255, blank=True, null=True)
    video_upload = models.FileField(upload_to='movies/videos/', null=True, blank=True)
    
    # Classification
    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.MOVIE,
        db_index=True,
    )
    access_type = models.CharField(
        max_length=20,
        choices=AccessType.choices,
        default=AccessType.FREE,
        db_index=True,
    )
    
    # Details
    release_date = models.DateField(null=True, blank=True)
    duration = models.IntegerField(
        null=True, blank=True,
        help_text="Duration in minutes",
        validators=[MinValueValidator(1)]
    )
    country = models.CharField(max_length=100, blank=True)
    language = models.CharField(max_length=100, blank=True)
    
    # Ratings & Stats
    rating = models.DecimalField(
        max_digits=3, decimal_places=1, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    view_count = models.IntegerField(default=0)
    
    # Pricing
    purchase_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)]
    )
    
    # Series Specific
    total_episodes = models.IntegerField(null=True, blank=True)
    has_khmer_dub = models.BooleanField(default=False)
    has_khmer_sub = models.BooleanField(default=False)
    
    # Flags
    is_featured = models.BooleanField(default=False, db_index=True)
    is_new_release = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    # Relationships
    genres = models.ManyToManyField('taxonomy.Genre', related_name='movies', blank=True)
    categories = models.ManyToManyField('taxonomy.Category', related_name='movies', blank=True)
    countries = models.ManyToManyField('taxonomy.Country', related_name='movies', blank=True)
    series_types = models.ManyToManyField('taxonomy.SeriesType', related_name='movies', blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title', 'is_active']),
            models.Index(fields=['access_type', 'is_active']),
            models.Index(fields=['content_type', 'is_active']),
        ]
        verbose_name = 'Movie'
        verbose_name_plural = 'Movies'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Auto-generate slug from title"""
        if not self.slug:
            self.slug = self._generate_unique_slug()
        super().save(*args, **kwargs)
    
    def _generate_unique_slug(self):
        """Generate unique slug from title"""
        base = slugify(self.title) or 'movie'
        slug = base
        counter = 1
        
        while Movie.objects.filter(slug=slug).exists():
            counter += 1
            slug = f"{base}-{counter}"
        
        return slug
    
    @property
    def year(self):
        """Get release year"""
        return self.release_date.year if self.release_date else None
    
    @property
    def is_series(self):
        """Check if content is series"""
        return self.content_type == self.ContentType.SERIES
    
    @property
    def episode_count(self):
        """Get active episode count"""
        return self.episodes.filter(is_active=True).count()
    
    @property
    def average_rating(self):
        """Get average rating - ប្រើ rating ផ្ទាល់"""
        return float(self.rating) if self.rating else 0
    
    def increment_view_count(self):
        """Increment view count"""
        self.view_count += 1
        self.save(update_fields=['view_count', 'updated_at'])
    
    def get_related_movies(self, limit=10):
        """Get related movies based on genres"""
        return Movie.objects.filter(
            genres__in=self.genres.all(),
            is_active=True
        ).exclude(id=self.id).distinct()[:limit]
    
    # apps/movies/models.py - ក្នុង Movie model

    def user_can_watch(self, user):
        """
        Check if user can watch this movie.
        
        Rules:
        - Admin/Staff/Superuser: Can watch everything
        - Free: Everyone can watch
        - Member: Requires VIP subscription
        - Purchase: Requires purchase
        """
        if not user or not user.is_authenticated:
            return self.access_type == self.AccessType.FREE
        
        # ✅ Admin/Staff/Superuser អាចមើលបានទាំងអស់
        if user.is_admin() or user.is_staff or user.is_superuser:
            return True
        
        return user.has_access_to_movie(self)


class Episode(models.Model):
    """Episode for series"""
    
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name='episodes'
    )
    title = models.CharField(max_length=255)
    episode_number = models.IntegerField()
    description = models.TextField(blank=True)
    
    # Video
    video_file = models.URLField(blank=True, null=True)
    bunny_video_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Details
    duration = models.IntegerField(null=True, blank=True, help_text="Duration in minutes")
    thumbnail = models.ImageField(upload_to='movies/episodes/', null=True, blank=True)
    
    # Stats
    view_count = models.IntegerField(default=0)
    
    # Flags
    is_active = models.BooleanField(default=True, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['episode_number']
        unique_together = ['movie', 'episode_number']
        indexes = [
            models.Index(fields=['movie', 'episode_number']),
            models.Index(fields=['movie', 'is_active']),
        ]
        verbose_name = 'Episode'
        verbose_name_plural = 'Episodes'
    
    def __str__(self):
        return f"{self.movie.title} - Episode {self.episode_number}"
    
    def increment_view_count(self):
        """Increment view count"""
        self.view_count += 1
        self.save(update_fields=['view_count', 'updated_at'])


class HeroBanner(models.Model):
    """Hero banner for homepage"""
    
    class LinkType(models.TextChoices):
        MOVIE = 'movie', 'Movie'
        EXTERNAL = 'external', 'External URL'
    
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=500, blank=True)
    image = models.ImageField(upload_to='banners/', null=True, blank=True)
    
    # Link
    link_type = models.CharField(
        max_length=20,
        choices=LinkType.choices,
        default=LinkType.MOVIE,
        db_index=True,
    )
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='banners'
    )
    external_url = models.URLField(blank=True, null=True)
    
    # Display
    order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_at']
        indexes = [
            models.Index(fields=['is_active', 'order']),
        ]
        verbose_name = 'Hero Banner'
        verbose_name_plural = 'Hero Banners'
    
    def __str__(self):
        return self.title
    
    def get_link_url(self):
        """Get banner link URL"""
        if self.link_type == self.LinkType.MOVIE and self.movie:
            return f"/movie/{self.movie.slug}"
        elif self.link_type == self.LinkType.EXTERNAL and self.external_url:
            return self.external_url
        return None