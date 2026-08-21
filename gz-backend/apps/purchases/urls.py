# apps/purchases/urls.py
from django.urls import path
from .views import (
    PurchaseCreateView,
    PurchaseListView,
    AccessCheckView,
    PPVStatsView,
)

urlpatterns = [
    path('create/', PurchaseCreateView.as_view(), name='purchase-create'),
    path('my-purchases/', PurchaseListView.as_view(), name='purchase-list'),
    path('check/', AccessCheckView.as_view(), name='purchase-check'),
    path('stats/', PPVStatsView.as_view(), name='ppv-stats'),
]