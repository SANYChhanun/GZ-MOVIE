from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import WalletTransaction
from .serializers import WalletSerializer, WalletTransactionSerializer
from .services.wallet_service import WalletService


class TransactionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class WalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return wallet balance and basic info."""
        wallet = WalletService.get_or_create_wallet(request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)


class WalletTransactionsView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = TransactionPagination

    def get(self, request):
        """Return paginated transaction history for the current user."""
        wallet = WalletService.get_or_create_wallet(request.user)
        transactions = wallet.transactions.all()
        # Optional filtering
        txn_type = request.query_params.get('type')
        if txn_type in ['credit', 'debit']:
            transactions = transactions.filter(transaction_type=txn_type)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(transactions, request)
        if page is not None:
            serializer = WalletTransactionSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = WalletTransactionSerializer(transactions, many=True)
        return Response(serializer.data)