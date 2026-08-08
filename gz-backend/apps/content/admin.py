from django.contrib import admin
from .models import HeroBanner, Promotion, FAQ, LegalPage

@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active']
    list_editable = ['order', 'is_active']

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ['title', 'start_date', 'end_date', 'is_active']

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'order', 'is_active']
    list_filter = ['category']
    list_editable = ['order', 'is_active']

@admin.register(LegalPage)
class LegalPageAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'last_updated']
    prepopulated_fields = {'slug': ('title',)}