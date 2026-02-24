"""
serializers.py
--------------
Serializers convert Python objects ↔ JSON.

We have serializers for:
1. Product         — All 11 product fields (auto-computes product_id, demand_forecast, optimized_price)
2. UserRegister    — For creating a new user account
3. UserLogin       — For logging in (returns JWT tokens)
4. UserProfile     — For viewing user info + role
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Role, UserProfile
from .services import get_next_product_id


# ═══════════════════════════════════════════
# 1) PRODUCT SERIALIZER
# ═══════════════════════════════════════════
class ProductSerializer(serializers.ModelSerializer):
    """
    Converts Product model ↔ JSON with all fields.
    Auto-generates: product_id, demand_forecast, optimized_price, customer_rating.
    """
    product_id = serializers.IntegerField(required=False)
    customer_rating = serializers.IntegerField(required=False, default=4)
    demand_forecast = serializers.IntegerField(required=False)
    optimized_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = Product
        fields = '__all__'

    def validate(self, data):
        """Cross-field validation."""
        cost = data.get('cost_price')
        selling = data.get('selling_price')
        
        if cost is not None and selling is not None:
            if cost > selling:
                raise serializers.ValidationError({
                    "cost_price": "Cost price cannot be greater than selling price."
                })
        return data

    def create(self, validated_data):
        # Auto-generate product_id if not provided
        if not validated_data.get('product_id'):
            validated_data['product_id'] = get_next_product_id()

        return super().create(validated_data)


# ═══════════════════════════════════════════
# 2) ROLE SERIALIZER
# ═══════════════════════════════════════════
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']


# ═══════════════════════════════════════════
# 3) USER REGISTRATION SERIALIZER
# ═══════════════════════════════════════════
class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.CharField(max_length=50, default='buyer')
    phone = serializers.CharField(max_length=20, required=False, default='')
    company = serializers.CharField(max_length=255, required=False, default='')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        role, _ = Role.objects.get_or_create(name=validated_data.get('role', 'buyer'))
        UserProfile.objects.create(
            user=user,
            role=role,
            phone=validated_data.get('phone', ''),
            company=validated_data.get('company', ''),
        )
        return user


# ═══════════════════════════════════════════
# 4) USER LOGIN SERIALIZER
# ═══════════════════════════════════════════
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


# ═══════════════════════════════════════════
# 5) USER PROFILE SERIALIZER
# ═══════════════════════════════════════════
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    role = RoleSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'role', 'phone', 'company']
