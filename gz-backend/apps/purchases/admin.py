from django.contrib import admin
from .models import MoviePurchase

@admin.register(MoviePurchase)
class MoviePurchaseAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'movie', 'amount', 'purchase_date', 'valid_until']
    search_fields = ['user__email', 'movie__title']
    list_filter = ['purchase_date']
    readonly_fields = ['purchase_date']