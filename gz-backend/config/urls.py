# config/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from apps.movies.views import HeroBannerViewSet
from apps.movies.views import EpisodeViewSet



def api_root(request):
    return JsonResponse({
        "message": "GZ Movie API",
        "version": "1.0",
        "endpoints": {
            "auth": "/auth/",
            "movies": "/api/movies/",
            "genres": "/api/genres/",
            "countries": "/api/countries/",
            "categories": "/api/categories/",
            "series_types": "/api/series-types/",
            "dashboard": "/api/dashboard/stats/",
            "payments": "/api/payments/",
            "membership": "/api/membership/",
            "purchases": "/api/purchases/",
            "content": "/api/content/",
            "streaming": "/api/streaming/",
            "wallet": "/api/wallet/",
            "django_admin": "/admin/",
        }
    })


urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),

    # API Root
    path("api/", api_root, name="api-root"),

    # ===== AUTHENTICATION =====
    path("auth/", include("apps.accounts.urls")),

    path('api/movies/banners/', HeroBannerViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='banner-list'),

    path("api/movies/", include("apps.movies.urls")),
    
    # ✅ បន្ថែម path ផ្ទាល់សម្រាប់ episodes
    path('api/movies/episodes/', EpisodeViewSet.as_view({
        'get': 'list',
    }), name='episode-list'),
    path('api/movies/episodes/<int:pk>/', EpisodeViewSet.as_view({
        'get': 'retrieve',
    }), name='episode-detail'),

    # ===== TAXONOMY API =====
    path("api/", include("apps.taxonomy.urls")),

    # ===== ADMIN APIS =====
    path("api/admin/", include("apps.movies.admin_urls")),

    # ===== DASHBOARD =====
    path("api/dashboard/", include("apps.dashboard.urls")),  # ✅ ត្រូវមាន

    # ===== PAYMENTS =====
    path("api/payments/", include("apps.payments.urls")),
    
    # ===== MEMBERSHIP =====
    path("api/membership/", include("apps.membership.urls")),
    
    # ===== PURCHASES =====
    path("api/purchases/", include("apps.purchases.urls")),
    
    # ===== CONTENT =====
    path("api/content/", include("apps.content.urls")),
    
    # ===== STREAMING =====
    path("api/streaming/", include("apps.streaming.urls")),
    
    # ===== WALLET =====
    path("api/wallet/", include("apps.wallet.urls")),


]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)