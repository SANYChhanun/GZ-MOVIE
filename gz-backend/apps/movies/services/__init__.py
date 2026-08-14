# apps/movies/services/bunny_service.py
import requests
import os
from django.conf import settings


class BunnyStreamService:
    """Service for uploading and managing videos on Bunny Stream"""
    
    @classmethod
    def get_api_key(cls):
        return os.getenv('BUNNY_API_KEY', '')
    
    @classmethod
    def get_library_id(cls):
        return os.getenv('BUNNY_LIBRARY_ID', '724838')
    
    @classmethod
    def get_cdn_hostname(cls):
        return os.getenv('BUNNY_CDN_HOSTNAME', 'vz-eac2b402-4e5.b-cdn.net')
    
    @classmethod
    def get_headers(cls):
        return {
            'AccessKey': cls.get_api_key(),
            'Content-Type': 'application/json',
        }
    
    @classmethod
    def create_video(cls, title):
        """Create a new video entry in Bunny Stream and return video ID"""
        url = f'https://video.bunnycdn.com/library/{cls.get_library_id()}/videos'
        try:
            response = requests.post(url, json={'title': title}, headers=cls.get_headers())
            if response.status_code == 200:
                data = response.json()
                return data.get('guid')  # Video ID
        except Exception as e:
            print(f"Bunny create video error: {e}")
        return None
    
    @classmethod
    def upload_video(cls, video_id, file_path):
        """Upload video file to an existing Bunny Stream video"""
        url = f'https://video.bunnycdn.com/library/{cls.get_library_id()}/videos/{video_id}'
        try:
            with open(file_path, 'rb') as f:
                headers = {'AccessKey': cls.get_api_key()}
                response = requests.put(url, data=f, headers=headers)
                return response.status_code in [200, 201]
        except Exception as e:
            print(f"Bunny upload error: {e}")
        return False
    
    @classmethod
    def get_video(cls, video_id):
        """Get video details"""
        url = f'https://video.bunnycdn.com/library/{cls.get_library_id()}/videos/{video_id}'
        try:
            response = requests.get(url, headers=cls.get_headers())
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Bunny get video error: {e}")
        return None
    
    @classmethod
    def delete_video(cls, video_id):
        """Delete a video"""
        url = f'https://video.bunnycdn.com/library/{cls.get_library_id()}/videos/{video_id}'
        try:
            response = requests.delete(url, headers=cls.get_headers())
            return response.status_code == 204
        except Exception as e:
            print(f"Bunny delete error: {e}")
        return False
    
    @classmethod
    def get_embed_url(cls, video_id):
        return f'https://iframe.mediadelivery.net/embed/{cls.get_library_id()}/{video_id}'
    
    @classmethod
    def get_play_url(cls, video_id, quality='720p'):
        return f'https://{cls.get_cdn_hostname()}/{video_id}/play_{quality}.mp4'
    
    @classmethod
    def get_thumbnail_url(cls, video_id):
        return f'https://{cls.get_cdn_hostname()}/{video_id}/thumbnail.jpg'
    
    @classmethod
    def get_hls_url(cls, video_id):
        return f'https://{cls.get_cdn_hostname()}/{video_id}/playlist.m3u8'