"""
Django settings for local development.
"""
from .base import *
from decouple import config

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = ['*']

# Allow React frontend to talk to us locally
CORS_ALLOW_ALL_ORIGINS = True
