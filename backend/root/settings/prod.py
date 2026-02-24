"""
Django settings for production environment.
"""
from .base import *
from decouple import config

DEBUG = False

# Must be set in production! Example: .env -> ALLOWED_HOSTS=api.example.com
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='', cast=lambda v: [s.strip() for s in v.split(',') if s.strip()])

# Production CORS config: explicitly allow origins
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='', cast=lambda v: [s.strip() for s in v.split(',') if s.strip()])

# Optional: Add production DB logic here (PostgreSQL)
# import dj_database_url
# DATABASES = {
#     'default': dj_database_url.config(default=config('DATABASE_URL'))
# }
