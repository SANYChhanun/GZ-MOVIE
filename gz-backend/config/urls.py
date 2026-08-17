# gz_backend/urls.py
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
            "genres": "/api/genres/",      # ← បន្ថែម
            "admin_api": "/api/admin/",
            "django_admin": "/admin/",
        }
    })


urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),

    # API Root
    path("api/", api_root, name="api-root"),

    # ===== AUTHENTICATION =====
    path("api/auth/", include("apps.accounts.urls")),

    # ===== PUBLIC MOVIE API =====
    path("api/", include("apps.movies.urls")),  # ← មាន /api/movies/

    # ===== PUBLIC TAXONOMY API (Genres, Categories) =====
    path("api/", include("apps.taxonomy.urls")),  # ← បន្ថែមនេះ

    # ===== ADMIN APIS =====
    path("api/admin/", include("apps.movies.admin_urls")),
    path("api/admin/", include("apps.content.admin_urls")),
    path("api/admin/", include("apps.membership.admin_urls")),

    # ===== OTHER APIS =====
    path("api/payments/", include("apps.payments.urls")),
    path("api/membership/", include("apps.membership.urls")),
    path("api/purchases/", include("apps.purchases.urls")),
    path("api/content/", include("apps.content.urls")),
]

# Serve uploaded media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)