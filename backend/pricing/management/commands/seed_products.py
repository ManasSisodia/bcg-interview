"""
seed_products.py
----------------
Management command to seed the database with initial data.

Seeds:
1. Three roles (admin, buyer, supplier)
2. One admin user (username: admin, password: admin123)
3. All 10 products from the requirements document

Run with: uv run python manage.py seed_products
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from pricing.models import Product, Role, UserProfile


class Command(BaseCommand):
    help = 'Seeds the database with roles, an admin user, and 10 products'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...\n')

        # ── Step 1: Create Roles ──
        self.stdout.write('  Creating roles...')
        roles_data = [
            {'name': 'admin', 'description': 'Full access — can create, edit, and delete products'},
            {'name': 'buyer', 'description': 'Read-only access — can view products and forecasts'},
            {'name': 'supplier', 'description': 'Can view and update products, but cannot delete'},
        ]
        for role_data in roles_data:
            Role.objects.get_or_create(
                name=role_data['name'],
                defaults={'description': role_data['description']}
            )
        self.stdout.write(self.style.SUCCESS(' ✓ Roles created'))

        # ── Step 2: Create Admin User ──
        self.stdout.write('  Creating admin user...')
        admin_role = Role.objects.get(name='admin')

        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                first_name='Amish',
                last_name='Singh',
            )
            UserProfile.objects.create(
                user=admin_user,
                role=admin_role,
                company='BCG X',
            )
            self.stdout.write(self.style.SUCCESS(' ✓ Admin user created (admin / admin123)'))
        else:
            self.stdout.write(self.style.WARNING(' ⚠ Admin user already exists, skipping'))

        # ── Step 3: Create 10 Products ──
        # These are the exact products from the requirements document
        self.stdout.write('  Creating products...')
        products_data = [
            {
                'product_id': 1,
                'name': 'Eco-Friendly Water Bottle',
                'description': 'A sustainable, reusable water bottle made from recycled materials.',
                'cost_price': 5.00,
                'selling_price': 12.99,
                'category': 'Outdoor & Sports',
                'stock_available': 500,
                'units_sold': 200,
                'customer_rating': 4,
                'demand_forecast': 0,
                'optimized_price': 0,
            },
            {
                'product_id': 2,
                'name': 'Wireless Earbuds',
                'description': 'Bluetooth 5.0 wireless earbuds with noise cancellation and long battery life.',
                'cost_price': 25.00,
                'selling_price': 59.99,
                'category': 'Electronics',
                'stock_available': 300,
                'units_sold': 150,
                'customer_rating': 5,
                'demand_forecast': 0,
                'optimized_price': 0,
            },
            {
                'product_id': 3,
                'name': 'Organic Cotton T-Shirt',
                'description': 'Soft, breathable t-shirt made from 100% organic cotton.',
                'cost_price': 8.00,
                'selling_price': 19.99,
                'category': 'Apparel',
                'stock_available': 400,
                'units_sold': 100,
                'customer_rating': 4,
                'demand_forecast': 0,
                'optimized_price': 0,
            },
            {
                'product_id': 4,
                'name': 'Smart Home Hub',
                'description': 'Control all your smart home devices with this central hub.',
                'cost_price': 40.00,
                'selling_price': 99.99,
                'category': 'Home Automation',
                'stock_available': 150,
                'units_sold': 75,
                'customer_rating': 4,
                'demand_forecast': 0,
                'optimized_price': 0,
            },
            {
                'product_id': 5,
                'name': 'Electric Scooter',
                'description': 'Lightweight electric scooter with a range of 20 miles.',
                'cost_price': 150.00,
                'selling_price': 299.99,
                'category': 'Transportation',
                'stock_available': 80,
                'units_sold': 40,
                'customer_rating': 5,
                'demand_forecast': 0,
                'optimized_price': 0,
            },
            {
                'product_id': 6,
                'name': 'Noise-Canceling Headphones',
                'description': 'Over-ear headphones with active noise cancellation.',
                'cost_price': 50.00,
                'selling_price': 129.99,
                'category': 'Electronics',
                'stock_available': 200,
                'units_sold': 90,
                'customer_rating': 4,
                'demand_forecast': 0,
                'optimized_price': 0,
            },
            {
                'product_id': 7,
                'name': 'Smartwatch',
                'description': 'Feature-packed smartwatch with heart rate monitor and GPS.',
                'cost_price': 70.00,
                'selling_price': 149.99,
                'category': 'Wearables',
                'stock_available': 250,
                'units_sold': 130,
                'customer_rating': 5,
                'demand_forecast': 0,
                'optimized_price': 0,
            },
            {
                'product_id': 8,
                'name': 'Portable Solar Charger',
                'description': 'Compact solar charger for outdoor use.',
                'cost_price': 20.00,
                'selling_price': 39.99,
                'category': 'Outdoor & Sports',
                'stock_available': 300,
                'units_sold': 140,
                'customer_rating': 4,
                'demand_forecast': 0,
                'optimized_price': 0,
            },
            {
                'product_id': 9,
                'name': 'Fitness Tracker',
                'description': 'Wearable fitness tracker with sleep monitoring.',
                'cost_price': 30.00,
                'selling_price': 59.99,
                'category': 'Wearables',
                'stock_available': 350,
                'units_sold': 180,
                'customer_rating': 4,
                'demand_forecast': 0,
                'optimized_price': 0,
            },
            {
                'product_id': 10,
                'name': 'Bluetooth Speaker',
                'description': 'Portable Bluetooth speaker with excellent sound quality.',
                'cost_price': 15.00,
                'selling_price': 45.99,
                'category': 'Electronics',
                'stock_available': 400,
                'units_sold': 210,
                'customer_rating': 4,
                'demand_forecast': 0,
                'optimized_price': 0,
            },
        ]

        for p in products_data:
            Product.objects.update_or_create(
                product_id=p['product_id'],
                defaults=p,
            )
        self.stdout.write(self.style.SUCCESS(f' ✓ {len(products_data)} products created'))

        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!'))
        self.stdout.write(f'   Admin login: username=admin, password=admin123')
        self.stdout.write(f'   Products: {Product.objects.count()}')
        self.stdout.write(f'   Roles: {Role.objects.count()}')
