from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, CompanyReviewViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'reviews', CompanyReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
