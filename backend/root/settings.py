"""
Django settings for root project — Price Optimization Tool.

This file configures:
- Installed apps (Django + DRF + JWT + django-filter + our pricing app)
- JWT authentication settings
- CORS (so React frontend can talk to Django backend)
- Database (SQLite for simplicity)
"""
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-akl^%j^yi=i*=l907f@*wbt3%#n=p4*t)oc-d%kr+^bq^we)pm'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']


# ═══════════════════════════════════════════
# INSTALLED APPS
# ═══════════════════════════════════════════
INSTALLED_APPS = [
    # Django built-in apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',           # Django REST Framework (API builder)
    'rest_framework_simplejwt', # JWT authentication
    'django_filters',           # Advanced filtering (?category=Electronics)
    'corsheaders',              # Allow React frontend to call our API

    # Our app
    'pricing',
]


# ═══════════════════════════════════════════
# MIDDLEWARE
# ═══════════════════════════════════════════
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # CORS must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ═══════════════════════════════════════════
# CORS — Allow React frontend to talk to us
# ═══════════════════════════════════════════
CORS_ALLOW_ALL_ORIGINS = True


# ═══════════════════════════════════════════
# REST FRAMEWORK CONFIGURATION
# ═══════════════════════════════════════════
REST_FRAMEWORK = {
    # Use JWT tokens for authentication
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # For Django admin
    ],
    # Default: anyone can read, must be logged in to write
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    # Use django-filter for filtering
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    # Pagination — 10 products per page by default
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}


# ═══════════════════════════════════════════
# JWT TOKEN SETTINGS
# ═══════════════════════════════════════════
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),   # Token expires after 1 hour
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),    # Refresh token lasts 7 days
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),               # Header: Authorization: Bearer <token>
}


ROOT_URLCONF = 'root.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'root.wsgi.application'


# ═══════════════════════════════════════════
# DATABASE — Using SQLite for simplicity
# ═══════════════════════════════════════════
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
