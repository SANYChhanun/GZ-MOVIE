from datetime import timedelta
from django.utils import timezone
from django.db import transaction as db_transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import MoviePurchase
from .serializers import MoviePurchaseSerializer, PurchaseCreateSerializer
from apps.movies.models import Movie
from apps.wallet.services.wallet_service import WalletService, InsufficientBalanceError
from common.pagination import StandardResultsSetPagination


class PurchaseCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PurchaseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        movie_id = serializer.validated_data['movie_id']
        try:
            movie = Movie.objects.get(id=movie_id, is_active=True, access_type='purchase')
        except Movie.DoesNotExist:
            return Response({'error': 'Movie not found or not available for purchase'}, status=404)

        # Check if user already has a valid purchase
        if MoviePurchase.has_active_access(request.user, movie):
            return Response({'error': 'You already have access to this movie.'}, status=400)

        if movie.purchase_price is None or movie.purchase_price <= 0:
            return Response({'error': 'This movie is not currently purchasable.'}, status=400)

        # Charge wallet (debit)
        try:
            with db_transaction.atomic():
                txn = WalletService.debit_wallet(
                    user=request.user,
                    amount=movie.purchase_price,
                    description=f"Purchase: {movie.title}",
                )
        except InsufficientBalanceError:
            return Response({'error': 'Insufficient balance. Please top up your wallet.'},
                            status=status.HTTP_402_PAYMENT_REQUIRED)

        # Create purchase record
        purchase = MoviePurchase.objects.create(
            user=request.user,
            movie=movie,
            amount=movie.purchase_price,
            valid_until=timezone.now() + timedelta(days=30),
            transaction_id=txn.id,  # wallet transaction ID
        )

        serializer = MoviePurchaseSerializer(purchase)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PurchaseListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        purchases = MoviePurchase.objects.filter(user=request.user).select_related('movie')
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(purchases, request)
        if page is not None:
            serializer = MoviePurchaseSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        serializer = MoviePurchaseSerializer(purchases, many=True)
        return Response(serializer.data)


class PurchaseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            purchase = MoviePurchase.objects.get(pk=pk, user=request.user)
        except MoviePurchase.DoesNotExist:
            return Response({'error': 'Purchase not found'}, status=404)
        serializer = MoviePurchaseSerializer(purchase)
        return Response(serializer.data)


class AccessCheckView(APIView):
    """Check if the authenticated user has access to a given movie (useful for the player page)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        movie_id = request.query_params.get('movie_id')
        if not movie_id:
            return Response({'error': 'movie_id query parameter is required'}, status=400)
        try:
            movie = Movie.objects.get(pk=movie_id)
        except Movie.DoesNotExist:
            return Response({'error': 'Movie not found'}, status=404)

        has_access = MoviePurchase.has_active_access(request.user, movie)
        return Response({'has_access': has_access})