# Frontend Documentation — BCG Interview Prep

> [!NOTE]
> This document explains the React frontend architecture in **simple, easy-to-understand language**. It focuses on explaining _why_ we structure things the way we do, making it easy to explain to a non-technical manager while satisfying a Senior Engineer.

---

## SECTION A — High-Level Architecture (The Big Picture)

### 1. Why was React chosen?

React is a user interface library built by Facebook. In traditional web development, if you check a box to select a product, you have to write manual code to find the checkbox, see if it is checked, and then find the row color and change it. It gets messy fast.
**React changes the rules.** In React, we just declare a "State" (e.g., `selectedRows = [5, 12]`). We then tell the table, "If a row ID is inside this list, paint it blue." React automatically watches the state. When the state changes, React instantly and magically updates the exact elements on the screen without us having to write manual update code. This is critical for complex tables with lots of buttons and filters.

### 2. What are Functional Components and Hooks?

Years ago, React used "Class Components" which required writing a lot of complex boilerplate code, dealing with the confusing `this` keyword, and mixing all logic together.
We built this app using modern **Functional Components**. These are simple JavaScript functions that return HTML (JSX).
To make these simple functions powerful, we use **Hooks** (like `useState` and `useEffect`). Hooks allow us to "hook into" React's memory. Even better, we wrote our own Custom Hook (`useProducts.js`) to totally separate the complex math and API calls from the visual buttons and tables.

### 3. How State Management Works

"State" just means "the memory of the app at this exact millisecond."
We did not use a massive, complicated global memory system like Redux. Why? Because Redux is like renting a massive commercial warehouse to store a bicycle.
Instead, we used **Local State**.

- The App's top layer remembers "Who is logged in?"
- The Products Page remembers "What products are we looking at right now?"
  When you leave the Products Page, the app throws that memory in the trash. This keeps the app incredibly lightweight, fast, and easy to understand.

### 4. Component Hierarchy (The Lego Blocks)

React is built like Lego blocks.

- At the very top is `App.jsx`. It decides which Page to show.
- The Page is called the **Container Component (Smart)**. It knows how to talk to the backend API and holds the memory.
- The Page passes the data down to the `ProductTable.jsx`. This is a **Presenter Component (Dumb)**. It knows absolutely nothing about APIs or databases. It just says, "Give me an array of text, and I will draw a pretty table."
  This separation means we could easily reuse the `ProductTable` on completely different websites without changing it!

### 5. Data Flow (How information travels)

1. The user goes to the Products page.
2. The custom hook asks the `productService.js` to get the data.
3. The service calls the Backend API and gets a JSON response.
4. The hook updates its local memory (`useState`).
5. React notices the memory changed! It redraws the Products page.
6. The data flows _downwards_ as props (properties) into the Table component, and the user sees the products.

### 6. API & Error Handling (What if the internet breaks?)

We created a dedicated `api.js` file. This acts as the single gateway for all internet traffic between the frontend and backend. It automatically attaches the user's secret JWT token to every request.
If the backend crashes and returns an error, our code catches it safely using `try/catch`. Instead of the whole React website crashing and turning white (the white screen of death), we use a library called `react-hot-toast` to slide a polite little red error message onto the screen saying "Failed to load products."

### 7. Re-render Optimization (Keeping things fast)

When you type "Water" into the search bar, you don't want the app to send 5 requests to the backend ("W", "Wa", "Wat"...).
We built **Debouncing**. When you type, it starts a 500-millisecond timer. If you type again, it resets the timer. It only actually searches the backend when you _stop typing_ for half a second. This makes the app feel vastly smoother and stops the backend from crashing under heavy load.

---

## SECTION B — Folder Structure Explanation

Let's understand exactly where everything lives in the `src/` folder:

```text
frontend/src/
├── components/     # The reusable UI puzzle pieces.
│   ├── ui/         # Basic pieces. A barebones Button or Table design.
│   └── Layout/     # Specific pieces, like the Top Navigation Bar.
├── hooks/          # The Brains. 'useProducts.js' holds all the complex data logic.
├── pages/          # The entire screen views. 'ProductsPage' ties components and hooks together.
├── services/       # The Messengers. 'api.js' talks to the backend so the components don't have to.
├── utils/          # Simple calculators or text formatters.
├── App.jsx         # The Grand Central Station. Handles routing users to correct pages.
└── index.css       # Tailwind configuration and global colors.
```

---

## SECTION C — Code Walkthrough

### 1. `App.jsx` (The Router)

- **What it does:** It checks if you are logged in. If yes, it looks at the URL and renders either the `ProductsPage` or the `OptimizationPage`.
- **Why we did it this way:** It enforces security strictly at the top. You literally cannot view the Products layout if `currentUser` is null.

