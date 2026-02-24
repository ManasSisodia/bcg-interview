# 🎯 BCG Interview — Foolproof Prep Guide

> **You have 1-2 days. This guide is your playbook.** Read it top to bottom, then practice the exercises.

---

## 📋 Table of Contents

1. [Your Project Architecture — Know It Cold](#1-your-project-architecture--know-it-cold)
2. [Scenario 1: Code From Scratch](#2-scenario-1-code-from-scratch)
3. [Scenario 2: Questions + Improve Bottlenecks](#3-scenario-2-questions--improve-bottlenecks)
4. [Day-by-Day Study Plan](#4-day-by-day-study-plan)
5. [Code Snippets You Must Be Able to Write](#5-code-snippets-you-must-be-able-to-write)
6. [Likely Interview Questions + Answers](#6-likely-interview-questions--answers)
7. [Bottlenecks They Might Ask You to Fix](#7-bottlenecks-they-might-ask-you-to-fix)
8. [Confidence Boosters](#8-confidence-boosters)

---

## 1. Your Project Architecture — Know It Cold

**You MUST be able to draw this on a whiteboard in 30 seconds:**

```
┌────────────────┐       HTTP/JSON        ┌────────────────┐
│   React App    │  ←───────────────────→  │  Django API    │
│   (Vite)       │    JWT Auth Header      │  (DRF)         │
│   Port 5173    │                         │  Port 8000     │
│                │                         │                │
│  App.jsx       │   GET /api/products/    │  views.py      │
│  ProductTable  │   POST /api/products/   │  serializers.py│
│  LoginPage     │   POST /api/auth/login/ │  models.py     │
│  Layout        │   POST /api/bulk-forecast│ urls.py       │
└────────────────┘                         └───────┬────────┘
                                                   │
                                           ┌───────┴────────┐
                                           │   SQLite DB    │
                                           │   (db.sqlite3) │
                                           └────────────────┘
```

### File Map — What Lives Where

| File                          | What it does                                     | One-liner to remember  |
| ----------------------------- | ------------------------------------------------ | ---------------------- |
| **`models.py`**               | 3 tables: Product (11 fields), Role, UserProfile | "The database schema"  |
| **`views.py`**                | API endpoints: CRUD + Auth + BulkForecast        | "The request handlers" |
| **`serializers.py`**          | Converts DB objects ↔ JSON                       | "The translator"       |
| **`urls.py`**                 | Maps URLs to views                               | "The router"           |
| **`App.jsx`**                 | Main component, state management, routing        | "The brain"            |
| **`ProductTable.jsx`**        | Product list with selection, pagination          | "The table"            |
| **`Layout.jsx`**              | Sidebar + Header + Action bar                    | "The shell"            |
| **`LoginPage.jsx`**           | Login + Registration forms                       | "The door"             |
| **`DemandForecastModal.jsx`** | Chart.js line chart for forecast                 | "The graph"            |
| **`api.js`**                  | Axios instance with JWT interceptor              | "The HTTP client"      |
| **`authService.js`**          | Login/logout, token storage                      | "The auth manager"     |
| **`productService.js`**       | Product CRUD + bulk forecast API calls           | "The data layer"       |

### The 3 Models (memorize these)

```python
Product:  product_id, name, description, cost_price, selling_price,
          category, stock_available, units_sold, customer_rating,
          demand_forecast, optimized_price

Role:     name (admin/buyer/supplier), description

UserProfile:  user (OneToOne → Django User), role (FK → Role), phone, company
```

### The 3 Roles (memorize these)

| Role         | Can Do                                | Cannot Do            |
| ------------ | ------------------------------------- | -------------------- |
| **Admin**    | Everything (CRUD all products)        | Nothing restricted   |
| **Buyer**    | View products only (GET)              | Create, Edit, Delete |
| **Supplier** | View + Create + Edit (GET, POST, PUT) | Delete               |

---

## 2. Scenario 1: Code From Scratch

**They give you a blank project and say "build a pricing dashboard."**

### Your game plan (do this IN THIS ORDER):

#### Step 1: Backend (30 min)

```bash
# Don't type from memory. Type commands you KNOW work:
mkdir backend && cd backend
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt django-filter
django-admin startproject config .
python manage.py startapp pricing
```

Then create the model:

```python
# pricing/models.py — MEMORIZE THIS STRUCTURE
class Product(models.Model):
    product_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    stock_available = models.IntegerField()
    units_sold = models.IntegerField()
    customer_rating = models.IntegerField()
    demand_forecast = models.IntegerField(default=0)
    optimized_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
```

Then the serializer:

```python
# pricing/serializers.py
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
```

Then the view:

```python
# pricing/views.py
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
```

Then the URL:

```python
# pricing/urls.py
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
urlpatterns = router.urls
```

**That's 4 files. That's a working API.** Run `migrate`, then `runserver`.

#### Step 2: Frontend (30 min)

```bash
npx -y create-vite@latest frontend -- --template react
cd frontend
npm install axios react-router-dom
```

Create a simple table showing products. You don't need to make it look amazing at first — **get it working, then style it.**

#### Step 3: Auth (if time allows)

Add JWT login. Don't build registration unless asked — login is enough.

#### Step 4: Formulas (5 min)

```javascript
// Demand forecast
const demand = Math.round(units_sold * 1.2 + stock * 0.1);

// Optimized price
const ratio = demand / (demand + stock);
const price = cost + (sell - cost) * (0.7 + 0.3 * ratio);
```

### 🔑 Key mindset: WORKING > PRETTY > PERFECT

Get something running first. Add features incrementally. Talk while you code.

---

## 3. Scenario 2: Questions + Improve Bottlenecks

**They look at your existing project and grill you.**

### What they will DEFINITELY ask:

#### "Walk me through the architecture"

→ Draw the diagram from Section 1. Say:

> "It's a standard REST architecture. React frontend talks to Django REST Framework backend via JSON over HTTP. Auth is JWT-based. The DB is SQLite managed through Django's ORM."

#### "How does authentication work?"

→ Say:

> "User logs in with username/password. Backend validates credentials and returns a JWT access token (15 min) and refresh token (1 day). Frontend stores the access token in localStorage and attaches it to every API request via an Axios interceptor. When it expires, the interceptor automatically uses the refresh token to get a new access token."

#### "Explain your RBAC implementation"

→ Say:

> "Three roles: admin, buyer, supplier. On the backend, I wrote a custom DRF permission class called `RoleBasedProductPermission` that checks the user's role from their profile and allows/denies HTTP methods accordingly. On the frontend, I check the role to conditionally show/hide UI elements like the Add and Delete buttons. Both layers enforce it — the UI hides things, but the API also blocks unauthorized requests."

#### "Explain the pricing formula"

→ Say (use the slider analogy from the simplified doc):

> "There are two formulas. For demand forecast, I use historical sales with a 20% growth factor plus a small inventory signal. For optimized price, I calculate a demand-supply ratio, then set the price within 70-100% of the profit margin based on that ratio. High demand pushes price up, high stock pushes it down, but there's always a 70% margin floor to prevent unprofitable pricing."

---

## 4. Day-by-Day Study Plan

### Day 1 (TODAY) — Understand + Memorize

| Time       | What to do                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| **1 hour** | Read through ALL your project files. Not skim — READ. Open each file, understand every line          |
| **30 min** | Practice drawing the architecture diagram on paper 3 times                                           |
| **30 min** | Memorize the 3 models, 3 roles, and their permissions                                                |
| **1 hour** | Practice writing the model + serializer + view + URL from memory (Section 2 Step 1). Do it 3 times   |
| **30 min** | Practice explaining the formulas out loud (pretend you're explaining to a friend)                    |
| **30 min** | Read through the "Likely Interview Questions" section below and practice saying the answers OUT LOUD |

### Day 2 (TOMORROW) — Practice + Polish

| Time       | What to do                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| **1 hour** | Code from scratch: Create a NEW Django project with Product model + API. Time yourself. Target: 20 minutes |
| **30 min** | Practice the bottleneck fixes from Section 7. Actually TYPE the code changes                               |
| **1 hour** | Mock interview with yourself: ask yourself each question from Section 6, answer out loud                   |
| **30 min** | Run your project. Click through EVERY feature. Be ready to demo                                            |
| **30 min** | Rest. Seriously. Don't cram the last hour. Go in fresh                                                     |

---

## 5. Code Snippets You Must Be Able to Write

### ① Django Model (most likely to be asked)

```python
class Product(models.Model):
    name = models.CharField(max_length=255)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    stock_available = models.IntegerField()
    units_sold = models.IntegerField()
```

Practice writing this without looking. 3 times today.

### ② DRF ViewSet (second most likely)

```python
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
```

That's it. 4 lines. Memorize it.

### ③ DRF Permission Class

```python
from rest_framework.permissions import BasePermission

class RoleBasedPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        role = user.profile.role.name

        if role == 'admin':
            return True
        elif role == 'buyer':
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        elif role == 'supplier':
            return request.method in ['GET', 'POST', 'PUT', 'PATCH']
        return False
```

### ④ Axios interceptor for JWT

```javascript
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### ⑤ React table rendering

```jsx
{
  products.map((p) => (
    <tr key={p.id}>
      <td>{p.name}</td>
      <td>${p.selling_price}</td>
      <td>{p.category}</td>
    </tr>
  ));
}
```

### ⑥ The pricing formula

```javascript
const demand = Math.round(units_sold * 1.2 + stock * 0.1);
const ratio = demand / (demand + stock);
const optimized = cost + (sell - cost) * (0.7 + 0.3 * ratio);
```

---

## 6. Likely Interview Questions + Answers

### Architecture & Design

**Q: Why Django + React? Why not Next.js or Flask?**

> Django gives us a full-featured ORM, admin panel, authentication system, and DRF makes building REST APIs fast. React gives us a component-based, reactive UI. Separating them means the API can serve mobile apps too in the future.

**Q: Why SQLite? Would you use something else in production?**

> SQLite is perfect for development and demo — zero config, single file. In production, I'd switch to PostgreSQL for concurrency, better performance on complex queries, and proper production support. The switch is just changing one Django setting.

**Q: Why JWT instead of session-based auth?**

> JWT is stateless — the server doesn't need to store session data. It scales better because any server instance can verify the token. It also works well with SPAs and mobile apps since they can't use cookies easily.

**Q: Why HashRouter instead of BrowserRouter?**

> HashRouter works without server-side routing configuration. Since we're serving the React app as a static bundle, hash-based routing ensures all routes work without needing to configure Django to serve index.html for every path.

### Technical Deep-Dives

**Q: How does your search work?**

> DRF's `SearchFilter` does a case-insensitive `LIKE` query on the `name` and `description` fields. On the frontend, I debounce the search input (500ms) to avoid firing a request on every keystroke.

**Q: How does pagination work?**

> DRF's built-in `PageNumberPagination` splits results into pages of 10. The API returns `count`, `next`, and `previous` URLs. The frontend uses these to render page navigation buttons.

**Q: What happens if two people edit the same product?**

> Currently, last write wins — no optimistic locking. To fix this, I'd add a `version` field to the model and check it on update. If the version doesn't match, reject the update and tell the user to refresh.

**Q: How do you handle errors?**

> On the backend, DRF serializers validate data and return 400 with field-level errors. On the frontend, Axios catches errors, and I show toast notifications using react-hot-toast (not alerts — better UX). Network errors show a generic message.

### Business Logic

**Q: Explain the demand forecast formula**

> `demand = units_sold × 1.2 + stock_available × 0.1`. The main signal is historical sales with 20% projected growth. Stock adds a secondary signal — if you stocked up, you expected demand. It's a form of weighted moving average used in demand planning.

**Q: Explain the optimized price formula**

> `optimized_price = cost + margin × (0.7 + 0.3 × demand_ratio)`. The margin is the gap between cost and selling price. The demand_ratio tells how strong demand is relative to supply. There's a 70% margin floor as protection, and demand can push it up by another 30%. High demand = price close to selling price. Low demand = price drops, but never below 70% of margin.

**Q: Why not just use selling_price × 0.85?**

> That's a static formula — it gives the same discount regardless of how well the product is selling. Our formula is demand-responsive: hot products keep their price, slow products get discounted. That's how real pricing optimization works.

---

## 7. Bottlenecks They Might Ask You to Fix

### 🔴 Bottleneck 1: "This SQL query is slow on 100K products"

**Problem:** `Product.objects.all()` loads everything.
**Your answer:**

```python
# Already have: pagination (10 per page)
# Already have: db_index on product_id, name, category, selling_price
# I'd add: select_only for the columns the list page needs
Product.objects.only('id', 'product_id', 'name', 'category',
                     'selling_price', 'cost_price', 'stock_available')
```

### 🔴 Bottleneck 2: "Add a caching layer"

**Your answer:**

```python
# Django has built-in caching. For product list:
from django.views.decorators.cache import cache_page

@cache_page(60 * 5)  # Cache for 5 minutes
def list(self, request):
    ...

# For smarter caching: redis + cache invalidation on product save
# using Django signals
```

### 🔴 Bottleneck 3: "The bulk forecast is N+1 queries"

**Problem:** Our BulkForecastView does one query per product.
**Your answer:**

```python
# Instead of looping Product.objects.get() for each item:
from django.db.models import Case, When, Value

# Batch update in a single query:
Product.objects.filter(id__in=[item['id'] for item in items]).update(...)

# Or use bulk_update:
products = Product.objects.filter(id__in=ids)
for p in products:
    p.demand_forecast = lookup[p.id]['demand_forecast']
    p.optimized_price = lookup[p.id]['optimized_price']
Product.objects.bulk_update(products, ['demand_forecast', 'optimized_price'])
```

### 🔴 Bottleneck 4: "Switch from SQLite to PostgreSQL"

**Your answer:**

```python
# settings.py — just change DATABASES
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pricing_db',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
# Then: pip install psycopg2-binary
# Then: python manage.py migrate
```

### 🔴 Bottleneck 5: "Add input validation"

**Your answer:**

```python
# In serializers.py — add validate methods:
class ProductSerializer(serializers.ModelSerializer):
    def validate_cost_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Cost price cannot be negative")
        return value

    def validate(self, data):
        if data.get('selling_price', 0) < data.get('cost_price', 0):
            raise serializers.ValidationError("Selling price must be >= cost price")
        return data
```

### 🔴 Bottleneck 6: "The frontend re-renders too much"

**Your answer:**

> I'd wrap expensive components in `React.memo()`, use `useMemo` for derived data like chart datasets, and `useCallback` for handlers passed as props. For the product table, I'd also consider virtualization with `react-window` if the list grows large.

---

## 8. Confidence Boosters

### Things you've ALREADY built that are impressive:

1. ✅ **Full CRUD with REST API** — not a toy, a real paginated + searchable + filterable API
2. ✅ **JWT Authentication** with automatic token refresh
3. ✅ **Role-Based Access Control** — enforced on BOTH frontend AND backend
4. ✅ **Demand-Responsive Pricing** — not a static formula, it responds to demand/supply signals
5. ✅ **Cross-Page Selection Persistence** — selections survive page navigation
6. ✅ **Database Indexes** — you added composite indexes for query performance
7. ✅ **Toast Notifications** — professional UX, not amateur alerts
8. ✅ **Data Visualization** — Chart.js integration with real dynamic data

### When you don't know something, say this:

> "I haven't implemented that yet, but here's how I'd approach it..."

Then describe the approach at a high level. They're testing your thinking, not your memory.

### The #1 thing interviewers look for:

**Can you EXPLAIN your code, not just write it?**

Every time you write or show code, say WHY. Not "this is a ViewSet" but "I used a ViewSet because it gives me all CRUD operations in one class — I don't need to write separate GET/POST/PUT/DELETE views."

---

## 🏁 Final Checklist Before the Interview

- [ ] Can I draw the architecture diagram in 30 seconds?
- [ ] Can I write a Django model from memory?
- [ ] Can I write a DRF ViewSet from memory?
- [ ] Can I explain JWT auth flow in 3 sentences?
- [ ] Can I explain the 3 roles and what each can do?
- [ ] Can I explain both formulas and WHY they work?
- [ ] Can I walk through 2 bottlenecks and fix them?
- [ ] Can I run my project and demo every feature?
- [ ] Have I said my answers OUT LOUD at least once?

**Go crush it. You built this thing. You understand it. Now show them.** 💪
