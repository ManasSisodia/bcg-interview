frontend_questions = [
    # React Fundamentals & Hooks
    ("Why Functional Components instead of Class Components?", "Functional components eliminate the confusion of 'this' binding and bloated lifecycle methods. Utilizing React Hooks (`useState`, `useEffect`) allows us to abstract non-visual state logic completely outside the component, massively improving code reusability."),
    ("What happens behind the scenes when you run `setState`?", "React schedules a state update and flags the component as dirty. During the next tick, it generates a new Virtual DOM, diffs it against the previous Virtual DOM, identifies the minimum required DOM mutations, and commits those changes to the actual browser DOM."),
    ("Explain the Dependency Array in `useEffect`.", "The dependency array dictates when the effect should re-run. If omitted, the effect runs after every single render. If empty `[]`, it runs once on mount. If values are provided `[searchQuery]`, it compares the previous and current values using `Object.is` and only runs if they differ."),
    ("What is Prop Drilling, and how did you resolve it?", "Prop drilling is passing data through many nested layers of components that don't need the data, just to reach a deeply nested child. In this app, grouping state into `useProducts` hook effectively flattened the tree. For much deeper trees, I'd use React Context."),
    ("Why did you extract your state logic into custom hooks?", "Separation of Concerns. The UI component (`ProductsPage`) should strictly handle presentation. The hook (`useProducts`) handles data fetching, pagination, filtering, and side effects. This makes testing the data logic mathematically pure without rendering DOM elements."),

    # State Management & Architecture
    ("Why did you avoid Redux?", "Redux requires defining actions, reducers, and dispatchers. For a localized dashboard where products don't strictly need to be synchronized in memory across totally disparate pages, Redux is anti-pattern over-engineering. Local state solves the problem beautifully."),
    ("Explain the Container/Presenter pattern in your code.", "`ProductsPage` is the Container—it holds the 'smart' data fetching hook and passes the raw array down. `ProductTable` is the Presenter—it is 'dumb', it accepts an array and an `onEdit` callback, knowing absolutely nothing about where the data came from. This makes `ProductTable` effortlessly reusable."),
    ("How do you manage complex form states?", "Normally `useState` for simple controlled forms. If validation gets complex, using an unmanaged wrapper like `react-hook-form` drastically reduces renders, since it avoids constantly triggering re-renders on every keystroke until validation occurs."),
    ("If the app needed an offline-first capability, what would you change?", "I would introduce Service Workers for intercepting HTTP requests, cache static assets via Workbox, and use an IndexedDB wrapper layer to sync changes locally, pushing them to the backend when `navigator.onLine` fires true."),
    ("Why abstract Axios into `api.js`?", "If the company mandates a transition from Axios to native `fetch()` or a mocked API payload for testing, I only change `api.js`. The components firing `await getProducts()` never have to rewrite their HTTP logic. It strictly enforces boundaries."),

    # Performance
    ("What causes unnecessary re-renders in React?", "1) Parent renders cascading down to children. 2) State objects mutating but retaining the same reference pointer. 3) Context values updating when only a slice of the value changed. 4) Creating new inline function references inside the JSX."),
    ("How does `useMemo` differ from `useCallback`?", "`useMemo` caches the evaluated return *value* of a heavy function. `useCallback` caches the *function reference itself*. You use `useCallback` to prevent child components from breaking their `React.memo` memoization by receiving newly instantiated function references."),
    ("If your `ProductTable` had 10,000 rows, how would you optimize it?", "Rendering 10k literal DOM elements will freeze the main thread. I would implement DOM Virtualization (e.g., `react-window`). It renders only the ~20 `<tr>` tags visible in the viewport, destroying and recreating them dynamically as the user scrolls."),
    ("Explain Debouncing and its significance in your search bar.", "Debouncing enforces a delay (e.g., 500ms) after the final keystroke before firing an event. Without it, typing 'BOTTLE' sends 6 rapid-fire HTTP requests, choking the backend and causing race conditions where the 'B' response might arrive *after* the 'E' response."),
    ("How do you analyze Web Vitals output for this application?", "I use the React Profiler alongside Lighthouse to inspect First Contentful Paint (FCP) and Largest Contentful Paint (LCP). If JS bundles are too large, Time to Interactive (TTI) inflates, which I'd fix via route-level code splitting using `React.lazy()`."),
    
    # CSS & UI
    ("Why Tailwind CSS over SCSS or Styled Components?", "Tailwind is utility-first, directly solving the 'CSS file bloat' problem. It forces constraint-based design (using strict multi-stops of padding/colors) avoiding magic numbers, and eliminates naming collisions since classes are inherently scoped to the element."),
    ("How did you ensure responsive design across devices?", "Tailwind's mobile-first breakpoints (`md:`, `lg:`). The sidebar completely detaches or collapses on mobile, and horizontal scrolling `overflow-x-auto` is applied to the tables to ensure data doesn't squish unreadably on an iPhone screen."),
    ("What is an Optimistic UI update?", "When a user clicks 'Like' or 'Delete', you immediately visually alter the DOM before the server responds 200 OK. If the server fails, you revert the UI. It dramatically lowers perceived latency, critical for an 'Enterprise' feel."),
    ("Why do your Modals use `createPortal` (or why should they)?", "Modals nested deep inside relative/absolute stacked containers can cause z-index wars and get clipped by `overflow: hidden`. React's `createPortal` teleports the Modal DOM node directly into `document.body` while maintaining it logically within the React tree."),
    ("How did you handle the layout shift when data is loading?", "Instead of letting the page bounce from blank to full table, the `loading` state renders a centered spinner within a stable flex container of identical width/height bounds, maintaining a strict Cumulative Layout Shift (CLS) of 0."),

    # Edge Cases & Testing
    ("What happens if an API call returns a 401 Unauthorized?", "In my global `api.js` interceptor, I catch 401 responses natively. I can clear the local storage tokens, dispatch a logout event to the App component tree, and automatically `useNavigate('/login')` bypassing the individual component's error handling entirely."),
    ("How would you unit test your custom Hooks?", "I would use `@testing-library/react-hooks` with `renderHook()`. It allows evaluating custom hooks in a mock harness, asserting that variables like `loading` toggle correctly and `products` populate when API mock promises resolve."),
    ("If the backend sent an unexpected format (like an object instead of array), what does the frontend do?", "In `productService.js`, I do a defensive check: `return Array.isArray(data.results) ? data.results : []`. This ensures React never maps over an undefined object, which completely breaks the frontend thread with a white screen of death."),
    ("How do you handle Cross-Site Scripting (XSS) in React?", "React natively escapes string variables via `{}`, mitigating 95% of injection attacks by rendering tags as raw strings. I strictly avoid using `dangerouslySetInnerHTML`. That neutralizes malicious descriptions entered into the DB."),
    ("Why use `useRef` for tracking the search timeout?", "`useRef` maintains a mutable variable reference that explicitly *survives* re-renders without triggering a re-render itself. If I used `useState` for the timer ID, updating it would cause a redundant render cycle."),

    # Advanced Concepts
    ("What is Hydration in Server-Side Rendering (SSR)?", "If we migrated this to Next.js, the server renders plain HTML for instantaneous First Paint. The browser downloads the Javascript and 'hydrates' the HTML by attaching event listeners, making the static page dynamically interactive."),
    ("Explain the difference between Shadow DOM and Virtual DOM.", "Virtual DOM is a React-specific javascript object representing the UI mapping. Shadow DOM is a browser-native technology (Web Components) used to rigidly encapsulate CSS and HTML elements away from the main document scope."),
    ("With many `useEffect` hooks running, how do you prevent Memory Leaks?", "If an effect subscribes to a WebSocket or a `setInterval`, returning a cleanup function explicitly terminates it. If a component unmounts while a Promise is pending, an abort controller prevents state updates on unmounted components."),
    ("Explain Strict Mode in React 18.", "Strict Mode deliberately double-invokes components, effects, and reducers in development. This flushes out hidden side-effects and impure functions by guaranteeing that developers write idempotent rendering logic."),
    ("What is tree-shaking?", "During the Webpack/Vite build process, tree-shaking statically analyzes ES6 module `import` and `export` paths. Any unused functions heavily exported by libraries (like Lodash or Lucide icons) are completely stripped from the final Javascript bundle."),
    
    # Wrap up
    ("Is there any part of this React codebase you consider a 'hack'?", "In `getProducts`, returning an empty array on failure instead of propagating a strict Error object simplifies the UI, but swallows the semantic meaning of the error from the Component. A true Error Boundary wrapper would be cleaner."),
    ("Why aren't you using React Suspense yet?", "Suspense excels for lazy loading code chunks and fetching declarative data (like with Relay or Next/Server Components). For a traditional SPA with strict client-side Axios fetching, classic state-based loading indicators offer granular control without massive architectural refactors."),
    ("If you could redo the architecture in one day, what stack choice would you change?", "I would forcefully upgrade the application to TypeScript instantly. The 'shape' of product payloads containing 11 fields is a prime candidate for strict `.d.ts` interfaces, eliminating 90% of defensive null-checking code I wrote.")
]

with open('frontend_documentation.md', 'r') as f:
    text = f.read()

text = text.replace("### Additional Rapid-Fire & Deep-Dive Questions (To reach 40+)", "")

for i in range(8, 45):
    old_str = f"**{i}. Q:** [Insert dynamic frontend question here relating to React, state, hooks, hooks performance]\n**A:** [Specific technical answer]\n\n"
    text = text.replace(old_str, "")

appended = "\n\n### 33 Additional Rapid-Fire & Deep-Dive Questions\n\n"
for i, (q, a) in enumerate(frontend_questions, start=8):
    appended += f"**{i}. Q:** {q}\n**A:** \"{a}\"\n\n"

with open('frontend_documentation.md', 'w') as f:
    f.write(text.strip() + appended)
