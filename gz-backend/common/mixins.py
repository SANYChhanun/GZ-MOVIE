import logging
from django.db import models

logger = logging.getLogger(__name__)


class LoggingMixin:
    """
    Mixin that logs every action on a viewset (useful for debugging).
    """
    def initial(self, request, *args, **kwargs):
        logger.info(
            f"{request.method} {request.path} – User: {request.user} "
            f"IP: {request.META.get('REMOTE_ADDR')}"
        )
        return super().initial(request, *args, **kwargs)


class OwnerFilterMixin:
    """
    Mixin that filters queryset by the request user, assuming the model has a 'user' field.
    """
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated:
            qs = qs.filter(user=self.request.user)
        else:
            qs = qs.none()
        return qs