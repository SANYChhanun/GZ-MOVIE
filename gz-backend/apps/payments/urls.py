# apps/payments/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentAdminViewSet,
    WebhookLogViewSet,
    create_payment,
    webhook_handler,
    check_payment_status,
)

router = DefaultRouter()
router.register(r'admin', PaymentAdminViewSet, basename='payment-admin')
router.register(r'webhook-logs', WebhookLogViewSet, basename='webhook-logs')

urlpatterns = [
    # Public endpoints
    path('create/', create_payment, name='create-payment'),
    path('status/<str:reference_id>/', check_payment_status, name='payment-status'),
    path('webhook/', webhook_handler, name='webhook-handler'),
    
    # Router endpoints
    path('', include(router.urls)),
]