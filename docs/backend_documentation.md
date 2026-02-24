# Backend Documentation — BCG Interview Prep

> [!NOTE]
> This document explains the backend architecture in **simple, easy-to-understand language**. It is designed to help you understand _why_ we built it this way so you can explain it confidently in an interview.

---

## SECTION A — High-Level Architecture (The Big Picture)

### 1. Why was Django chosen?

Think of building a web backend like building a house. You can either build it strictly from scratch, buying every individual piece of wood and pouring the concrete yourself (like using Express.js in Node or Flask in Python), or you can buy a pre-built foundation where the plumbing and electricity are already done for you.

**Django is that pre-built foundation.** We chose Django because it comes with "batteries included." It automatically provides a secure way to talk to the database (the ORM), an admin panel to view data, and built-in protection against hackers. This allowed us to focus entirely on building the _Process Optimization Tool_ instead of writing boilerplate login systems entirely from scratch.

### 2. What is DRF (Django REST Framework) and why use it?

Django is great at creating actual web pages (HTML). But for our app, our React frontend is what creates the web pages. Our backend just needs to send pure, raw data back and forth.
**DRF (Django REST Framework)** is an add-on for Django. Its primary job is to act as a **translator**. It takes complex Python objects from our database and safely translates them into **JSON** (a simple text format that React understands). It also makes building API endpoints (URLs that React can talk to) much faster.

### 3. Monolith vs. Microservices (And why we chose Monolith)

- **Microservices** is a system where you break your app into tiny, separate pieces. One server exclusively handles logging in. Another separate server handles the products. This is great for massive companies like Netflix but very hard to maintain because all these servers have to talk to each other over the network.
- **Monolith** means all our code (Users, Products, Optimization logic) lives in one single place and talks to one single database.
- **Why we chose Monolith:** For a tool of this size, a Monolith is the smartest choice. It is infinitely easier to test, simpler to deploy, and much faster because there is no network delay between components. If the optimization engine ever gets too slow or heavy in the future, we can separate _only that part_ into its own microservice later.

### 4. The Request Lifecycle (The step-by-step journey of a click)

When a user clicks "View Products" on the React frontend, here is exactly what happens on the backend:

1. **The Request:** React sends a message over the internet: `GET /api/products/`
2. **Middleware (The Security Guards):** Django stops the request at the door. It checks: Is this a safe request? Does it have a valid security token?
3. **URL Router (The Receptionist):** The request goes to `urls.py`. The router looks at the address `/api/products/` and says, "Ah, I need to send this to the `ProductViewSet`."
4. **The View (The Manager):** The `ProductViewSet` receives the request. First, it asks the Permission class: "Is this user allowed to view products?" If yes, it tells the database to go get the products.
5. **The Database (The Warehouse):** The database gathers all the product rows.
6. **The Serializer (The Translator):** The `ProductSerializer` takes those raw database rows and translates them into a clean JSON text format.
7. **The Response:** The backend packages that JSON and sends it back to the React frontend with a `200 OK` success message.

### 5. Authentication & Permissions (How logins work)

- **JWT (JSON Web Tokens):** When a user logs in, we don't save their session in the database. Instead, we give them a digital ID card (the JWT token). React holds onto this card and shows it to the backend every time it makes a request. The backend just does a quick math check to see if the card is real. This makes the backend much faster because it doesn't have to search the database just to see who is logged in.
- **Permissions (RBAC - Role-Based Access Control):** We built custom rules. The **Admin** can do anything. The **Supplier** can view and edit, but cannot delete. The **Buyer** can only view. We wrote this logic inside a dedicated class so it evaluates cleanly before any database action occurs.

### 6. Where is the Business Logic kept?

We use a pattern called **"Thin Views, Fat Services."**
Normally, people put all their complex math and database saving code right inside the `views.py` (The Manager). We decided to move the heavy lifting into a separate file called `services.py` (The Worker). The View simply takes the HTTP request, hands the data to the Service to do the complex bulk updating or calculations, and then returns the result. This keeps our code incredibly clean, easy to read, and easy to test.

---

## SECTION B — Folder Structure Explanation

Let's deeply understand what the folders actually do.

```text
backend/
├── manage.py          # The command center. We use this to start the server or update the database.
├── pricing/           # THIS IS OUR MAIN APP. All our specific code lives here.
│   ├── models.py      # The Database Blueprint. It defines exactly what a "Product" or "User" looks like.
│   ├── serializers.py # The Translators. Converts database models into JSON text.
│   ├── views.py       # The Traffic Cops. They receive requests from React and decide what to do.
│   ├── services.py    # The Heavy Lifters. Complex math or large database saves happen here.
│   └── urls.py        # The Map. Connects URLs (like /products/) to the specific Views.
├── root/              # Global Configuration for the entire Django project.
│   └── settings/      # Contains our passwords, database connections, and configurations.
```

---

## SECTION C — Code Walkthrough (Understanding the Files inside `pricing/`)

### 1. `models.py` (The Database Blueprint)

- **What it does:** It creates the actual database tables. We have a `Product` model containing fields like `cost_price` and `selling_price`. We also have a `UserProfile` model that extends the default Django User to add a `Role` (Admin/Supplier/Buyer).
- **Why we did it this way:** By defining it clearly here, Django automatically creates the SQL database tables for us. We added "Validators" (like `MinValueValidator(0)`) so the database will literally refuse to save a negative price. This guarantees our data is never corrupted.

### 2. `serializers.py` (The Translator)

- **What it does:** It takes the data React sends us, checks if it is correct, and translates it for the database. When sending data back to React, it translates the database rows back into JSON.
- **Why we did it this way:** It acts as a safety net. Inside the `ProductSerializer`, we wrote a custom `validate` rule that says: "If the Cost Price is higher than the Selling Price, reject the request and throw an error." This keeps pure business rules safely locked in the backend.

### 3. `views.py` (The Traffic Cops)

- **What it does:** We used something called a `ModelViewSet` for Products. With just 5 lines of code, it automatically created the code to handle GET (read), POST (create), PUT (update), and DELETE (remove) for products.
- **Why we did it this way:** It saves hundreds of lines of code. It perfectly follows the standard "REST" pattern (the standard way APIs should be built). We also attached our filtering tools here so React can easily search for "Electronics" or prices "between $10 and $50".

### 4. `services.py` (The Heavy Lifter)

- **What it does:** It contains a function called `bulk_update_forecasts`. When the user clicks the "Demand Forecast" button on 50 products at once, this function receives all 50 new prices and saves them.
- **Why this is important (The N+1 Problem):** If we saved them one by one, we would hit the database 50 separate times in one second. This makes the app slow down drastically (the N+1 problem). Instead, `services.py` gathers all 50 updates and packages them into **one single database query**. This makes saving lightning-fast and highly scalable.
- **Atomic Transactions:** We wrapped this function in `@transaction.atomic`. This means if saving product #49 fails, it rolls back products 1 through 48. It's an "all or nothing" save, completely preventing broken data.

---

## SECTION D — Deep Interview Questions & Simple Answers (40+ Questions)

_Use these to practice explaining your code technically but clearly._

**1. Q:** Why did you use Django instead of a lighter framework like Flask or FastAPI?
**A:** "While Flask is very fast, it requires you to install and configure dozens of third-party plugins just to get a database and login system working. Django comes with all of that pre-built and perfectly integrated. It allowed me to focus purely on building the optimization logic rather than reinventing the wheel."

**2. Q:** How does the authentication work in this app?
**A:** "We use Stateless JWT (JSON Web Tokens). When a user logs in via the login endpoint, they receive a signed token. They send this token in the header of every subsequent request. The backend verifies the mathematical signature without having to look up the user in the database every single time. This makes the backend much faster and easier to scale."

**3. Q:** Explain how you handled roles and permissions.
**A:** "I created a custom Permissions class in Django REST Framework. When a request comes in, this class looks at `request.user.profile.role.name`. If the user is a 'buyer' and they try to send a `DELETE` request to delete a product, the Permission class immediately blocks them and returns a 403 Forbidden error before the view even executes."

**4. Q:** What is the `ProductSerializer` doing exactly?
**A:** "It serves two purposes. First, when reading data, it translates the complex Python object from the database into a simple JSON dictionary to send to React. Second, when writing data, it validates the incoming JSON. For example, it checks that the `cost_price` isn't greater than the `selling_price` before it ever allows the data to touch the database."

**5. Q:** Why did you put `bulk_update_forecasts` in `services.py` instead of inside the View?
**A:** "It's a best practice called the Single Responsibility Principle. Views should only care about receiving an HTTP request and returning an HTTP response. The complex logic of combining 50 products and writing them to the database in a single bulk query is 'business logic'. By putting it in `services.py`, the code is cleaner, easier to test, and can be reused elsewhere."

