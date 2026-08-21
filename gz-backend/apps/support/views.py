# apps/support/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SupportTicket


class SupportTicketViewSet(viewsets.ModelViewSet):
    """Support ticket viewset"""
    queryset = SupportTicket.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """ត្រង់ tickets សម្រាប់ user បច្ចុប្បន្ន"""
        if self.request.user.is_admin():
            return SupportTicket.objects.all()
        return SupportTicket.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """កំណត់ user ពេលបង្កើត ticket"""
        serializer.save(user=self.request.user)