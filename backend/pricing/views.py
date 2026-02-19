"""
views.py
--------
Contains all the API endpoint logic (views).

Views:
1. ProductViewSet   — Full CRUD for products + search + filter
2. RegisterView     — User registration (signup)
3. LoginView        — User login (returns JWT tokens)
4. ProfileView      — Get current user's profile info
5. RoleListView     — List all available roles

How Permissions Work:
- Admin      → Can do everything (create, edit, delete products)
- Buyer      → Can only VIEW products (read-only)
- Supplier   → Can VIEW and UPDATE products (no delete)
- Anonymous  → Must log in first
"""
from rest_framework import viewsets, status, generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import Product, Role, UserProfile
from .serializers import (
    ProductSerializer,
    RoleSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
)


# ═══════════════════════════════════════════
# CUSTOM PERMISSION: Role-Based Access
# ═══════════════════════════════════════════
class IsAdminRole(permissions.BasePermission):
    """Only users with the 'admin' role can access"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(request.user, 'profile') and request.user.profile.role:
            return request.user.profile.role.name == 'admin'
        return request.user.is_superuser


class RoleBasedProductPermission(permissions.BasePermission):
    """
    Controls what each role can do with products:
    - Admin    → Full access (GET, POST, PUT, DELETE)
    - Buyer    → Read only (GET)
    - Supplier → Read + Update (GET, PUT, PATCH)
    """
    def has_permission(self, request, view):
        # Allow unauthenticated read access for development
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user.is_authenticated:
            return False

        # Superusers can do anything
        if request.user.is_superuser:
            return True

        # Check user's role
        if hasattr(request.user, 'profile') and request.user.profile.role:
            role = request.user.profile.role.name

            if role == 'admin':
                return True  # Admin can do everything
            elif role == 'supplier':
                # Suppliers can read + create + update, but NOT delete
                return request.method in ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'OPTIONS']
            elif role == 'buyer':
                # Buyers can only read
                return request.method in permissions.SAFE_METHODS

        return False


# ═══════════════════════════════════════════
# 1) PRODUCT VIEWSET — Full CRUD + Search/Filter
# ═══════════════════════════════════════════
class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for products.

    GET    /api/products/       → List all products (with search + filter)
    POST   /api/products/       → Create a new product (admin only)
    GET    /api/products/{id}/  → Get one product
    PUT    /api/products/{id}/  → Update a product (admin/supplier)
    DELETE /api/products/{id}/  → Delete a product (admin only)

    Query parameters:
    - ?search=water     → Search by product name
    - ?category=Electronics → Filter by category
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [RoleBasedProductPermission]

    # Enable search and filtering
    filter_backends = [
        filters.SearchFilter,       # ?search=...
        DjangoFilterBackend,         # ?category=...
        filters.OrderingFilter,      # ?ordering=...
    ]
    search_fields = ['name', 'description']     # Which fields to search
    filterset_fields = ['category']              # Which fields to filter by
    ordering_fields = ['product_id', 'name', 'selling_price', 'demand_forecast']

    def get_queryset(self):
        qs = super().get_queryset()
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(selling_price__gte=min_price)
        if max_price:
            qs = qs.filter(selling_price__lte=max_price)
        return qs


# ═══════════════════════════════════════════
# 2) REGISTER VIEW — User Signup
# ═══════════════════════════════════════════
class RegisterView(APIView):
    """
    POST /api/auth/register/

    Create a new user account.
    Body: { username, email, password, role, phone?, company? }
    Returns: JWT tokens (access + refresh)
    """
    permission_classes = [AllowAny]  # Anyone can register

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Generate JWT tokens for the new user
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════
# 3) LOGIN VIEW — User Login
# ═══════════════════════════════════════════
class LoginView(APIView):
    """
    POST /api/auth/login/

    Log in with username + password.
    Body: { username, password }
    Returns: JWT tokens (access + refresh) + user info
    """
    permission_classes = [AllowAny]  # Anyone can try to log in

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)

        if serializer.is_valid():
            # Check if username + password matches
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password'],
            )

            if user is not None:
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)

                # Get user's role
                role_name = None
                if hasattr(user, 'profile') and user.profile.role:
                    role_name = user.profile.role.name

                return Response({
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': role_name,
                    },
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    }
                })
            else:
                return Response(
                    {'error': 'Invalid username or password'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════
# 4) PROFILE VIEW — Current User Info
# ═══════════════════════════════════════════
class ProfileView(APIView):
    """
    GET /api/auth/profile/

    Returns the currently logged-in user's profile.
    Requires a valid JWT token in the Authorization header.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# ═══════════════════════════════════════════
# 5) ROLE LIST VIEW — Available Roles
# ═══════════════════════════════════════════
class RoleListView(generics.ListAPIView):
    """
    GET /api/auth/roles/

    Lists all available roles (admin, buyer, supplier).
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAny]
