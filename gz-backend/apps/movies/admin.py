# admin.py
from django.contrib import admin
from .models import Movie, Episode, Genre, Category, Cast, Crew

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Cast)
class CastAdmin(admin.ModelAdmin):
    list_display = ['name', 'character_name']

@admin.register(Crew)
class CrewAdmin(admin.ModelAdmin):
    list_display = ['name', 'role']

class EpisodeInline(admin.TabularInline):
    model = Episode
    extra = 1

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['title', 'access_type', 'release_date', 'is_active']
    list_filter = ['access_type', 'genres', 'categories']
    search_fields = ['title', 'description']
    inlines = [EpisodeInline]

@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = ['movie', 'episode_number', 'title', 'is_active']