from django.contrib import admin
from .models import Genre, Category, Cast, Crew, Country, SeriesType  # ← បន្ថែម Country, SeriesType


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


# ============ បន្ថែម Country Admin ============
@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'flag']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    list_editable = ['flag']  # អាចកែ flag ដោយផ្ទាល់ពី list view
# ============ បញ្ចប់ការបន្ថែម ============


# ============ បន្ថែម SeriesType Admin ============
@admin.register(SeriesType)
class SeriesTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'flag']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    list_editable = ['flag']  # អាចកែ flag ដោយផ្ទាល់ពី list view
# ============ បញ្ចប់ការបន្ថែម ============


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