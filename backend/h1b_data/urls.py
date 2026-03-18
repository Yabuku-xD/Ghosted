from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import H1BApplicationViewSet, LotteryYearViewSet, CountryCapStatusViewSet

router = DefaultRouter()
router.register(r'h1b-applications', H1BApplicationViewSet)
router.register(r'lottery-years', LotteryYearViewSet)
router.register(r'country-cap-status', CountryCapStatusViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
