from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, JobApplicationViewSet,
    forgot_password, reset_password, verify_email
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'applications', JobApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
    # Password reset endpoints
    path('auth/forgot-password/', forgot_password, name='forgot-password'),
    path('auth/reset-password/', reset_password, name='reset-password'),
    path('auth/verify-email/', verify_email, name='verify-email'),
]
