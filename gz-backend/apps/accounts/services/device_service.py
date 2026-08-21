# apps/accounts/services/device_service.py
from apps.accounts.models import Device
from django.utils import timezone


class DeviceService:
    """Service for device management"""
    
    MAX_ACTIVE_DEVICES = 5  # អតិបរមា 5 ឧបករណ៍
    
    @staticmethod
    def register_device(user, device_id, device_name=None, device_type='web', 
                       ip_address=None, user_agent=None):
        """
        Register or update a device.
        
        Returns:
            tuple: (device, error) - device if successful, error message if failed
        """
        try:
            # Check active device count
            active_devices = Device.objects.filter(
                user=user,
                is_active=True
            ).count()
            
            # Get or create device
            device, created = Device.objects.get_or_create(
                user=user,
                device_id=device_id,
                defaults={
                    'device_name': device_name or 'Unknown Device',
                    'device_type': device_type,
                    'ip_address': ip_address,
                    'user_agent': user_agent,
                    'last_login_at': timezone.now(),
                }
            )
            
            if not created:
                # Update device info
                if device_name:
                    device.device_name = device_name
                if device_type:
                    device.device_type = device_type
                if ip_address:
                    device.ip_address = ip_address
                if user_agent:
                    device.user_agent = user_agent
                device.last_login_at = timezone.now()
                device.is_active = True
                device.save()
            
            return device, None
            
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def deactivate_device(user, device_id):
        """Deactivate a device"""
        try:
            device = Device.objects.get(user=user, device_id=device_id)
            device.deactivate()
            return True, None
        except Device.DoesNotExist:
            return False, "Device not found"
        except Exception as e:
            return False, str(e)
    
    @staticmethod
    def get_active_devices(user):
        """Get user's active devices"""
        return Device.objects.filter(user=user, is_active=True)
    
    @staticmethod
    def can_add_device(user):
        """Check if user can add another device"""
        active_count = Device.objects.filter(
            user=user,
            is_active=True
        ).count()
        return active_count < DeviceService.MAX_ACTIVE_DEVICES