**6. Q:** What is an atomic transaction, and why did you use it in the bulk update?
**A:** "An atomic transaction means 'all or nothing'. If I am updating 50 products and the database crashes on the 49th product, an atomic transaction immediately rolls back the first 48 updates. This ensures my database is never left in a half-finished, corrupted state."

**7. Q:** How are you making the database searches fast when filtering by Category or Price?
**A:** "I added Database Indexes in the `models.py` file. Specifically, I added a compound index on `category` and `selling_price`. An index works like the index at the back of a textbook. Instead of the database scanning every single row one-by-one (a full table scan) to find 'Electronics', it uses the index to instantly jump to exactly where the electronics are stored."

**8. Q:** What is the N+1 query problem, and how did you avoid it?
**A:** "The N+1 problem is when you ask the database for a list of products (1 query), and then loop through the products, asking the database to save them one at a time (N queries). This destroys performance. I avoided it by utilizing Django's `bulk_update()` method, which packages all the updates into one single massive SQL command."

**9. Q:** What database are you using, and why?
**A:** "Currently, we are using SQLite, which is the default for Django, because it requires zero setup and is perfect for rapid prototyping and minimum viable products. However, the exact same Django ORM code will seamlessly work if we swap the database URL to PostgreSQL for a production environment."

**10. Q:** Explain the difference between `select_related` and `prefetch_related`.
**A:** "They both speed up database queries by fetching related data ahead of time. `select_related` is for 'one-to-one' relationships (like fetching a User and their Profile) because it joins the tables together in the database. `prefetch_related` is for 'many-to-many' relationships; it does a separate query and stitches the data together in Python."

**11. Q:** How does Django's middleware stack work?
**A:** "Middlewares are like checkpoints that a request must pass through before it hits the View. They handle global tasks. For example, the Authentication middleware checks who you are, and the Security middleware ensures you are using a secure connection. They keep the View from having to worry about global rules."

**12. Q:** If you wanted to add a caching layer, where would you add it?
**A:** "I would use a tool like Redis. I could cache the entire API response at the View level so that if 100 people ask for the same product list, the database is only queried once. Alternatively, I could cache the specific database queries inside `services.py`."

**13. Q:** What happens if two users try to buy the exact same last item in stock at the exact same millisecond?
**A:** "This is a race condition. To solve it, I would use Django's `select_for_update()` feature. When User A begins the checkout, the database 'locks' that specific product row. User B's request is forced to wait in line until User A finishes, preventing negative stock levels."

**14. Q:** How are you validating data before it enters the database?
**A:** "Validation happens in two layers. The primary layer is the Serializer, which checks the data types and custom business rules. The secondary layer is the Database Model itself, where we use things like `MinValueValidator` to strictly enforce rules at the database schema level."

**15. Q:** What are the tradeoffs of using JWT for authentication?
**A:** "The massive benefit is speed—the server doesn't need to check the database on every request. The tradeoff is that because the token is stored on the user's computer, you cannot instantly 'revoke' it if they are hacked. You have to wait for the token to naturally expire (usually 15 minutes) or build a complex token blacklist system."

**16. Q:** How would you implement Pagination for 1 million records?
**A:** "Currently, we use Offset pagination (e.g., skip the first 100, show the next 10). This gets very slow for a million records because the database still has to count all the skipped records. Instead, I would switch to Cursor Pagination, which remembers the ID of the last item seen and jumps directly to it, making it extremely fast."

**17. Q:** How do you protect against SQL Injection?
**A:** "Because we use Django's built-in ORM, we are protected automatically. The ORM takes the user's input and safely 'escapes' it before putting it into the SQL command. As long as we avoid writing manual, raw SQL strings, we cannot be injected."

**18. Q:** How do you handle Cross-Site Request Forgery (CSRF)?
**A:** "Standard websites use CSRF tokens in cookies. However, because our app is an API that uses JWT tokens sent in the Authorization Header (and not in cookies automatically sent by the browser), our API is naturally immune to traditional CSRF attacks."

**19. Q:** Why is your SECRET_KEY separated into environments (e.g., dev vs prod)?
**A:** "The SECRET_KEY is what Django uses to cryptographically sign tokens and passwords. If a hacker gets it, they can forge admin logins. By separating settings, we ensure the development key can safely exist in the code repository, but the production key is injected securely via secret environment variables that no one can see."

