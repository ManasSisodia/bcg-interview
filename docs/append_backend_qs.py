backend_questions = [
    # General / Django Concepts
    ("Why did you use Django instead of FastAPI or Flask?", "FastAPI is excellent for raw async performance, but Django's built-in ORM, admin panel, and robust security middleware allowed for significantly faster feature delivery for this specific relational data model."),
    ("Explain the difference between `select_related` and `prefetch_related`.", "`select_related` performs a SQL JOIN and is used for single-valued relationships (ForeignKey, OneToOne). `prefetch_related` executes separate queries and joins them in Python, used for multi-valued relationships (ManyToMany, reverse foreign keys)."),
    ("How does Django's middleware stack work?", "Middlewares are hooks into Django's request/response process. They are executed top-down during a request and bottom-up during a response. They handle cross-cutting concerns like session management, CSRF validation, and authentication."),
    ("If you wanted to add a caching layer, where would you add it?", "I would primarily cache at the View level using `cache_page` decorators for heavily read endpoints like `/api/products/`, but for granular data, I'd cache the queryset results in the Service layer after the DB hit using Redis."),
    ("What are signals in Django? Did you use them?", "Signals are a dispatcher mechanism to loosely couple components. I avoided them here because they obscure control flow (making code harder to debug). Prefer explicit service function calls to implicit signal dispatchers when possible."),

    # Database & ORM
    ("Why did you use `bulk_update` instead of normal saves in your `services.py`?", "Calling `.save()` inside a loop creates an N+1 query problem, hammering the database with individual UPDATE statements. `bulk_update` compiles this into a single query, heavily reducing I/O and transaction overhead."),
    ("What is atomic transaction and when do you use it?", "`@transaction.atomic` wraps a block of code in a database transaction. If any DB operation fails within the block, the entire block is rolled back. This is critical for data integrity when updating multiple inter-dependent records."),
    ("How do you handle migrations in a production deployment?", "Migrations must be atomic. In CI/CD, `python manage.py makemigrations --check` ensures no pending schema changes exist. During deployment, `python manage.py migrate` is run against the primary DB prior to traffic shifting."),
    ("How are your `Product` model indexes benefiting performance?", "By adding an index on `category` and `selling_price`, SQL doesn't need to do a full table scan. It does a B-tree lookup in O(log N) time, which drastically reduces read latency when the React frontend applies multiple filters."),
    ("What happens if two users try to buy the last item in stock simultaneously?", "This is a race condition. I would use `select_for_update()` in the Django ORM to lock the product row until the first transaction completes, strictly preventing negative stock values."),

    # API Design & DRF
    ("Why use ViewSets instead of standard APIViews?", "ViewSets provide tremendous boilerplate reduction by automatically mapping standard HTTP methods to CRUD actions (list, create, retrieve, update, destroy) and generating consistent URLs via default routers."),
    ("Explain how your custom permissions work.", "I subclassed `BasePermission` and implemented `has_permission`. It inspects `request.user.profile.role.name` and the `request.method`. It allows global object access dynamically without tightly coupling roles directly to the views."),
    ("How are you validating data before it enters the database?", "DRF Serializers execute `validate()` and `validate_<fieldname>()` methods. We use serializers to catch invalid payloads (like `cost > selling`) and throw structured 400 Bad Request responses before the ORM layer is ever hit."),
    ("What are the tradeoffs of using JWT for authentication?", "JWT is stateless—saving database lookups for session validation. The tradeoff is that JWTs cannot be natively revoked before expiration. To mitigate, we use short-lived access tokens and long-lived refresh tokens."),
    ("How would you implement Pagination for 1 million records?", "Offset pagination degrades as offset grows because SQL still scans skipped rows. For massive datasets, I would swap DRF's default pagination to `CursorPagination`, which uses an indexed column (like ID or timestamp) to fetch the next page in O(1) time."),

    # Security
    ("How do you protect against SQL Injection?", "Django's ORM automatically parameterizes queries, escaping user inputs before execution. As long as you don't use raw SQL (`.raw()` or `execute()`) with string concatenation, injection is prevented."),
    ("How do you handle Cross-Site Request Forgery (CSRF)?", "While Django has native CSRF middleware, our API consumes JWTs via an Authorization Header rather than cookies. Since JWTs are typically stored in local storage or memory, they are immune to CSRF, though vulnerable to XSS."),
    ("How do you protect against Cross-Site Scripting (XSS)?", "XSS is primarily a frontend concern, but the backend mitigates it by strictly validating input (rejecting HTML tags in product names) and returning data with `application/json` content-types to prevent browser execution."),
    ("Why is your SECRET_KEY separated into environments?", "The Django `SECRET_KEY` handles cryptographic signing. If leaked, attackers can manipulate session tokens or password reset links. Splitting settings ensures the dev key is public, but the prod key is injected securely via Kubernetes Secrets or AWS Parameter Store."),
    ("How would you prevent a brute force attack on your login endpoint?", "I would use DRF's `AnonRateThrottle` based on IP address to restrict attempts to 5 per minute, or implement a third-party library like `django-axes` to temporarily lock accounts after consecutive failed attempts."),

    # Scalability & Future
    ("How do you handle slow third-party API dependencies (e.g., an ML model API)?", "Synchronous blocking is unacceptable. I would route the request to a Celery worker queue. The API returns 202 Accepted, and Celery processes the ML model asynchronously, updating the DB when finished."),
    ("What is the Single Responsibility Principle, and how is it used here?", "SRP states a class/module should have one reason to change. I decoupled complex DB updates from Views into `services.py`, meaning the View handles only HTTP logic, and the Service handles only data logic."),
    ("How would you deploy this to handle variable load spikes?", "I'd containerize the Django app using Docker, push it to an AWS ECR registry, and deploy it to an ECS or EKS cluster with Horizontal Pod Autoscaling (HPA) targeting 70% CPU utilization."),
    ("Why did you subclass the standard `User` model using a Profile?", "Modifying `AbstractUser` midway through a project is dangerous and requires complex database migrations. A `OneToOneField` mapping `UserProfile` to `auth.User` cleanly separates authentication data from application metadata."),
    ("What are the tradeoffs of a Monolith architecture for this app?", "Pros: drastically simplified development, testing, and deployment. Pure ACID transactional capability. Cons: Cannot scale individual components (like scaling ONLY the auth service). Since our specific scale doesn't necessitate independent component scaling, a monolith is correct."),

    # Advanced / Nuance Decisions
    ("Explain how HTTP connection pooling works between Django and the DB.", "Django opens a new DB connection per request by default. At scale, this connection overhead crushes PostgreSQL. I would implement `PgBouncer` to maintain a pool of warm connections, allowing 1,000 requests to share 50 DB connections."),
    ("How would you test your `RoleBasedProductPermission` class?", "I would write unit tests using Django's `APIRequestFactory`. I'd mock users with 'admin', 'supplier', and 'buyer' profiles, instantiate a dummy view, and assert that `has_permission()` returns True or False for various HTTP methods."),
    ("Why avoid `null=True` on string-based database fields?", "Django convention dictates that empty strings should be stored as `''`, not `NULL`. Having both creates two possible states for 'no data', complicating filtering and logic. `null=True` is reserved for integers, dates, and foreign keys."),
    ("How do you handle environment variables locally versus production?", "Locally, I use `django-environ` with a `.env` file. In production, Docker injects environment variables explicitly at runtime. The `.env` file is heavily `.gitignore`d."),
    ("What is HTTP REST, and do you consider your API perfectly RESTful?", "REST relies on statelessness and resource-based URLs (`/products/123`). While mostly RESTful, endpoints like `/products/bulk-forecast/` are closer to RPC (Remote Procedure Call) because they represent actions across multiple resources, not state transfers of a single object."),

    # Wrap up / Edge Cases
    ("If your optimized price calculation needed to access 5 years of historical data, how would you change the model?", "I would migrate historical sales data out of SQLite/PostgreSQL into an OLAP data warehouse like Snowflake or BigQuery, querying it asynchronously via Airflow or Celery, to prevent overwhelming the transactional (OLTP) database."),
    ("What happens if a user role is deleted while users are assigned to it?", "In `models.py`, `role = ForeignKey(..., on_delete=models.SET_NULL)`. The user's role falls back to NULL rather than deleting the user, preventing catastrophic cascading deletions."),
    ("What is the biggest technical debt you introduced to get this done fast?", "Keeping ML optimization inside the synchronous request cycle. If the algorithm gets complex, it will block the Gunicorn worker thread, degrading throughput. It must be moved to an async worker queue in V2.")
]

with open('backend_documentation.md', 'r') as f:
    text = f.read()

text = text.replace("### Additional Rapid-Fire & Deep-Dive Questions (To reach 40+)", "")

for i in range(8, 45):
    old_str = f"**{i}. Q:** [Insert dynamic backend question here relating to Django, DRF, DB, Architecture]\n**A:** [Specific technical answer]\n\n"
    text = text.replace(old_str, "")

appended = "\n\n### 33 Additional Rapid-Fire & Deep-Dive Questions\n\n"
for i, (q, a) in enumerate(backend_questions, start=8):
    appended += f"**{i}. Q:** {q}\n**A:** \"{a}\"\n\n"

with open('backend_documentation.md', 'w') as f:
    f.write(text.strip() + appended)
