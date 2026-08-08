from django.urls import path
from . import views

urlpatterns = [
    path('', views.WalletView.as_view(), name='wallet-balance'),
    path('transactions/', views.WalletTransactionsView.as_view(), name='wallet-transactions'),
]