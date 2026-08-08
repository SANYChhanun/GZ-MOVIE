import time
import logging

logger = logging.getLogger('request.middleware')


class RequestLoggingMiddleware:
    """
    Logs every request with method, path, user, IP, status code, and duration.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()

        response = self.get_response(request)

        duration = time.time() - start
        user = request.user if request.user.is_authenticated else 'anonymous'
        ip = request.META.get('REMOTE_ADDR', '')
        logger.info(
            f"{request.method} {request.path} | User: {user} | IP: {ip} | "
            f"Status: {response.status_code} | Duration: {duration:.3f}s"
        )

        return response