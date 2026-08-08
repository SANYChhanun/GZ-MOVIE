# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, Device


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["username", "email", "phone", "is_vip", "vip_expiration_date", "is_staff"]
    list_filter = ["is_vip", "is_staff", "is_active"]
    search_fields = ["username", "email", "phone"]

    fieldsets = UserAdmin.fieldsets + (
        ("GZ Profile", {
            "fields": ("phone", "avatar", "is_vip", "vip_expiration_date",
                       "is_phone_verified", "is_email_verified"),
        }),
    )


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ["user", "device_name", "device_id", "is_active", "last_login_at"]
    list_filter = ["is_active"]
    search_fields = ["user__username", "device_id"]
