# apps/notifications/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Notification viewset"""
    queryset = Notification.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """ត្រង់ notifications សម្រាប់ user បច្ចុប្បន្ន"""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """សម្គាល់ថាបានអានទាំងអស់"""
        self.get_queryset().update(is_read=True)
        return Response({'message': 'All notifications marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """សម្គាល់ថាបានអាន"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})