### 2. `ProductTable.jsx` (The Dumb Presenter)

- **What it does:** It loops through an array of products and returns table rows. It draws checkboxes and pencil icons.
- **Why we did it this way:** It takes in functions like `onEdit={handleEdit}` from its parent. When you click the pencil, the table doesn't actually do anything. It just shouts back up to the parent "Hey, they clicked Edit on product ID 5!" The parent actually handles opening the modal. This keeps the table pure and focused solely on UI.

### 3. `useProducts.js` (The Custom Hook)

- **What it does:** This file contains all the `useState` variables for products, loading status, pagination numbers, and filter text. It also contains the exact functions to Delete, Edit, and Add products.
- **Why we did it this way:** The `ProductsPage.jsx` file was getting too long and messy. By ripping all this logic out and putting it in a custom hook, the Page file now just looks like a clean layout file. It makes the code beautiful to read.

### 4. `api.js` and `productService.js` (The Service Layer)

- **What it does:** Instead of writing raw `fetch()` calls scattered across 10 different files, we centralize our API calls here.
- **Why we did it this way:** If we ever decide to move our backend from `localhost:8000` to `production-api.com`, we only have to change the URL in _one single place_.

### 5. The Modals (Demand Forecast, Add Product)

- **What they do:** They pop up over the screen to collect user input without leaving the page.
- **Why we did it this way:** It improves User Experience (UX). Instead of navigating to an entirely new `/add-product` page and losing your place in the table, a modal allows you to quickly achieve a task and immediately see the result update on the table behind it.

---

## SECTION D — Deep Interview Questions & Simple Answers (40+ Questions)

_Understanding these will prove you know how React really works under the hood._

**1. Q:** Why did you use Functional Components instead of Class Components?
**A:** "Class components mix visual layout and complex lifecycle logic together, making them very bloated. Functional Components with Hooks allow us to completely separate the data logic (the hook) from the visual layout (the function return), making the code much shorter and much easier to test."

**2. Q:** What exactly happens behind the scenes when you call `setProducts`?
**A:** "React doesn't instantly change the screen. It flags the component as 'dirty'. Behind the scenes, it draws a completely new, invisible blueprint called the Virtual DOM. It compares this new blueprint against the old one. It figures out the absolute minimum number of changes needed, and then applies _only_ those changes to the actual browser screen. This is what makes React so fast."

**3. Q:** What is the Dependency Array in `useEffect`, and why is it important?
**A:** "The `useEffect` hook runs side effects (like hitting APIs). If you put an empty array `[]` at the end, it means 'only run this once when the page loads.' If you put a variable like `[searchQuery]` in it, it means 'run this again, but ONLY if the user changes the search word'. This stops React from infinitely re-running the API every millisecond."

**4. Q:** What is Prop Drilling, and how does your architecture avoid or accept it?
**A:** "Prop drilling is when you pass data through 5 layers of components that don't care about the data, just to reach a button at the very bottom. In a massive app, you use React Context to teleport data to the bottom. In our app, the tree is shallow (Page -> Table -> Row). Passing props down two levels is totally fine and keeps the code simpler than setting up complex Contexts."

**5. Q:** Why did you completely extract your state logic into custom hooks?
**A:** "Separation of concerns. The UI component should only be HTML and CSS structure. Setting and fetching data is 'business logic'. Putting it in a custom hook cleans up the code, allows me to reuse that logic on another page, and makes it incredibly easy to test pure logic without loading the DOM."

**6. Q:** Why did you explicitly avoid using Redux?
**A:** "Redux is fantastic for complex, global state (like a shopping cart visible on every single page). But here, product data is only needed on the Product Page. Using Redux would require hundreds of lines of boilerplate setup. A simple `useState` inside a custom hook is vastly cleaner, faster, and appropriate for the exact scale of this application."

**7. Q:** Explain the Container/Presenter (Smart/Dumb) component pattern.
**A:** "A Container component runs the API calls and holds the data. It is 'smart'. A Presenter component just takes the data as a prop and draws a pretty UI block. It is 'dumb'. In our app, `ProductsPage` is the smart container. It passes data down to `ProductTable`, the dumb presenter. This pattern ensures `ProductTable` is blindly reusable anywhere."

**8. Q:** If the application needed to work entirely offline, how would you change it?
**A:** "I would use a tool like Service Workers. When the app gets data, I would cache a copy of it locally inside the browser's IndexedDB. If the internet drops, the app reads from the local database. Any edits the user makes would be pushed to an 'Outbox', which automatically tries to send to the backend once the internet connection returns."

**9. Q:** Why did you abstract Axios into an `api.js` file?
**A:** "If our company decides to stop using the Axios library and switch to the native browser `fetch` API, I only have to rewrite the code in one single file. If the API calls were scattered across 20 different components, I would have to rewrite hundreds of files."

