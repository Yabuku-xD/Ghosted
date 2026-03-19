"""
Django settings for ghosted project.
"""

import os
from tempfile import gettempdir
from pathlib import Path

from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'users',
    'companies',
    'offers',
    'predictions',
    'h1b_data',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ghosted.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ghosted.wsgi.application'

USE_SQLITE_ENV = os.getenv('USE_SQLITE')
USE_SQLITE = (
    USE_SQLITE_ENV.lower() == 'true'
    if USE_SQLITE_ENV is not None
    else not os.getenv('DB_HOST')
)

# Default to PostgreSQL when a database host is configured, while keeping
# SQLite available for lightweight local runs without container services.
if USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'ghosted'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
            'HOST': os.getenv('DB_HOST', 'db'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

CACHE_TTL_SECONDS = int(os.getenv('CACHE_TTL_SECONDS', '120'))
PAGINATION_COUNT_CACHE_TIMEOUT = int(os.getenv('PAGINATION_COUNT_CACHE_TIMEOUT', str(CACHE_TTL_SECONDS)))
RESUME_SESSION_TTL_SECONDS = int(os.getenv('RESUME_SESSION_TTL_SECONDS', '3600'))
RESUME_MAX_FILE_BYTES = int(os.getenv('RESUME_MAX_FILE_BYTES', str(5 * 1024 * 1024)))
RESUME_MAX_PAGES = int(os.getenv('RESUME_MAX_PAGES', '4'))
RESUME_SESSION_STORAGE_DIR = Path(os.getenv('RESUME_SESSION_STORAGE_DIR', str(Path(gettempdir()) / 'ghosted_resume_sessions')))

if os.getenv('REDIS_URL'):
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': os.getenv('REDIS_URL'),
            'TIMEOUT': CACHE_TTL_SECONDS,
            'KEY_PREFIX': 'ghosted',
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'ghosted-local-cache',
            'TIMEOUT': CACHE_TTL_SECONDS,
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.CustomUser'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173'
).split(',')

CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://redis:6379/0')
CELERY_BEAT_SCHEDULE = {
    'discover-job-sources-nightly': {
        'task': 'companies.tasks.discover_job_sources_task',
        'schedule': crontab(minute=15, hour=2),
        'args': (100,),
    },
    'sync-job-postings-hourly': {
        'task': 'companies.tasks.sync_job_postings_task',
        'schedule': crontab(minute=5),
        'args': (100,),
    },
    'deactivate-stale-jobs-nightly': {
        'task': 'companies.tasks.deactivate_stale_jobs_task',
        'schedule': crontab(minute=45, hour=2),
        'args': (3,),
    },
    'cleanup-resume-sessions-hourly': {
        'task': 'companies.tasks.cleanup_resume_sessions_task',
        'schedule': crontab(minute=25),
    },
}
