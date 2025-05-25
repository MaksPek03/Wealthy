"""
WSGI config for asset_tracker project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
import sys
from django.core.wsgi import get_wsgi_application
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))


from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'asset_tracker.settings')

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


application = get_wsgi_application()

application = get_wsgi_application()