**10. Q:** What causes an application to be slow and 're-render' too much?
**A:** "Common causes include: 1) A parent component updates, forcefully redrawing all its children. 2) Saving complex objects to state without keeping the same memory reference. 3) Updating a massive global Context that forces the whole app to redraw. In our app, we carefully silo state to avoid this."

**11. Q:** How does `useMemo` differ from `useCallback`?
**A:** "`useMemo` focuses on the _result_. It saves the answer to a heavy math calculation so it doesn't do the math again unless inputs change. `useCallback` focuses on the _concept_. It saves a function itself so that when passing it down to a child component, the child doesn't think it's a 'brand new' function every millisecond, preventing the child from uselessly redrawing."

**12. Q:** If your `ProductTable` had 50,000 rows, how would you theoretically optimize it?
**A:** "Drawing 50,000 HTML elements will freeze the Google Chrome tab. I would implement a technique called 'DOM Virtualization'. Even with 50,000 items, the user can only visually see about 20 rows on their monitor. Virtualization dynamically draws those 20 rows and swaps the text inside them as you scroll, keeping the app lightning-fast."

**13. Q:** Why is Debouncing so critical in your search bar?
**A:** "If a user swiftly types 'CAR', without debouncing, the app sends three API requests: 'C', 'CA', and 'CAR'. The 'CA' request might be slow, returning _after_ the 'CAR' request finishes, replacing the correct final results with the outdated 'CA' results. Debouncing enforces a 500ms waiting period, guaranteeing only the final word 'CAR' is sent to the backend."

**14. Q:** How did you handle responsive design (making it work on phones)?
**A:** "We used Tailwind CSS, which is mobile-first. By default, elements stack on top of each other. We use modifiers like `md:flex-row` to tell the app, 'once the screen is at least medium-sized like an iPad, lay things out side-by-side'. For the large table, we used `overflow-x-auto` so users on phones can swipe left and right without stretching the screen."

**15. Q:** What is an Optimistic UI update?
**A:** "Normally, when you click 'Like' on a post, the app waits 1 second for the server to reply before turning the thumb blue. With Optimistic updates, you turn the thumb blue instantly, and _then_ ask the server. If the server throws an error, you quietly turn it back to gray. It makes apps feel instantaneous. We could implement this for the price updates."

**16. Q:** How did you avoid layout shifts when data was loading?
**A:** "Cumulative Layout Shift (CLS) happens when text jumps around as images load. Instead of the page collapsing and bouncing around, we ensure the 'Loading Spinner' lives inside a container that is identical in height and width to the actual table it replaces. The page remains visually stable."

**17. Q:** What happens if the backend API sends an unexpected format?
**A:** "If the API crashes and sends an HTML error page instead of a JSON Array, mapping over it in React will throw a fatal error. In our `productService.js`, we wrote a strict defensive check. If the data isn't an array, we force it to return an empty `[]`. The user just sees 'No products', but the app itself survives securely without a white screen."

**18. Q:** How do you handle Cross-Site Scripting (XSS) in React?
**A:** "React natively escapes string variables. If a hacker saves `<script>alert(1)</script>` into a product description in the database, React simply prints it out as literal, harmless text on the screen. As long as you explicitly avoid using the dangerous `dangerouslySetInnerHTML` command, React is virtually immune to XSS."

**19. Q:** Why do you use `useRef` to track the debouncing timeout in the search bar?
**A:** "`useState` triggers the screen to redraw every time you update it. We just need to quietly keep track of a timer ID. `useRef` provides a secret pocket of memory that survives re-renders but doesn't cause any itself. It's the perfect place to store a background timer."

**20. Q:** What is Strict Mode in React?
**A:** "When running the app on our local computers, Strict Mode intentionally mounts and unmounts every component twice instantly. It is trying to catch bad bugs. If a developer accidentally wrote code that modifies global data (a side effect) during rendering, the double-render will wildly break the app locally, forcing the developer to fix their bad habits."

**21. Q:** Why Tailwind CSS over SCSS or standard CSS files?
**A:** "In standard CSS, deleting code is terrifying because you don't know if that class is used on another page. Tailwind uses utility classes right inside the HTML (`bg-blue-500`). When you delete the component, the CSS disappears with it. It enforces a strict design system and results in zero 'dead CSS' code in production."

**22. Q:** How does the `key` prop work when mapping over the Array in `ProductTable`?
**A:** "When React draws a list of 10 rows, it needs a way to track them. If we just give them indexes (0, 1, 2), and we delete row 0, all the other numbers shift, confusing React into redrawing everything. By giving them a permanent database ID (`key={product.id}`), React exactly tracks which specific row was deleted and leaves the rest completely alone."

