from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "GZ Movie API",
        "version": "1.0",
        "endpoints": {
            "auth": "/api/auth/",
            "admin": "/admin/",
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('apps.accounts.urls')),
]
