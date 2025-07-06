"""
URL configuration for edgr_invest project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
# from django.contrib import admin
# from django.urls import path, include


# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path("accounts/", include("allauth.urls")),  # Allauth authentication URLs
#     path("", include("users.urls")),  # Users app URLs
# ]

# from django.urls import path, include, re_path
# from django.views.generic import TemplateView

# urlpatterns = [
#     path('api/users/', include('users.urls', namespace='users')),
#     # Serve React app for non-API routes
#     re_path(r'^(?!api/users/.*$).*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
# ]

# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/users/', include('users.urls', namespace='users')),  # Include users app URLs
# ]

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # ✅ API endpoints
    path('api/users/', include('users.api_urls', namespace='users')),

    # ✅ Frontend React fallbacks
    path('', include('users.urls')),
]

