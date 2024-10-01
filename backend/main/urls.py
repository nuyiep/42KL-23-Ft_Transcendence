"""
URL configuration for main project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('user_management.urls')),
    path('api/token_management/', include('token_management.urls')),
    path('api/two_factor_auth/', include('two_factor_auth.urls')),
    path('api/friend/', include('friends_system.urls')),
    re_path(r'^.*$', serve, kwargs={
        'path': 'index.html',
        'document_root': os.path.join(settings.BASE_DIR, 'frontend'),
    }),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
