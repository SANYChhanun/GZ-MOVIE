# apps/taxonomy/models.py
import uuid
from django.db import models
from django.utils.text import slugify


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True, allow_unicode=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name, allow_unicode=True)
            self.slug = base if base else f"genre-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True, allow_unicode=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name, allow_unicode=True)
            self.slug = base if base else f"category-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

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