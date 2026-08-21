# apps/dashboard/admin.py
from django.contrib import admin
from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'action', 'ip_address', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__email', 'action', 'description']
    ordering = ['-created_at']
    readonly_fields = ['created_at']