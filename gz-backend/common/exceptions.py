from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Custom exception handler that adds a `status_code` and `errors` key
    to every DRF response, while preserving the original structure.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Add standard keys
        response.data = {
            'status_code': response.status_code,
            'errors': response.data
        }
    return response