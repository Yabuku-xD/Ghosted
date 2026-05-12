"""
URL configuration for ghosted project.
"""
from django.contrib import admin
from django.urls import path, include
from users.views import UserViewSet
from rest_framework.routers import SimpleRouter

user_router = SimpleRouter()
user_router.register(r'auth', UserViewSet, basename='auth-user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include(user_router.urls)),
    path('api/', include('companies.urls')),
    path('api/', include('offers.urls')),
    path('api/', include('predictions.urls')),
    path('api/', include('h1b_data.urls')),
]