**23. Q:** What is Tree-Shaking?
**A:** "When we build the app for production using Vite, tree-shaking acts like a literal tree shake. If we install a massive library of 1,000 icons but only use one `Pencil` icon, tree-shaking automatically analyzes our imports, deletes the other 999 icons from the final code, and drastically shrinks the download size for the user."

**24. Q:** If the token expires while the user is inside the app, what happens?
**A:** "In a fully polished app, the `api.js` Axios interceptor catches the 401 Unauthorized status coming from the server. Before the Component even realizes an error occurred, the interceptor wipes the local storage and forcefully redirects the router back to the login page."

**25. Q:** Why aren't you using React Suspense or React Query?
**A:** "React Query is incredible, and we would absolutely use it in a V2. However, knowing how to manually wire up `useState` and `useEffect` with clean custom hooks proves a foundational understanding of React architecture. It's important to know how the engine works before buying an automatic transmission."

_(There are many more variations of these answers involving deeper performance metrics, but these provide a comprehensive, solid foundation of modern React philosophy.)_

---

## SECTION E — Improvements & Feature Extensions (What we would do next)

### 1. Architecture Improvements

- **Switch from API hooks to React Query:** _Why?_ React Query automatically caches our API calls, prevents double requests, and automatically retries if the internet temporarily drops.
- **Adopt TypeScript natively:** _Why?_ Currently JavaScript just trusts the data. TypeScript strictly defines the 11 fields of a Product. If I misspell `product.selling_pricce`, the code editor glows red immediately, preventing runtime crashes.
- **Switch to React Hook Form:** _Why?_ Building manual form states for Add/Edit modals causes React to redraw every time you press a key. React Hook Form is 'uncontrolled', making typing incredibly fast and handling validation errors elegantly.
- **Provide a Global Theme Context:** _Why?_ By wrapping the app in a Context layer, we can easily inject Dark Mode vs Light Mode toggles globally.
- **Route-Level Code Splitting:** _Why?_ Instead of downloading the code for the Optimization page when logging in, we split the code chunks. The browser only downloads it when the user literally clicks the Optimization tab.

### 2. User Experience (UX) Improvements

- **Implement Optimistic UI:** _Why?_ If deleting a row requires a 1-second server trip, it feels slow. We should instantly visually delete the row and verify with the server quietly in the background.
- **Skeleton Loaders:** _Why?_ Generic blue spinners are boring. A skeleton loader looks like grayed-out table rows that pulse gently, giving the user a psychological trick that makes the app 'feel' like it loaded faster.
- **Sticky Headers/Panels:** _Why?_ When scrolling through 50 products, the column names disappear off the top of the monitor. The Table Header row should permanently stick to the top.
- **Inline Table Editing:** _Why?_ Opening a modal to change a price is tedious for bulk actions. Users should be able to double-click a table cell and type a new price dynamically like an Excel spreadsheet.
- **Toast Actions:** _Why?_ When an item is deleted, the success Toast pop-up should contain a small "Undo" button that instantly restores it.

### 3. Performance Improvements

- **Memoize Components with `React.memo`:** _Why?_ We should wrap `ProductTable` in `memo`. This tells React, "Do absolutely nothing to this table unless the physical array of data changes."
- **Window Virtualization:** _Why?_ Using `react-window` will guarantee the browser stays at 60 FPS no matter how massive the product list gets.
- **Optimize Icon Imports:** _Why?_ Ensure Vite is correctly shaking out unused Lucide icons to reduce the Javascript footprint by several hundred kilobytes.
- **Avoid deep Prop Drilling for permissions:** _Why?_ Passing the `canEdit` permission all the way down is tedious. Putting user roles in an AuthContext allows any component to check its own permissions.
- **Use Web Workers for heavy client iteration:** _Why?_ If we ever ask the frontend to compute complex math on local arrays, doing it on a separate background thread prevents the 'click' animations from stuttering.

### 4. Code Quality & Maintainability Improvements

- **Setup strict ESLint rules:** _Why?_ Ensure every developer follows the exact same React Hook rules (exhaustive dependencies) so the team writes predictable code.
- **Unit Testing with Jest / React Testing Library:** _Why?_ Clicking buttons to test them manually is slow. We should write automated scripts that simulate a user clicking 'delete' to prove the table updates correctly.
- **Centralize Magic Strings:** _Why?_ Hardcoding strings like `/api/products` or role names like `'supplier'` causes spelling mistakes. They should be exported from a central `constants.js` file.
- **Abstract the Modals to a Provider:** _Why?_ Currently, the modals clutter up the main layout code. The app should have a global Modal Provider that accepts a payload and opens cleanly.
- **Extract complex logic further:** _Why?_ The hook still does a bit too much. Splitting into `useProductFetching` and `useProductMutations` increases single-responsibility modularity.
