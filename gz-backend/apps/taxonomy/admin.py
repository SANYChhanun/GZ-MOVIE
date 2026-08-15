# apps/taxonomy/admin.py
from django.contrib import admin
from .models import Genre, Category, Cast, Crew


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Cast)
class CastAdmin(admin.ModelAdmin):
    list_display = ['name', 'character_name']
    search_fields = ['name', 'character_name']


@admin.register(Crew)
class CrewAdmin(admin.ModelAdmin):
    list_display = ['name', 'role']
    list_filter = ['role']
    search_fields = ['name']