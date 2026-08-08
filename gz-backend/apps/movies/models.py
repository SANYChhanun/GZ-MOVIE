# movies/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Category(models.Model):
    """e.g., Movie, TV Series, Documentary, Animation"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Cast(models.Model):
    name = models.CharField(max_length=200)
    photo = models.ImageField(upload_to='cast/', blank=True, null=True)
    character_name = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name_plural = 'Cast'

    def __str__(self):
        return f"{self.name} as {self.character_name}" if self.character_name else self.name


class Crew(models.Model):
    """Director, Producer, Writer, etc."""
    ROLE_CHOICES = [
        ('director', 'Director'),
        ('producer', 'Producer'),
        ('writer', 'Writer'),
        ('cinematographer', 'Cinematographer'),
        ('composer', 'Composer'),
        ('other', 'Other'),
    ]
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='other')
    photo = models.ImageField(upload_to='crew/', blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Crew'

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"


class Movie(models.Model):
    ACCESS_TYPE_CHOICES = [
        ('free', 'Free'),
        ('member', 'Membership Required'),
        ('purchase', 'Pay Per View'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)

    release_date = models.DateField()
    country = models.CharField(max_length=100)
    language = models.CharField(max_length=100)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")

    video_file = models.FileField(upload_to='movies/videos/', blank=True, null=True, help_text="Bunny.net video file")
    poster = models.ImageField(upload_to='movies/posters/')
    backdrop = models.ImageField(upload_to='movies/backdrops/', blank=True, null=True)
    trailer_url = models.URLField(blank=True, null=True)

    # Access control
    access_type = models.CharField(max_length=10, choices=ACCESS_TYPE_CHOICES, default='free')
    purchase_price = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True,
                                         help_text="Required if access_type is 'purchase'")
    # Purchase provides 1-month access; we'll handle access duration in the purchase model.

    # Metadata
    rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True,
                                 validators=[MinValueValidator(0), MaxValueValidator(10)],
                                 help_text="Average rating (0-10)")
    view_count = models.PositiveIntegerField(default=0)  # could be computed, but stored for performance
    is_featured = models.BooleanField(default=False, help_text="Show in hero banner / featured sections")
    is_new_release = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Relationships
    genres = models.ManyToManyField(Genre, related_name='movies')
    categories = models.ManyToManyField(Category, related_name='movies')
    cast = models.ManyToManyField(Cast, blank=True, related_name='movies')
    crew = models.ManyToManyField(Crew, blank=True, related_name='movies')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-release_date', '-created_at']

    def __str__(self):
        return self.title

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