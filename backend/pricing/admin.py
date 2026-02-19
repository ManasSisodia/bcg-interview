"""
admin.py
--------
Registers all models in the Django Admin panel.

This lets you manage Products, Roles, and User Profiles
directly from http://localhost:8000/admin/

Each model has a customized admin class that controls:
- Which columns show in the list view
- Which fields are searchable
- Which fields can be filtered
"""
from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from .models import Product, Role, UserProfile


# ═══════════════════════════════════════════
# 1) PRODUCT ADMIN
# ═══════════════════════════════════════════
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Columns shown in the product list
    list_display = [
        'product_id',
        'name',
        'category',
        'cost_price',
        'selling_price',
        'stock_available',
        'units_sold',
        'demand_forecast',
        'optimized_price',
    ]
    # Search by product name or description
    search_fields = ['name', 'description']
    # Filter sidebar by category
    list_filter = ['category']
    # Default sorting
    ordering = ['product_id']


# ═══════════════════════════════════════════
# 2) ROLE ADMIN
# ═══════════════════════════════════════════
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


# ═══════════════════════════════════════════
# 3) USER PROFILE ADMIN (Inline)
# ═══════════════════════════════════════════
# We show the UserProfile fields INSIDE the User admin page
# using an "inline" — this means when you edit a User, you
# also see their profile fields on the same page.
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name = "Profile"
    verbose_name_plural = "Profile"


# Extend the default User admin to include the profile inline
class CustomUserAdmin(UserAdmin):
    inlines = [UserProfileInline]
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'get_role']

    def get_role(self, obj):
        """Show the user's role in the list view"""
        if hasattr(obj, 'profile') and obj.profile.role:
            return obj.profile.role.name
        return '-'
    get_role.short_description = 'Role'


# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# Also register UserProfile separately for direct access
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'phone', 'company']
    list_filter = ['role']
    search_fields = ['user__username', 'user__email', 'company']
