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

    def create(self, validated_data):
        # Auto-generate product_id (max existing + 1)
        if 'product_id' not in validated_data or validated_data['product_id'] is None:
            max_id = Product.objects.order_by('-product_id').values_list('product_id', flat=True).first()
            validated_data['product_id'] = (max_id or 0) + 1

        # Default customer_rating
        if 'customer_rating' not in validated_data:
            validated_data['customer_rating'] = 4

        # Compute demand_forecast: units_sold * 1.2 + stock_available * 0.1
        if 'demand_forecast' not in validated_data or validated_data['demand_forecast'] is None:
            units_sold = int(validated_data.get('units_sold', 0))
            stock = int(validated_data.get('stock_available', 0))
            validated_data['demand_forecast'] = int(units_sold * 1.2 + stock * 0.1)

        # Compute optimized_price: cost_price * 0.3 + selling_price * 0.7 (weighted blend)
        if 'optimized_price' not in validated_data or validated_data['optimized_price'] is None:
            cost = float(validated_data.get('cost_price', 0))
            sell = float(validated_data.get('selling_price', 0))
            validated_data['optimized_price'] = round(cost * 0.3 + sell * 0.7, 2)

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Recompute demand_forecast if units_sold or stock changed
        units_sold = int(validated_data.get('units_sold', instance.units_sold))
        stock = int(validated_data.get('stock_available', instance.stock_available))
        if 'demand_forecast' not in validated_data:
            validated_data['demand_forecast'] = int(units_sold * 1.2 + stock * 0.1)

        # Recompute optimized_price if prices changed
        cost = float(validated_data.get('cost_price', instance.cost_price))
        sell = float(validated_data.get('selling_price', instance.selling_price))
        if 'optimized_price' not in validated_data:
            validated_data['optimized_price'] = round(cost * 0.3 + sell * 0.7, 2)

        return super().update(instance, validated_data)


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
