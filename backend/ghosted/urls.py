"""
URL configuration for ghosted project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from users.views import UserViewSet
from rest_framework.routers import SimpleRouter

user_router = SimpleRouter()
user_router.register(r'auth', UserViewSet, basename='auth-user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/', include('users.urls')),
    path('api/', include(user_router.urls)),
    path('api/', include('companies.urls')),
    path('api/', include('offers.urls')),
    path('api/', include('predictions.urls')),
    path('api/', include('h1b_data.urls')),
]
