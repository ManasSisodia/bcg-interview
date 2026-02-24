# Price Optimization Tool (BCG X Style)

A full-stack data-driven pricing intelligence dashboard built with Django (Backend) and React (Frontend).

## 📊 Features

- **Intelligent Dashboard**: Real-time sales vs. demand forecast visualization.
- **Product Management**: Categorized inventory control with search and filtering.
- **Pricing Engine**: AI-driven price recommendations to maximize profit margin and inventory turnover.

## 🛠 Tech Stack

### Backend

- **Framework**: [Django 5.x](https://www.djangoproject.com/) & [Django REST Framework](https://www.django-rest-framework.org/)
- **Authentication**: [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/) (JWT-based Auth)
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **Package Manager**: [UV](https://github.com/astral-sh/uv) (Extremely fast Python package installer)
- **Utilities**: `django-filter`, `django-cors-headers`, `python-decouple`

### Frontend

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) (Dialog, Select, Switch, Slot)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Chart.js](https://www.chartjs.org/) & [React-Chartjs-2](https://react-chartjs-2.js.org/)
- **State/Routing**: [React Router 7](https://reactrouter.com/)
- **Utilities**: `Axios` (API Fetching), `Luxon` (Date handling), `React Hot Toast` (Notifications)

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

The tool uses a dynamic pricing engine based on demand forecasting and margin preservation:

- **Demand Forecast Engine**:
  - Formula: `(Units Sold * 1.2) + (Stock Available * 0.1)`
  - Purpose: Weighs historical sales performance heavily while factoring in inventory buffer.

- **Margin-Based Price Optimization**:
  - **Demand Ratio**: The ratio of new forecast vs. current forecast (Capped at `0.5x` min and `2.0x` max).
  - **Demand Multiplier**: `0.7 + (0.3 * Demand Ratio)`.
  - **New Price**: `Cost Price + (Original Margin * Demand Multiplier)`.

- **Safety Guardrails**:
  - **Loss Prevention**: Optimized prices are never allowed to fall below the **Cost Price**.
  - **Stability Cap**: Ratios are clipped to prevent extreme price fluctuations from outliers.
