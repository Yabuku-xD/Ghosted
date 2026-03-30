from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from .models import JobApplication
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    JobApplicationSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        if self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ["create", "register"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        """Override update to only allow users to update their own profile"""
        if request.user != self.get_object():
            return Response(
                {"detail": "You can only update your own profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to only allow users to update their own profile"""
        if request.user != self.get_object():
            return Response(
                {"detail": "You can only update your own profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        """Get or update current user profile"""
        if request.method == "GET":
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == "PATCH":
            serializer = UserUpdateSerializer(
                request.user, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(UserSerializer(request.user).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], url_path="change-password")
    def change_password(self, request):
        """Change user password"""
        serializer = PasswordChangeSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response({"detail": "Password changed successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"])
    def register(self, request):
        """Register a new user and return tokens"""
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    """Request password reset token"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
            token = user.generate_password_reset_token()
        except User.DoesNotExist:
            pass

        return Response(
            {
                "detail": "If an account with that email exists, a password reset link has been sent.",
            }
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Reset password using token"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(password_reset_token=token)

            # Check if token is expired
            if (
                user.password_reset_expires
                and user.password_reset_expires < timezone.now()
            ):
                return Response(
                    {"detail": "Password reset link has expired."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Reset password
            user.set_password(new_password)
            user.password_reset_token = None
            user.password_reset_expires = None
            user.save()

            return Response({"detail": "Password reset successfully."})

        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid reset token."}, status=status.HTTP_400_BAD_REQUEST
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    """Verify email address using token"""
    token = request.data.get("token")
    if not token:
        return Response(
            {"detail": "Token is required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email_verification_token=token)
        user.email_verified = True
        user.email_verification_token = None
        user.save()
        return Response({"detail": "Email verified successfully."})
    except User.DoesNotExist:
        return Response(
            {"detail": "Invalid verification token."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Get application statistics for the user"""
        queryset = self.get_queryset()
        total = queryset.count()
        by_status = queryset.values("status").annotate(count=Count("id"))

        return Response(
            {
                "total_applications": total,
                "by_status": {item["status"]: item["count"] for item in by_status},
                "recent_applications": JobApplicationSerializer(
                    queryset.order_by("-applied_date")[:5], many=True
                ).data,
            }
        )
