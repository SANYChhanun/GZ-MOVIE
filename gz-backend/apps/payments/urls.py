from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreatePaymentView.as_view(), name='payment-create'),
    path('webhook/', views.PaymentWebhookView.as_view(), name='payment-webhook'),
    path('status/<str:reference_id>/', views.PaymentStatusView.as_view(), name='payment-status'),
]