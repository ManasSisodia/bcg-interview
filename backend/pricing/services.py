"""
services.py
-----------
Contains pure business logic and complex database operations.
Keeping business logic out of views ("thin views, fat services") makes
the code more testable, reusable, and maintainable.
"""
from django.db import transaction
from django.db.models import Max
from .models import Product

def get_next_product_id() -> int:
    """
    Returns the next available product_id.
    """
    max_id = Product.objects.aggregate(Max('product_id'))['product_id__max']
    return (max_id or 0) + 1

@transaction.atomic
def bulk_update_forecasts(items: list[dict]) -> int:
    """
    Takes a list of dictionaries containing {id, demand_forecast, optimized_price}
    and performs a single bulk update query on the database.
    
    Returns the number of products updated.
    """
    if not items:
        return 0

    # Extract IDs to fetch products
    item_ids = [item['id'] for item in items if 'id' in item]
    if not item_ids:
        return 0

    # Fetch all relevant products in one query
    products = Product.objects.filter(id__in=item_ids)
    
    # Create a fast lookup dictionary
    update_data = {item['id']: item for item in items if 'id' in item}
    
    products_to_update = []
    
    for product in products:
        data = update_data.get(product.id)
        if not data:
            continue
            
        # Update fields only if they are provided in the data
        updated = False
        if 'demand_forecast' in data:
            product.demand_forecast = data['demand_forecast']
            updated = True
        
        if 'optimized_price' in data:
            product.optimized_price = data['optimized_price']
            updated = True
            
        if updated:
            products_to_update.append(product)
            
    if products_to_update:
        Product.objects.bulk_update(
            products_to_update, 
            ['demand_forecast', 'optimized_price']
        )
        return len(products_to_update)
        
    return 0
