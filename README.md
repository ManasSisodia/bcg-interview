# Price Optimization Tool (BCG X Style)

A full-stack data-driven pricing intelligence dashboard built with Django (Backend) and React (Frontend).

## 📊 Features

- **Intelligent Dashboard**: Real-time sales vs. demand forecast visualization.
- **Product Management**: Categorized inventory control with search and filtering.
- **Pricing Engine**: AI-driven price recommendations to maximize profit margin and inventory turnover.

## 🛠 Tech Stack

- **Backend**: Django, Django REST Framework, UV (Python package manager).
- **Frontend**: React, Vite, Tailwind CSS, Lucide-React, Recharts.
- **Database**: SQLite (managed via Django ORM).

## 🚦 Getting Started

### 1. Backend Setup

```bash
cd backend
# Install dependencies and sync DB
uv sync
uv run python manage.py migrate
# Seed data from CSV
uv run python manage.py seed_products
# Start Server
uv run python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend
# Install dependencies
npm install
# Start Dev Server
npm run dev
```

## 🧠 Business Logic: Optimization Strategy

- **Base Margin**: Minimum $Cost + 20\%$.
- **Scarcity Pricing**: Prices increase by 5-10% if `demand_forecast` exceeds `stock_available`.
- **Premium Factor**: Ratings > 4.5 allow for higher positioning.
- **Clearance Engine**: Automatic discount suggestions for stale inventory.
