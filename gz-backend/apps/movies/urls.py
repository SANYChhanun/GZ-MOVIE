# apps/movies/urls.py - ប្រើ path ផ្ទាល់
from django.urls import path
from .views import MovieViewSet, EpisodeViewSet, HeroBannerViewSet

urlpatterns = [
    # Movies
    path('', MovieViewSet.as_view({'get': 'list'}), name='movie-list'),
    path('<int:pk>/', MovieViewSet.as_view({'get': 'retrieve'}), name='movie-detail'),
    path('featured/', MovieViewSet.as_view({'get': 'featured'}), name='movie-featured'),
    path('new-releases/', MovieViewSet.as_view({'get': 'new_releases'}), name='movie-new-releases'),
    path('free/', MovieViewSet.as_view({'get': 'free'}), name='movie-free'),
    path('popular/', MovieViewSet.as_view({'get': 'popular'}), name='movie-popular'),
    path('genres/', MovieViewSet.as_view({'get': 'genres'}), name='movie-genres'),
    path('categories/', MovieViewSet.as_view({'get': 'categories'}), name='movie-categories'),
    
    # ✅ Episodes - ប្រើ path ផ្ទាល់
    path('episodes/', EpisodeViewSet.as_view({'get': 'list'}), name='episode-list'),
    path('episodes/<int:pk>/', EpisodeViewSet.as_view({'get': 'retrieve'}), name='episode-detail'),
    
    # Banners
    path('banners/', HeroBannerViewSet.as_view({'get': 'list', 'post': 'create'}), name='banner-list'),
    path('banners/active/', HeroBannerViewSet.as_view({'get': 'active'}), name='banner-active'),
]