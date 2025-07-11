# edgr_invest/settings/prod.py
from .base import *
import os
from corsheaders.defaults import default_headers


DEBUG = False



ALLOWED_HOSTS = ['edgr-invest.onrender.com', 'edgrinvest.onrender.com',  'api.edgrinvest.com',
 'edgrinvest.com', 'www.edgrinvest.com', 'https://edgrinvest-frontend.onrender.com']


CORS_ALLOW_HEADERS = list(default_headers) + [
    'X-CSRFToken',
    'Referer',  # ✅ Add this
]

CORS_ALLOWED_ORIGINS = [
    'https://edgrinvest.com',
    'https://www.edgrinvest.com',
    'https://edgr-invest.onrender.com',
    'https://edgrinvest-frontend.onrender.com',
    'https://api.edgrinvest.com',  # ✅ Add this



]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    'https://edgr-invest.onrender.com',
    'https://edgrinvest.com',
    'https://www.edgrinvest.com',
    'https://edgrinvest-frontend.onrender.com',
    'https://api.edgrinvest.com',  # ✅ Add this


]

CSRF_FAILURE_VIEW = 'django.views.csrf.csrf_failure'


SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'

EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'info@edgrinvest.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'eqwrkpynozolcorf')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'EDGR Invest <info@edgrinvest.com>')

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# Optional: Logging for production
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/django.log'),
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}