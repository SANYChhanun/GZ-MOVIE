from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    """ប្រើសម្រាប់ Test ថា Server ដំណើរការត្រឹមត្រូវ (Phase 0)."""
    return JsonResponse({"status": "ok", "project": "GZ Web Movie API"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check),

    path("api/auth/", include("apps.accounts.urls")),

    # --- នឹងបន្ថែម Phase 2 ជាដើម ---
    # path("api/movies/", include("apps.movies.urls")),
    # path("api/stream/", include("apps.streaming.urls")),
    # path("api/wallet/", include("apps.wallet.urls")),
    # path("api/payments/", include("apps.payments.urls")),
    # path("api/membership/", include("apps.membership.urls")),
]

# Serve uploaded media files (Poster, Avatar...) in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
