# Frontend Codebase — Beginner's Guide

> Everything explained like you're reading it for the first time. No assumptions.

---

## Table of Contents

1. [How React Works (30-second version)](#1-how-react-works)
2. [The File Map — What Lives Where](#2-the-file-map)
3. [The Flow — What Happens When](#3-the-flow)
4. [State Management — Where Data Lives](#4-state-management)
5. [File-by-File Deep Dive](#5-file-by-file-deep-dive)
6. [Data Flow Diagrams](#6-data-flow-diagrams)

---

## 1. How React Works

Before diving in, you need 4 concepts:

### `useState` — a variable that re-renders the screen when it changes

```jsx
const [count, setCount] = useState(0);
// count = the current value (starts at 0)
// setCount = the function to change it
// When you call setCount(5), React re-draws the screen with count = 5
```

### `useEffect` — "do something when X changes"

```jsx
useEffect(() => {
  fetchProducts(); // runs this function...
}, [page]); // ...every time 'page' changes
```

### `useCallback` — "remember this function, don't recreate it every render"

```jsx
const fetchProducts = useCallback(async () => {
  const data = await productService.getProducts();
  setProducts(data.results);
}, [currentPageNum, searchQuery]); // only recreate if these change
```

### Props — passing data from parent to child

```jsx
// Parent passes data DOWN to child:
<ProductTable products={products} onDelete={handleDelete} />

// Child RECEIVES it:
const ProductTable = ({ products, onDelete }) => { ... }
```

**The golden rule:** Data flows DOWN (parent → child via props). Events flow UP (child → parent via callback functions).

---

## 2. The File Map

```
frontend/src/
├── main.jsx                    ← Entry point (renders App)
├── App.jsx                     ← THE BRAIN — all state lives here
├── index.css                   ← All styles (Tailwind config)
│
├── services/                   ← Talks to the backend
│   ├── api.js                  ← Axios HTTP client + JWT interceptor
│   ├── authService.js          ← Login/logout/token management
│   └── productService.js       ← Product CRUD API calls
│
└── components/                 ← Visual pieces
    ├── LoginPage.jsx           ← Login + Register form
    ├── LandingPage.jsx         ← Welcome screen with 2 big buttons
    ├── Layout.jsx              ← Navbar + Header + ActionBar
    ├── ProductTable.jsx        ← The product list table
    ├── AddProductModal.jsx     ← Add/Edit product form popup
    ├── DemandForecastModal.jsx ← Forecast chart + table popup
    └── ui/                     ← Tiny reusable pieces (button, input, table, etc.)
```

---

## 3. The Flow — What Happens When

### 🟢 App Startup

```
1. Browser loads index.html
2. index.html has <div id="root">
3. main.jsx finds that div, renders <App /> inside it
4. App renders <HashRouter> wrapping <AppInner>
5. AppInner checks: is there a token in localStorage?
   ├── NO  → show LoginPage
   └── YES → show LandingPage (or Products/Optimization based on URL)
```

### 🟢 Login Flow

```
1. User types username + password in LoginPage
2. User clicks "Sign In"
3. LoginPage calls authService.login(username, password)
4. authService sends POST /api/auth/login/ to backend
5. Backend validates → returns { tokens: { access, refresh }, user: { ... } }
6. authService stores tokens + user in localStorage
7. LoginPage calls onLoginSuccess(user) — a prop from App.jsx
8. App.jsx receives user → setCurrentUser(user) → setPage('landing')
9. Screen re-renders → shows LandingPage instead of LoginPage
```

### 🟢 Viewing Products

```
1. User clicks "Products" on LandingPage
2. LandingPage calls onNavigate('products') — passed from App.jsx
3. App.jsx: setPage('products') + navigate('/products')
4. This triggers useEffect → fetchProducts()
5. fetchProducts calls productService.getProducts({ page: 1 })
6. productService sends GET /api/products/?page=1 to backend
7. Backend returns { results: [...10 products], count: 11, next: "?page=2" }
8. App.jsx: setProducts(data.results) + setPagination(...)
9. Screen re-renders → ProductTable shows the 10 products
```

### 🟢 Selecting Products + Demand Forecast

```
1. User clicks checkboxes on ProductTable
2. ProductTable updates its internal selectedRows state
3. ProductTable calls onSelectionChange(selectedIds) — prop from App.jsx
4. App.jsx: handleSelectionChange runs:
   - Updates selectedProductIds (array of IDs)
   - Updates selectedProductsMap (object: { id → full product data })
   - This MAP accumulates across pages (page 1 selections survive on page 2)
5. User clicks "Demand Forecast" button
6. App.jsx: handleDemandForecast runs:
   - Gets all products from selectedProductsMap
   - Computes demand_forecast + optimized_price using formulas
   - Calls productService.bulkForecast() to save to DB
   - setForecastedProducts(computed)
   - setShowForecastModal(true) → DemandForecastModal appears
   - fetchProducts() → refreshes table with new DB values
```

### 🟢 Adding a Product

```
1. User clicks "Add New Products" button
2. App.jsx: setShowAddModal(true) → AddProductModal appears
3. User fills form, clicks Submit
4. AddProductModal calls onSubmit(formData) — prop from App.jsx
5. App.jsx: handleAddProduct runs:
   - Calls productService.createProduct(formData) → POST /api/products/
   - On success: close modal + fetchProducts() + toast.success()
   - On error: toast.error(message)
```

---

## 4. State Management — Where Data Lives

**ALL important state lives in `App.jsx` (the AppInner function).** Here's every piece of state and what it does:

### Authentication State

```
currentUser          → { id, username, email, role } or null
page                 → 'login' | 'landing' | 'products' | 'optimization'
```

- `currentUser` is set after login, cleared on logout
- `page` controls which screen you see (it's synced with the URL via React Router)

### Product Data State

```
products             → Array of product objects from current API page
loading              → true while fetching, false when done
pagination           → { count, next, previous } from API response
currentPageNum       → Which page of results we're viewing (1, 2, 3...)
categories           → ['Electronics', 'Apparel', ...] for the dropdown
```

- `products` gets REPLACED every time you change page, search, or filter
- It's always the current page's 10 products, not all products

### Search & Filter State

```
searchQuery          → What the user typed in the search box
categoryFilter       → Selected category from dropdown ('Electronics', '', etc.)
priceFilter          → { min_price: '', max_price: '' }
searchTimeout        → useRef — holds the debounce timer ID
```

- When any of these change → `fetchProducts()` re-runs automatically (via useEffect)
- Search is **debounced** (waits 500ms after typing stops before sending request)

### Modal State

```
showAddModal         → true = show the Add/Edit product popup
editingProduct       → null = adding new, { ...product } = editing existing
viewingProduct       → The product being viewed in detail popup
showForecastModal    → true = show the demand forecast chart popup
showForecastColumn   → true = show "Calculated Demand" column in table
```

### Selection State (cross-page)

```
selectedProductIds   → [3, 5, 8] — just the IDs (passed to ProductTable)
selectedProductsMap  → { 3: {...}, 5: {...}, 8: {...} } — full product DATA by ID
forecastedProducts   → Array of products with computed demand + optimized price
```

- `selectedProductIds` is what ProductTable uses to know which checkboxes are checked
- `selectedProductsMap` is the KEY to cross-page persistence — it accumulates products from ALL pages
- `forecastedProducts` is set when user clicks "Demand Forecast"

### RBAC (Role-Based Access)

```
userRole             → 'admin' | 'buyer' | 'supplier' (from currentUser)
canCreate            → true if admin or supplier
canEdit              → true if admin or supplier
canDelete            → true if admin only
```

- These control whether UI buttons are shown or hidden
- The BACKEND also enforces these rules — the frontend just hides the buttons

---

## 5. File-by-File Deep Dive

### 📄 `main.jsx` — The Entry Point (11 lines)

This is where React "boots up". It finds the `<div id="root">` in your HTML file and puts your entire app inside it.

```jsx
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {" "}
    // Helps catch bugs during development
    <App /> // Your entire application
  </StrictMode>,
);
```

**StrictMode** runs your components twice in development to catch side effects. It's removed in production.

---

### 📄 `services/api.js` — The HTTP Client (47 lines)

Think of this as the **postman**. Every time your app needs to talk to the backend, it goes through this file.

**What it creates:** An Axios instance with `baseURL: 'http://localhost:8000/api'`

**Request Interceptor (lines 20-29):**
Every time you make ANY API call, this runs FIRST:

```
Before request leaves →
  1. Check localStorage for 'access_token'
  2. If found, attach it: Authorization: Bearer <token>
  3. Send the request
```

This means you NEVER need to manually add the token. It's automatic.

**Response Interceptor (lines 32-44):**
Every time a response comes back, this checks:

```
If response status is 401 (Unauthorized) →
  1. Clear all tokens from localStorage
  2. Reload the page → user sees LoginPage
```

This handles expired tokens automatically.

---

### 📄 `services/authService.js` — Auth Manager (59 lines)

Four simple methods:

| Method                      | What it does                                                                |
| --------------------------- | --------------------------------------------------------------------------- |
| `login(username, password)` | POSTs to `/auth/login/`, stores tokens + user in localStorage, returns user |
| `logout()`                  | Removes tokens + user from localStorage                                     |
| `getUser()`                 | Reads user from localStorage, parses JSON, returns it                       |
| `isAuthenticated()`         | Returns `true` if access_token exists in localStorage                       |

**Key insight:** Auth state is stored in **localStorage** (survives page refresh), NOT in React state. React state (`currentUser`) is just a copy for rendering.

---

### 📄 `services/productService.js` — Product API Layer (102 lines)

Every method maps to one API call:

| Method                                                          | HTTP   | URL                            | Purpose                                |
| --------------------------------------------------------------- | ------ | ------------------------------ | -------------------------------------- |
| `getProducts({ page, search, category, min_price, max_price })` | GET    | `/products/?page=1&search=...` | Fetch paginated product list           |
| `getProduct(id)`                                                | GET    | `/products/5/`                 | Fetch single product                   |
| `createProduct(data)`                                           | POST   | `/products/`                   | Add new product                        |
| `updateProduct(id, data)`                                       | PUT    | `/products/5/`                 | Update existing product                |
| `deleteProduct(id)`                                             | DELETE | `/products/5/`                 | Remove product                         |
| `getCategories()`                                               | GET    | `/products/?page_size=100`     | Get unique category names              |
| `bulkForecast(products)`                                        | POST   | `/products/bulk-forecast/`     | Save demand forecast + optimized price |

**getProducts** is the most complex — it builds a URL with query parameters:

```
If page=2, search="bottle", category="Outdoor & Sports"
→ GET /products/?page=2&search=bottle&category=Outdoor+%26+Sports
```

---

### 📄 `App.jsx` — THE BRAIN (435 lines)

This is the biggest and most important file. It has two functions:

#### `App()` (lines 418-434) — The outer shell

```jsx
function App() {
  return (
    <HashRouter>
      <Toaster position="top-right" ... />  // Toast notifications
      <AppInner />                           // The actual app
    </HashRouter>
  );
}
```

It wraps everything in a `HashRouter` (for URL routing) and adds the `Toaster` (for toast notifications).

#### `AppInner()` (lines 40-416) — Where everything happens

**This is the CENTRAL HUB. All state, all handlers, all rendering logic.**

##### The Hooks Section (lines 41-72)

All 20+ `useState` calls live here. This is the "brain's memory."

##### Route Sync (lines 74-95)

Two `useEffect` hooks keep the `page` state synced with the URL:

- If URL changes → update `page` state
- On first load → check URL and set `page` accordingly

##### Data Fetching (lines 97-133)

```
fetchProducts() ← useCallback
  ↓ triggered by useEffect when page/search/category/filter changes
  ↓ calls productService.getProducts(...)
  ↓ updates products + pagination state

fetchCategories() ← useCallback
  ↓ triggered by useEffect when page changes
  ↓ calls productService.getCategories()
  ↓ updates categories state
```

##### Event Handlers (lines 135-224)

Each handler follows the same pattern:

```
1. Call the API (productService.createProduct, etc.)
2. On success: close modal + refresh data + show toast
3. On error: show error toast
```

The most interesting one is `handleSelectionChange` (lines 165-184):

```
When user checks/unchecks a product:
  1. Update selectedProductIds (the ID list)
  2. Update selectedProductsMap:
     - Loop through checked IDs → if product not in map, ADD it
     - Loop through current page IDs → if unchecked, REMOVE it

  This way, selecting on page 1 then going to page 2
  doesn't lose your page 1 selections.
```

##### Rendering (lines 226-416)

The `return` decides WHICH screen to show:

```jsx
if (page === 'login')        → return <LoginPage />
if (page === 'landing')      → return <LandingPage />
// Otherwise, show the main layout with Navbar + Header + Content:
if (page === 'products')     → renderProductsPage()
if (page === 'optimization') → renderOptimizationPage()
```

---

### 📄 `components/LoginPage.jsx` — The Door (176 lines)

**Its own local state:**

```
mode       → 'login' or 'register' (toggles between two forms)
username   → what user typed
email      → what user typed (register only)
password   → what user typed
role       → selected role dropdown (register only)
error      → error message to show (red box)
success    → success message to show (green box)
loading    → true while API call in progress
```

**Login flow:**

```
handleLogin → authService.login(username, password)
  success → calls onLoginSuccess(user) — this is a PROP from App.jsx
  error → setError('Invalid username or password')
```

**Register flow:**

```
handleRegister → api.post('/auth/register/', { username, email, password, role })
  success → shows "Account created!" message → auto-switches to login form
  error → shows validation errors from backend
```

**The toggle:** Clicking "Create one" / "Sign in" link changes `mode`, which conditionally shows/hides the email and role fields.

---

### 📄 `components/Layout.jsx` — The Shell (222 lines)

Exports 3 components:

#### `Navbar` — The top bar

- Shows "Price Optimization Tool" + page title + user dropdown
- Dropdown has a Logout button
- Uses `useRef` + `useEffect` to close dropdown when clicking outside

#### `PageHeaderBar` — The "Back" button + page title

- Shows "← Back" and the page heading ("Create and Manage Product")
- Back button calls `onBack` prop → navigates to landing page

#### `ActionBar` — The toolbar (search, filters, buttons)

Has its own local state for the filter popover:

```
filterOpen  → true = show price range popover
minPrice    → value in min price input
maxPrice    → value in max price input
```

The buttons it shows depend on props:

- `canCreate && !isOptimizationPage` → show "Add New Products"
- `!isOptimizationPage` → show "Demand Forecast" (disabled if no selections)
- Always shows: search bar, category dropdown, filter button, forecast toggle

---

### 📄 `components/ProductTable.jsx` — The Table (162 lines)

**Its own local state:**

```
selectedRows → [3, 5, 8] — IDs of checked products on current page
```

**Initialized from props:** `initialSelectedRows` (passed from App.jsx, so selections persist across page navigation)

**Selection logic:**

```
handleSelectAll → check/uncheck ALL products on current page
handleSelectRow → toggle one product's checkbox
```

Whenever `selectedRows` changes, a `useEffect` calls `onSelectionChange(selectedRows)` to notify App.jsx.

**Pagination:**

- Calculates total pages from `pagination.count`
- Shows "Prev 1 2 ... 5 Next" buttons
- Clicking a page number calls `onPageChange(pageNum)` → triggers App.jsx to fetch that page

**Conditional columns:**

- `showForecast` prop → shows/hides the "Calculated Demand" column
- `canEdit` prop → shows/hides the edit (pencil) icon
- `canDelete` prop → shows/hides the delete (trash) icon

---

### 📄 `components/DemandForecastModal.jsx` — The Chart (162 lines)

**NO local state.** Pure display component. Everything comes from props:

```
isOpen    → true/false (controls visibility)
onClose   → function to close the modal
products  → array of products WITH computed demand_forecast values
```

**The chart:**

- Uses Chart.js (`<Line>` component from react-chartjs-2)
- Two lines: purple = demand forecast, teal = selling price
- Products are labels on the X-axis

**Below the chart:** A table showing the same data in rows, with the demand forecast value highlighted in teal.

---

## 6. Data Flow Diagrams

### How a product goes from database to screen:

```
Database (SQLite)
    ↓
Django View (ProductViewSet) serializes to JSON
    ↓
HTTP Response: { results: [...], count: 11, next: "?page=2" }
    ↓
api.js (Axios) receives response
    ↓
productService.getProducts() extracts data
    ↓
App.jsx: setProducts(data.results)     ← State update triggers re-render
    ↓
ProductTable receives products as PROP
    ↓
ProductTable maps over array → renders <tr> for each product
    ↓
User sees the table on screen
```

### How a user action flows back to the database:

```
User clicks Delete icon on ProductTable
    ↓
ProductTable calls onDelete(product.id)   ← Callback prop from App.jsx
    ↓
App.jsx: handleDeleteProduct(id) runs
    ↓
window.confirm("Are you sure?")
    ↓ (user clicks OK)
productService.deleteProduct(id)
    ↓
api.js sends DELETE /api/products/5/ with JWT token
    ↓
Django View deletes the product
    ↓
App.jsx: fetchProducts() re-fetches the list
    ↓
setProducts(newData) → ProductTable re-renders without the deleted product
    ↓
toast.success("Product deleted") → green toast appears top-right
```

### How cross-page selection works:

```
PAGE 1: User checks product #3 and #5
    ↓
ProductTable: selectedRows = [3, 5]
    ↓
App.jsx: handleSelectionChange([3, 5])
    ↓
selectedProductsMap = { 3: {...product3}, 5: {...product5} }

User clicks "Next" → goes to PAGE 2
    ↓
fetchProducts() loads page 2 products (IDs 11-20)
    ↓
ProductTable gets new products BUT initialSelectedRows still = [3, 5]
    (3 and 5 aren't on this page, so no checkboxes are checked — that's fine)
    ↓
selectedProductsMap STILL has { 3: {...}, 5: {...} } ← PRESERVED!

User checks product #15 on PAGE 2
    ↓
handleSelectionChange([15])
    ↓
selectedProductsMap = { 3: {...}, 5: {...}, 15: {...} } ← ALL THREE!

User clicks "Demand Forecast"
    ↓
allSelectedProducts = Object.values(selectedProductsMap)
    = [product3, product5, product15] ← All 3 from both pages!
```

---

## Quick Reference: "Where do I look for X?"

| I want to understand...    | Look at...                                                               |
| -------------------------- | ------------------------------------------------------------------------ |
| How the app starts         | `main.jsx` → `App.jsx` (lines 418-434)                                   |
| How login works            | `LoginPage.jsx` → `authService.js` → `api.js`                            |
| How products load          | `App.jsx` fetchProducts (line 97) → `productService.js` getProducts      |
| How search works           | `App.jsx` handleSearchChange (line 138) — 500ms debounce                 |
| How RBAC hides buttons     | `App.jsx` lines 68-72 (canCreate/canEdit/canDelete)                      |
| How selections persist     | `App.jsx` handleSelectionChange (line 165) + selectedProductsMap         |
| How forecast is calculated | `App.jsx` handleDemandForecast (line 189)                                |
| How toasts show            | `App.jsx` — toast.success() / toast.error() from react-hot-toast         |
| How the table renders      | `ProductTable.jsx` — gets products as prop, maps to rows                 |
| How the chart renders      | `DemandForecastModal.jsx` — gets products as prop, uses Chart.js         |
| How JWT tokens flow        | `api.js` request interceptor (line 20) — auto-attaches from localStorage |
| How errors are handled     | `api.js` response interceptor (line 32) — 401 → force re-login           |
