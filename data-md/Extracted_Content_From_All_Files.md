# Pre-Test Checklist -- Price Optimization Tool

To ensure a smooth assessment experience, please have the following
ready before your test session:

### Software Setup

1.  Install an **IDE**/**editor** (VS Code, PyCharm, IntelliJ, etc.)

2.  Install **Python ≥ 3.9** with **pip** OR **Node.js ≥ 16.x** with
    **npm**/**yarn**

3.  Install **PostgreSQL** or **MySQL** locally (or have **Docker** set
    up)

4.  Install **Git** and configure your account

5.  Have a modern browser ready (Chrome / Edge / Firefox)

### Framework Familiarity

1.  Backend: Know at least one of **Django** / **Flask** / **FastAPI** /
    **Node.js** (**Express**)

2.  Frontend: Know at least one of **React.js** / **Angular**

3.  Basics of **HTML**, **CSS**, **JavaScript**

4.  Familiarity with a charting library (e.g., **Chart.js**, **D3.js**)

### Environment Preparation

1.  Able to run backend + frontend locally

2.  Database running and accessible

3.  Test sample API call in Postman / browser before session (optional)

### Problem Understanding

1.  Read the **Price Optimization Tool** problem statement thoroughly

2.  Understand requirements around product management, demand
    forecasting, and pricing optimization

3.  Be ready to explain your design choices and trade-offs

# Price Optimization Tool -- Hiring Assessment

### About Client

A leading global enterprise seeks to improve and optimize its pricing
strategy through the development of a Price Optimization Tool. This will
allow users to input product data, analyse pricing trends, and receive
optimal pricing recommendations.

### Problem Statement

In the digital era, efficient pricing is crucial for businesses to stay
competitive. The client requires a web application that enables business
users to determine optimal pricing strategies based on demand forecasts
and market conditions.

The goal is to create a multi-functional interface that addresses these
needs effectively, integrating several functionalities while maintaining
ease of use and performance efficiency.

### Specific Challenges

-   #### Dynamic User Roles and Permissions

    -   Implement a flexible user authentication and authorization
        system with dynamic role assignment (admin, buyer, supplier,
        custom roles).

-   #### Product Management

    -   Securely manage product data with robust search and filtering,
        while adhering to data privacy regulations.

-   #### Demand Forecast Integration

    -   Enable visualization of product demand trajectory and forecasts.

-   #### Pricing Optimization

    -   Recommend optimized product prices based on business inputs.

### Functional Requirements

#### PART A: Product Management

-   **Create and Manage Products**

    -   Create, view, update, and delete products.

    -   Product attributes: name, category, cost price, selling price,
        description, stock available, units sold.

-   **Search and Filter Products**

    -   Advanced search by product name.

    -   Filters (e.g., category).

#### PART B: Demand Forecast & Pricing Optimization

-   **Demand Forecast**

    -   Show demand forecasts for products.

    -   Visualize forecasted demand vs selling price on a linear plot.

-   **Pricing Optimization**

    -   Display optimized prices in tabular format along with product
        details.

### Technical Requirements

-   #### User Authentication & Authorization

    -   User registration/login with email verification.

    -   Role-based access control for different user roles.

-   #### Backend

    -   Python (Django/Flask/FastAPI) or Node.js.

    -   Focus on scalability and security.

-   #### Frontend

    -   React.js or Angular with responsive UI.

    -   Data visualization using Chart.js / D3.js.

-   #### Database

    -   Relational DB (PostgreSQL/MySQL).

    -   Apply normalization and indexing for performance.

-   #### Code Quality

    -   Well-structured, modular, and documented.

    -   Include a README.md with setup and project overview.

-   #### UI/UX

    -   Clean, intuitive, and responsive design.

    -   Clear visualization of demand forecasts and price
        recommendations.

### Product Attributes

-   Product ID

-   Name

-   Description

-   Cost Price

-   Selling Price

-   Category

-   Stock Available

-   Units Sold

-   Customer Rating

-   Demand Forecast

-   Optimized Price

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    product_id name              description             cost_price   selling_price category           stock_available   units_sold   customer_rating   demand_forecast   optimized_price
  ------------ ----------------- --------------------- ------------ --------------- ---------------- ----------------- ------------ ----------------- ----------------- -----------------
             1 Eco-Friendly      A sustainable,                   5           12.99 Outdoor & Sports               500          200                 4               250              11.5
               Water Bottle      reusable water bottle                                                                                                                  
                                 made from recycled                                                                                                                     
                                 materials.                                                                                                                             

             2 Wireless Earbuds  Bluetooth 5.0                   25           59.99 Electronics                    300          150                 5               180                55
                                 wireless earbuds with                                                                                                                  
                                 noise cancellation                                                                                                                     
                                 and long battery                                                                                                                       
                                 life.                                                                                                                                  

             3 Organic Cotton    Soft, breathable                 8           19.99 Apparel                        400          100                 4               120              18.5
               T-Shirt           t-shirt made from                                                                                                                      
                                 100% organic cotton.                                                                                                                   

             4 Smart Home Hub    Control all your                40           99.99 Home Automation                150           75                 4                90                95
                                 smart home devices                                                                                                                     
                                 with this central                                                                                                                      
                                 hub.                                                                                                                                   

             5 Electric Scooter  Lightweight electric           150          299.99 Transportation                  80           40                 5                50               285
                                 scooter with a range                                                                                                                   
                                 of 20 miles.                                                                                                                           

             6 Noise-Canceling   Over-ear headphones             50          129.99 Electronics                    200           90                 4               110               125
               Headphones        with active noise                                                                                                                      
                                 cancellation.                                                                                                                          

             7 Smartwatch        Feature-packed                  70          149.99 Wearables                      250          130                 5               160               145
                                 smartwatch with heart                                                                                                                  
                                 rate monitor and GPS.                                                                                                                  

             8 Portable Solar    Compact solar charger           20           39.99 Outdoor & Sports               300          140                 4               170                38
               Charger           for outdoor use.                                                                                                                       

             9 Fitness Tracker   Wearable fitness                30           59.99 Wearables                      350          180                 4               200                57
                                 tracker with sleep                                                                                                                     
                                 monitoring.                                                                                                                            

            10 Bluetooth Speaker Portable Bluetooth              15           45.99 Electronics                    400          210                 4               240                43
                                 speaker with                                                                                                                           
                                 excellent sound                                                                                                                        
                                 quality.                                                                                                                               
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
