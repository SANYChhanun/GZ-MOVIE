from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        "message": "GZ Movie API",
        "version": "1.0",
        "endpoints": {
            "auth": "/api/auth/",
            "movies": "/api/movies/",
            "admin_api": "/api/admin/",
            "django_admin": "/admin/",
        }
    })


urlpatterns = [
    # Django Admin
    path(
        "admin/",
        admin.site.urls
    ),

    # API Root
    path(
        "api/",
        api_root,
        name="api-root"
    ),

    # Authentication
    path(
        "api/auth/",
        include("apps.accounts.urls")
    ),

    # Public Movie API
    path(
        "api/movies/",
        include("apps.movies.urls")
    ),

    # Admin Movie Management API
    path(
        "api/admin/",
        include("apps.movies.admin_urls")
    ),
    # Admin Content Management API
    path(
        "api/admin/",
        include("apps.content.admin_urls")
    ),
    # Admin Membership Management API
    path(
        "api/admin/",
        include("apps.membership.admin_urls")
    ),

    # Other APIs
    path(
        "api/payments/",
        include("apps.payments.urls")
    ),

    path(
        "api/membership/",
        include("apps.membership.urls")
    ),

    path(
        "api/purchases/",
        include("apps.purchases.urls")
    ),

    path(
        "api/content/",
        include("apps.content.urls")
    ),
]


# Serve uploaded media files in development
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )