"""
Django settings for GZ Web Movie project — Phase 0 (Setup).

នេះជា Settings ដំបូងបំផុត សម្រាប់ Phase 0 ។ App ដូចជា accounts, movies, wallet
មិនទាន់បង្កើតនៅឡើយទេ — នឹងបន្ថែមមួយម្តងក្នុង `INSTALLED_APPS` រាល់ពេលអ្នកបង្កើត App ថ្មី
នៅ Phase 1 ជាដើម។
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# --- Load .env file ---
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


# --- Core ---
DEBUG = os.getenv("DEBUG", "True") == "True"

# ★ FIX #4a: the old fallback ("insecure-dev-key-change-me") meant that if
# .env was ever missing or misconfigured in production, the app would
# silently boot with a publicly-known secret key instead of failing loudly.
# Fail fast in production; keep a dev-only fallback for local convenience.
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "insecure-dev-key-change-me"
    else:
        raise RuntimeError(
            "SECRET_KEY environment variable is not set. "
            "Refusing to start in production without it."
        )

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")


# --- Installed Apps ---
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # 3rd-party
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",

    # Local apps - ទុកតែ apps ដែលមានកូដពេញលេញ
    "apps.accounts",
    "apps.movies",
    "common",

    # បើក apps ទាំងអស់ដែលមាន models
    "apps.content",
    "apps.streaming",
    "apps.wallet",
    "apps.payments",
    "apps.membership",
    "apps.purchases",
    "apps.notifications",
    "apps.support",
]

# Custom User Model — ត្រូវកំណត់ត្រង់នេះមុននឹង migrate លើកដំបូង
AUTH_USER_MODEL = 'accounts.User'


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",          # ត្រូវនៅលើគេ ក្រោម SecurityMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

    'common.middleware.RequestLoggingMiddleware',
    # ★ FIX #4b: "django.middleware.security.SecurityMiddleware" was
    # listed twice (also at the top of this list). Running it twice per
    # request is dead weight, not a real vulnerability — removed so the
    # chain matches what's actually intended.
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"


# --- Database ---
# Phase 0: ប្រើ SQLite ជាមុនសិន ដើម្បីងាយស្រួល develop លឿន។
# នៅ Production (Phase 8) ត្រូវប្តូរទៅ PostgreSQL វិញ (uncomment ខាងក្រោម + ដាក់ .env)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# DATABASES = {
#     "default": {
#         "ENGINE": os.getenv("DB_ENGINE", "django.db.backends.postgresql"),
#         "NAME": os.getenv("DB_NAME"),
#         "USER": os.getenv("DB_USER"),
#         "PASSWORD": os.getenv("DB_PASSWORD"),
#         "HOST": os.getenv("DB_HOST", "localhost"),
#         "PORT": os.getenv("DB_PORT", "5432"),
#     }
# }


# --- Password validation ---
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# --- i18n ---
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Phnom_Penh"
USE_I18N = True
USE_TZ = True


# --- Static & Media (Pillow needs MEDIA config for ImageField: poster, avatar...) ---
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# --- Django REST Framework ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    # ★ FIX #4c: "IsAuthenticatedOrReadOnly" as the PROJECT-WIDE default
    # means any new view that forgets to set its own permission_classes
    # silently allows anonymous GET requests. Switched to deny-by-default
    # (IsAuthenticated) — endpoints that should stay public (movie list,
    # FAQs, banners, etc.) already set permission_classes = [] or
    # [AllowAny] explicitly in their own views.
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    # ------------------------
    'EXCEPTION_HANDLER': 'common.exceptions.custom_exception_handler',
    'DEFAULT_PAGINATION_CLASS': 'common.pagination.StandardResultsSetPagination',

}

# --- Simple JWT ---
SIMPLE_JWT = {
    # ★ FIX #4d (superseded below): 2 hours was long for an access
    # token — if one leaks (XSS, log, proxy) it stays valid that whole
    # time. 30 min + the existing 7-day rotating/blacklisted refresh
    # token keeps the same UX (silent refresh) with a much smaller
    # exposure window.
    #
    # ★ FIX #9: 30 minutes turned out to be shorter than large video
    # uploads take over TUS (browser -> Bunny Stream directly). The
    # access token used for the movie-save request is the same one
    # issued when the admin panel loaded; once it expired mid-upload,
    # the save request that followed the (successful) video upload got
    # a 401 and the movie was silently never created -- "large movie
    # upload appears to do nothing, small ones work fine".
    #
    # Bumped to 6 hours as a pragmatic fix for admin-only endpoints
    # (this token is only ever used by IsAdminUser-gated views). If you
    # add proactive token refresh in the frontend before the save step
    # (see AddMovieDrawer.jsx), you can safely lower this back down.
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=6),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# --- Email (Dev mode: Print email content to console instead of sending) ---
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "noreply@gzmovie.local"


# --- CORS (allow the React/Vite frontend to call this API) ---
CORS_ALLOWED_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173"
).split(",")
CORS_ALLOW_CREDENTIALS = True

# ★ FIX #4e: production-only hardening. None of this was present before —
# without it, cookies can be read/sent over plain HTTP and there's no
# HSTS, so a MITM on an unencrypted connection could hijack sessions.
# Guarded by `if not DEBUG` so local development is unaffected.
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

#=========================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'request.middleware': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}

# ★ FIX #8 (CRITICAL): these were referenced directly in
# apps/streaming/services/bunny_token_service.py as
# settings.BUNNY_STREAM_LIBRARY_ID / settings.BUNNY_STREAM_API_KEY, but
# were NEVER actually defined anywhere in this file before. Since
# bunny_token_service.py reads them with no default, EVERY call to
# BunnyTokenService() (i.e. every attempt to play any video) was
# crashing with AttributeError. Also used by BunnyUploadService
# (apps/movies/services/bunny_upload_service.py) for the admin
# "create movie" video upload flow.
#
# ★ Reads from BUNNY_API_KEY / BUNNY_LIBRARY_ID / BUNNY_CDN_HOSTNAME —
# matching the actual variable names in .env.
BUNNY_STREAM_LIBRARY_ID = os.getenv("BUNNY_LIBRARY_ID", "")
BUNNY_STREAM_API_KEY = os.getenv("BUNNY_API_KEY", "")

# .env stores the hostname without a scheme (e.g. "vz-xxx.b-cdn.net"),
# but bunny_token_service.py builds URLs as f"{hostname}/{video_id}/...",
# so it needs the "https://" prefix — added here defensively.
_bunny_hostname = os.getenv("BUNNY_CDN_HOSTNAME", "")
if _bunny_hostname and not _bunny_hostname.startswith(("http://", "https://")):
    _bunny_hostname = f"https://{_bunny_hostname}"
BUNNY_STREAM_HOSTNAME = _bunny_hostname

BUNNY_TOKEN_EXPIRY_SECONDS = int(os.getenv("BUNNY_TOKEN_EXPIRY_SECONDS", 60 * 60 * 2))

if not DEBUG and not (BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY):
    raise RuntimeError(
        "BUNNY_LIBRARY_ID / BUNNY_API_KEY are not set. "
        "Video upload and playback cannot work without them in production."
    )