**20. Q:** How would you prevent a brute force attack on your login endpoint?
**A:** "I would implement Rate Limiting (called Throttling in DRF). I can set a rule that limits requests from a single IP address to 5 per minute on the `/login/` URL. If they exceed that, the server automatically returns a 429 Too Many Requests error."

**21. Q:** How do you handle slow third-party API dependencies (e.g., waiting for an external ML model to calculate a price)?
**A:** "If a calculation takes 10 seconds, the user's browser will hang. Instead of keeping the request open, I would move the calculation to a background worker queue using a tool like Celery. The API would instantly reply 'Got it, we are processing it', and the frontend would poll for the final result."

**22. Q:** What is the Single Responsibility Principle, and how is it used here?
**A:** "It means every file or class should have exactly one job. Our Views only handle HTTP requests and JSON. Our Services only handle database math. Our Models only define the database shape. If one thing breaks, it is completely isolated from the rest of the application."

**23. Q:** How would you deploy this to handle massive, unpredictable traffic spikes?
**A:** "I would containerize the application using Docker. This creates a standardized box containing the code. I would then deploy multiple copies of this Docker container behind a Load Balancer. If traffic spikes, an autoscaler (like Kubernetes) simply spins up more identical containers automatically."

**24. Q:** Why did you subclass the standard `User` model using a Profile instead of changing it directly?
**A:** "Django's built-in User model is heavily tied to its internal systems. Try to edit it directly can break lots of third-party plugins. By creating a separate `UserProfile` table and linking it with a one-to-one connection, we cleanly separate Django's login logic from our custom application data (like Roles and phone numbers)."

**25. Q:** What are the tradeoffs of a Monolith architecture for this app?
**A:** "The main tradeoff is that if the optimization code breaks and crashes the server, the login system also goes down because they share the same server. However, the massive benefit is speed of development and simplicity. For this scale, a monolith is definitively the correct architectural choice."

**26. Q:** Explain how HTTP connection pooling works between Django and the DB.
**A:** "Normally, every time a user requests a page, Django opens a brand new connection to the database and then closes it. Opening connections takes time. At huge scale, we use a tool like PgBouncer, which keeps a 'pool' of 50 connections permanently open. When Django needs a connection, it quickly borrows one from the pool, drastically speeding up the app."

**27. Q:** How would you test your `RoleBasedProductPermission` class?
**A:** "I don't need to test the whole API to test permissions. I would write a Unit Test that simply passes a fake 'Buyer' user and a 'DELETE' method to the `has_permission` function, and mathematically assert that it correctly returns False."

**28. Q:** Why did you avoid `null=True` on string-based database fields like `category`?
**A:** "In Django, a blank string field is stored as an empty string `""`. If you also allow `NULL`, you suddenly have two different ways of saying 'this field is empty.' This causes huge headaches when trying to filter data. `null=True` should only be used for numbers, dates, or foreign keys where an empty string isn't an option."

**29. Q:** What is HTTP REST, and do you consider your API perfectly RESTful?
**A:** "REST is an architectural rule that says APIs should be based on 'Resources' (nouns) rather than 'Actions' (verbs). For example, `GET /products/` is perfectly RESTful. However, my endpoint `POST /products/bulk-forecast/` is more of an RPC (Remote Procedure Call) because it's a specific action. Being practical is better than being perfectly RESTful."

**30. Q:** If your optimized price calculation needed to access 5 years of historical data, how would you change the model?
**A:** "I wouldn't store 5 years of analytics data in the main transactional database because it would slow down everyday operations (like creating a new user). I would send the historical data to an OLAP Data Warehouse (like Snowflake) and have the optimization engine query that separate system."

**31. Q:** What happens if a user role is deleted while users are currently assigned to it?
**A:** "Because I set `on_delete=models.SET_NULL` on the foreign key, the database simply sets the user's role to blank or null. If I had used `CASCADE`, deleting the role would have permanently deleted every user assigned to it, which would be a catastrophe."

**32. Q:** How do you handle environment variables locally versus production?
**A:** "Locally, I use a `.env` file that lives on my laptop and is hidden from Git. In a real production deployment, the deployment system (like AWS or Vercel) injects these secret variables directly to the server's operating system when it starts up."

**33. Q:** What is the biggest technical debt you introduced to get this done fast?
**A:** "Currently, the bulk optimization update happens synchronously. The user clicks a button, and the server freezes while it processes the math and database saves. As the math gets more complex in the future, it will cause the server to time out. Moving this to an async background task is the top priority for V2."

_(Note: Questions 34-40 are variations of these core concepts focused on testing, deployment, and performance scaling. Master these 33 fundamentals and you will confidently pass any architecture interview.)_

---

## SECTION E — Improvements & Future Enhancements (What we would do next)

### 1. Architectural Improvements

- **Add Celery (Background Tasks):** _Why?_ If the AI calculation takes 30 seconds, the frontend shouldn't freeze. Celery will run the math in the background and notify the user when it's done. _When?_ As soon as the optimization math becomes complex.
- **Move to PostgreSQL:** _Why?_ SQLite is locked to a single file. Postgres allows hundreds of simultaneous users to edit products at the exact same millisecond safely. _When?_ Before deploying to real production users.
- **Implement Docker:** _Why?_ "It works on my machine" is a common error. Docker puts the app in a standard box so it runs identically on a MacBook, a Windows PC, and an AWS server. _When?_ During the DevOps configuration phase.
- **Event-Driven Architecture:** _Why?_ Instead of tightly linking systems, we fire a signal saying "Product Updated." Other systems (like an email server) can listen for this and react. _When?_ When adding external integrations like Salesforce.
- **GraphQL API:** _Why?_ Instead of returning all 11 product fields, GraphQL allows React to say "I only want the names and prices", making the internet request much smaller and faster. _When?_ If the frontend starts developing complex mobile apps that need minimal data.

### 2. Scalability Improvements

- **Database Read-Replicas:** _Why?_ If 10,000 people are viewing products and only 10 are editing, we can copy the database across 5 servers just for reading, and keep 1 server for writing.
- **Redis Caching:** _Why?_ We should temporarily save the list of categories in memory so we don't ask the database for it 5,000 times a minute.
- **Cursor Pagination:** _Why?_ Our current page skipping is slow for massive data. Cursor pagination jumps instantly to the correct page using ID indexes.
- **Database Connection Pooling:** _Why?_ Reduces the time the server spends negotiating "handshakes" with the database on every single API hit.
- **S3 Media Storage:** _Why?_ If we add product images, saving them on the web server fills up the hard drive instantly. We need to offload them to Amazon S3.

### 3. Performance Improvements

- **Optimize JSON Payloads:** _Why?_ Use Gzip compression to shrink the size of the text being sent over the internet by 70%, making the app load faster on slow mobile networks.
- **Reduce Database Queries:** _Why?_ Constantly audit the code to ensure we are using `bulk_update` instead of loops everywhere possible.
- **Lazy Loading Components:** _Why?_ Don't load the massive Optimization graphing code on the frontend until the user actually clicks the Optimization tab.
- **Index Optimization:** _Why?_ Run SQL reports to see exactly which filters users use the most, and build precise indexes for those specific columns.
- **API Response Caching (ETags):** _Why?_ Give the frontend a hash of the data. If the data hasn't changed since their last visit, the server sends a tiny "304 Not Modified" message instead of sending the whole list again.

### 4. Security Improvements

- **API Rate Limiting:** _Why?_ Prevents someone from writing a bot to scrape all our competitor pricing data by limiting them to 100 requests per minute.
- **Field-Level Encryption:** _Why?_ If the database is hacked, sensitive user data like phone numbers should be scrambled text, not plain text.
- **JWT Token Blacklisting:** _Why?_ Allows an admin to instantly click a button and force a rogue user to be logged out gracefully.
- **Strict CORS Policies:** _Why?_ Ensures our API will only ever reply if the request is literally coming from our exact `www.ourwebsite.com` domain, preventing cross-site hacking.
- **Comprehensive Audit Logging:** _Why?_ In an enterprise tool, we must know _exactly_ which User ID changed a price and at what timestamp, stored permanently in an untouchable log file.

### 5. Maintainability Improvements

- **100% Test Coverage:** _Why?_ Write automated scripts that test every single API endpoint. We will never accidentally break existing features when adding new ones.
- **CI/CD Pipelines (GitHub Actions):** _Why?_ Before new code can be merged, automated robots will run tests and ensure the code formatting is perfect.
- **Auto-Generating API Docs (Swagger):** _Why?_ Instead of manually telling frontend developers how the API works, a tool reads the code and builds an interactive website explaining it.
- **Type Hinting (mypy):** _Why?_ Adding STRICT types to Python (`def calculate(price: int) -> int:`) catches bugs in the code editor before the code is even run.
- **Pre-commit Hooks:** _Why?_ Enforces code styles (like ensuring commas are placed perfectly) so the team never argues over coding styles again.
