# apps/movies/admin.py
from django.contrib import admin
from django import forms
from .models import Movie, Episode, HeroBanner  # Movie-app models only
# NOTE: Genre/Category/Cast/Crew moved to apps.taxonomy. Their admin
# registration now lives solely in apps/taxonomy/admin.py -- do NOT
# import or @admin.register() them here too, or Django raises
# `AlreadyRegistered` on startup since each model can only be
# registered with the admin site once, project-wide.
from .services.bunny_service import BunnyStreamService
import tempfile
import os


class MovieAdminForm(forms.ModelForm):
    upload_to_bunny = forms.FileField(
        required=False,
        help_text="Upload video directly to Bunny Stream"
    )

    class Meta:
        model = Movie
        fields = '__all__'

    def save(self, commit=True):
        instance = super().save(commit=False)

        upload_file = self.cleaned_data.get('upload_to_bunny')
        if upload_file:
            print(f"Uploading {upload_file.name} to Bunny Stream...")

            # បង្កើត Video ក្នុង Bunny
            video_id = BunnyStreamService.create_video(instance.title)
            if video_id:
                print(f"Created Bunny video: {video_id}")

                # រក្សាទុកឯកសារបណ្តោះអាសន្ន
                with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
                    for chunk in upload_file.chunks():
                        tmp.write(chunk)
                    tmp_path = tmp.name

                # Upload ទៅ Bunny
                success = BunnyStreamService.upload_video(video_id, tmp_path)

                # លុបឯកសារបណ្តោះអាសន្ន
                os.unlink(tmp_path)

                if success:
                    instance.bunny_video_id = video_id
                    instance.video_file = BunnyStreamService.get_embed_url(video_id)
                    print(f"✅ Upload successful! Video ID: {video_id}")
                else:
                    print("❌ Upload failed!")
            else:
                print("❌ Failed to create video in Bunny!")

        if commit:
            instance.save()
            self.save_m2m()
        return instance


class EpisodeInline(admin.TabularInline):
    model = Episode
    extra = 0
    fields = ['episode_number', 'title', 'duration', 'video_file_id', 'is_active']


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    form = MovieAdminForm
    list_display = ['title', 'access_type', 'is_active', 'bunny_video_id', 'created_at']
    list_filter = ['access_type', 'is_active', 'genres']
    search_fields = ['title', 'description']
    readonly_fields = ['slug']
    filter_horizontal = ['genres', 'categories', 'cast', 'crew']
    inlines = [EpisodeInline]

    fieldsets = (
        ('ព័ត៌មានមូលដ្ឋាន', {
            'fields': ('title', 'slug', 'description', 'short_description')
        }),
        ('ព័ត៌មានលម្អិត', {
            'fields': ('release_date', 'country', 'language', 'duration')
        }),
        ('រូបភាព និង វីដេអូ', {
            'fields': ('poster', 'backdrop', 'trailer_url', 'upload_to_bunny', 'bunny_video_id', 'video_file'),
        }),
        ('ការគ្រប់គ្រងសិទ្ធិ', {
            'fields': ('access_type', 'purchase_price')
        }),
        ('Metadata', {
            'fields': ('rating', 'view_count', 'is_featured', 'is_new_release', 'is_active')
        }),
        ('ទំនាក់ទំនង', {
            'fields': ('genres', 'categories', 'cast', 'crew')
        }),
    )


@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = ['movie', 'episode_number', 'title', 'video_file_id', 'is_active']
    list_filter = ['movie', 'is_active']
    search_fields = ['title']


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'link_type', 'movie', 'order', 'is_active']
    list_filter = ['link_type', 'is_active']
    search_fields = ['title']
    ordering = ['order']