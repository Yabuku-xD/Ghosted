from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PredictionViewSet, SponsorshipLikelihoodViewSet

router = DefaultRouter()
router.register(r'predictions', PredictionViewSet, basename='prediction')
router.register(r'sponsorship-likelihood', SponsorshipLikelihoodViewSet, basename='sponsorship-likelihood')

urlpatterns = [
    path('', include(router.urls)),
]
