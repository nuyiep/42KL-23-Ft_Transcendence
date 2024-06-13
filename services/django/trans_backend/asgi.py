"""
ASGI config for trans_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/



JUN's comment
AuthMiddlewareStack, ProtocolTypeRouter, URLRouter, and AllowedHostsOriginValidator: 
From Django Channels, to set up WebSocket w/ security and routing

get_asgi_application: 
standard ASGI application callable

websocket_urlpatterns: 
to import from (remote.routing) with the URL for WebSocket connections
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

from remote.routing import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trans_backend.settings")

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
	{
		"http": django_asgi_app,
		"websocket": AllowedHostsOriginValidator(
					AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
				),
	}
)
