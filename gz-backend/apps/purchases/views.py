# apps/purchases/views.py
from datetime import timedelta
from django.utils import timezone
from django.db import transaction as db_transaction
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import MoviePurchase
from .serializers import MoviePurchaseSerializer, PurchaseCreateSerializer
from apps.movies.models import Movie


class PurchaseCreateView(APIView):
    """បង្កើតការទិញរឿងថ្មី"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PurchaseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        movie_id = serializer.validated_data['movie_id']
        
        try:
            movie = Movie.objects.get(id=movie_id, is_active=True)
        except Movie.DoesNotExist:
            return Response({'error': 'Movie not found'}, status=404)

        # ពិនិត្យថាទិញរួចហើយ
        if MoviePurchase.has_active_access(request.user, movie):
            active_purchase = MoviePurchase.get_active_purchase(request.user, movie)
            return Response(
                {
                    'error': 'You already have access to this movie.',
                    'purchase': MoviePurchaseSerializer(active_purchase, context={'request': request}).data,
                }, 
                status=400
            )

        # បង្កើត purchase record (TODO: ភ្ជាប់ payment ពិតប្រាកដ)
        purchase = MoviePurchase.objects.create(
            user=request.user,
            movie=movie,
            amount=movie.purchase_price or 0,
            valid_until=timezone.now() + timedelta(days=30),
        )

        serializer = MoviePurchaseSerializer(purchase, context={'request': request})
        return Response(
            {
                'message': 'Purchase successful',
                'purchase': serializer.data,
            }, 
            status=201
        )


class PurchaseListView(APIView):
    """បញ្ជីការទិញ"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        purchases = MoviePurchase.objects.filter(
            user=request.user
        ).select_related('movie')
        
        serializer = MoviePurchaseSerializer(purchases, many=True, context={'request': request})
        return Response(serializer.data)


class AccessCheckView(APIView):
    """ពិនិត្យការទិញ"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        movie_id = request.query_params.get('movie_id')
        
        if not movie_id:
            return Response({'error': 'movie_id is required'}, status=400)
        
        active_purchase = MoviePurchase.objects.filter(
            user=request.user,
            movie_id=movie_id,
            valid_until__gt=timezone.now()
        ).first()
        
        if active_purchase:
            return Response({
                'has_access': True,
                'has_purchased': True,
                'purchase': MoviePurchaseSerializer(active_purchase, context={'request': request}).data,
            })
        
        return Response({
            'has_access': False,
            'has_purchased': False,
            'purchase': None,
        })


class PPVStatsView(APIView):
    """Pay-per-view statistics"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        active_purchases = MoviePurchase.objects.filter(
            valid_until__gt=timezone.now()
        )
        
        total_revenue = MoviePurchase.objects.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        return Response({
            'active_purchasers': active_purchases.values('user').distinct().count(),
            'active_purchase_count': active_purchases.count(),
            'total_purchases': MoviePurchase.objects.count(),
            'total_revenue': float(total_revenue),
        })