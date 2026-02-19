"""
models.py
---------
Defines all database tables (models) for the Price Optimization Tool.

Models:
1. Role          — User roles (admin, buyer, supplier)
2. UserProfile   — Extends Django's User with role, phone, company
3. Product       — The 10 products with all 11 attributes from the spec
"""
from django.db import models
from django.contrib.auth.models import User


# ═══════════════════════════════════════════
# 1) ROLE MODEL
# ═══════════════════════════════════════════
# Each user gets assigned a role that controls what they can do.
# The requirement says: admin, buyer, supplier, custom roles.
class Role(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('buyer', 'Buyer'),
        ('supplier', 'Supplier'),
    ]

    name = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        unique=True,
        help_text="The name of this role (admin, buyer, or supplier)"
    )
    description = models.TextField(
        blank=True,
        help_text="What this role is allowed to do"
    )

    def __str__(self):
        return self.get_name_display()

    class Meta:
        verbose_name = "Role"
        verbose_name_plural = "Roles"


# ═══════════════════════════════════════════
# 2) USER PROFILE MODEL
# ═══════════════════════════════════════════
# Django already has a built-in User model (username, email, password).
# We EXTEND it with extra fields using a OneToOneField.
# This is called the "profile pattern" — very common in Django.
class UserProfile(models.Model):
    # Links to Django's built-in User (one profile per user)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        help_text="The Django User this profile belongs to"
    )
    # Which role does this user have?
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        help_text="The role assigned to this user"
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="User's phone number"
    )
    company = models.CharField(
        max_length=255,
        blank=True,
        help_text="User's company name"
    )

    def __str__(self):
        role_name = self.role.name if self.role else "no role"
        return f"{self.user.username} ({role_name})"

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"


# ═══════════════════════════════════════════
# 3) PRODUCT MODEL
# ═══════════════════════════════════════════
# All 11 attributes from the requirements document.
# This is the core table of the application.
class Product(models.Model):
    product_id = models.IntegerField(
        unique=True,
        help_text="Unique numeric ID for the product"
    )
    name = models.CharField(
        max_length=255,
        help_text="Product name (e.g., 'Eco-Friendly Water Bottle')"
    )
    description = models.TextField(
        help_text="Detailed product description"
    )
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="How much it costs to make/buy this product"
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Current selling price to customers"
    )
    category = models.CharField(
        max_length=100,
        help_text="Product category (e.g., 'Electronics', 'Apparel')"
    )
    stock_available = models.IntegerField(
        help_text="How many units are currently in stock"
    )
    units_sold = models.IntegerField(
        help_text="Total units sold so far"
    )
    customer_rating = models.IntegerField(
        help_text="Average customer rating (1-5)"
    )
    demand_forecast = models.IntegerField(
        help_text="Predicted future demand (units)"
    )
    optimized_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="AI-recommended optimal selling price"
    )

    def __str__(self):
        return f"{self.name} (ID: {self.product_id})"

    class Meta:
        ordering = ['product_id']
        verbose_name = "Product"
        verbose_name_plural = "Products"
