# apps/movies/admin.py
from django.contrib import admin
from .models import Movie, Episode, HeroBanner


@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = [
        'id', 
        'movie', 
        'title', 
        'episode_number',  # ✅ ប្តូរពី video_file_id ទៅ episode_number
        'duration', 
        'is_active',
        'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'movie__title']
    ordering = ['movie', 'episode_number']
    list_select_related = ['movie']
    raw_id_fields = ['movie']


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = [
        'id', 
        'title', 
        'access_type', 
        'content_type',
        'view_count', 
        'rating',
        'is_featured', 
        'is_new_release',
        'is_active',
        'created_at'
    ]
    list_filter = [
        'access_type', 
        'content_type',
        'is_featured', 
        'is_new_release', 
        'is_active'
    ]
    search_fields = ['title', 'description', 'short_description']
    ordering = ['-created_at']
    prepopulated_fields = {'slug': ('title',)}
    
    # ✅ កែ filter_horizontal - ប្រើតែ fields ដែលមានក្នុង model
    filter_horizontal = [
        'genres',        # ✅ មានក្នុង model
        'categories',    # ✅ មានក្នុង model
        'countries',     # ✅ មានក្នុង model
        'series_types',  # ✅ មានក្នុង model
        # 'cast',        # ❌ មិនមានក្នុង model ទេ
        # 'crew',        # ❌ មិនមានក្នុង model ទេ
    ]
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'slug', 'description', 'short_description')
        }),
        ('Media', {
            'fields': ('poster', 'backdrop', 'trailer_url')
        }),
        ('Video', {
            'fields': ('video_file', 'bunny_video_id', 'video_upload')
        }),
        ('Classification', {
            'fields': ('access_type', 'content_type', 'purchase_price')
        }),
        ('Details', {
            'fields': ('release_date', 'duration', 'country', 'language')
        }),
        ('Series Info', {
            'fields': ('total_episodes', 'has_khmer_dub', 'has_khmer_sub')
        }),
        ('Stats & Flags', {
            'fields': ('rating', 'view_count', 'is_featured', 'is_new_release', 'is_active')
        }),
        ('Taxonomy', {
            'fields': ('genres', 'categories', 'countries', 'series_types')
        }),
    )
    
    readonly_fields = ['rating', 'view_count', 'created_at', 'updated_at']


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = [
        'id', 
        'title', 
        'link_type', 
        'order',
        'is_active',
        'created_at'
    ]
    list_filter = ['link_type', 'is_active']
    search_fields = ['title', 'subtitle']
    ordering = ['order', '-created_at']
    raw_id_fields = ['movie']