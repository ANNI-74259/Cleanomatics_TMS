# CODE_EXPLANATION.md - Cleanomatics TMS: Interview ke liye Code Samjhao (Hinglish)

Is file me har file ka explanation hai: **kya karti hai**, **kaise kaam karti hai**, aur **yahan kyun rakhi hai**.
Ye file har build step ke baad update hoti hai. (PLAN.md alag file hai, wo plan hai. Ye file code explain karti hai.)

**Status:** Backend done | Frontend done

---

## PART 1: BACKEND

### Big Picture (pehle ye samjho)

Backend ek **restaurant** jaisa hai:
- **Route** = waiter ka menu. Batata hai "ye URL aaya to kis ke paas jaana hai".
- **Middleware** = gate pe security guard. Check karta hai ki order sahi hai ya nahi.
- **Controller** = waiter. Order leta hai, kitchen ko deta hai, jawab wapas laata hai.
- **Service** = kitchen. Asli kaam (data banana, dhundhna, delete karna) yahin hota hai.
- **Error Handler** = manager. Kuch bhi galat ho to wo customer ko sahi tareeke se bata deta hai.

### Ek request ka safar (flow)

Maan lo frontend ne `POST /api/tasks` bheja:

```
Request
  -> helmet (safe headers)
  -> cors (kya ye frontend allowed hai?)
  -> morgan (log likho)
  -> express.json (body padho, 10kb se badi ho to rok do)
  -> rate limiter (bahut zyada requests to nahi?)
  -> route (POST / kis controller ko jayega)
  -> validate middleware (title, description sahi hai?)  --- galat ho to 400 error
  -> controller (service ko bulao)
  -> service (task banao, array me daalo)
  -> controller (201 + task wapas bhejo)

Kahin bhi error aaye -> errorHandler -> clean JSON response
```

### Folder structure

```
backend/
  package.json
  .env.example
  src/
    server.js        -> server start karta hai
    app.js           -> app banata hai, middleware jodta hai
    config/env.js    -> .env ki values ek jagah
    constants/       -> fixed lists (status, priority)
    routes/          -> URL ko controller se jodta hai
    controllers/     -> request/response sambhalta hai
    services/        -> asli logic + in-memory data
    validators/      -> input ke rules (Joi)
    middleware/      -> validate, rate limit, 404, error handler
    utils/           -> chhote helpers (AppError, asyncHandler)
```

**Layers alag kyun?** Agar kal database lagana ho to sirf `services/` badlegi. Routes aur controllers waise hi rahenge. Isse code samajhna, test karna aur badalna aasan hota hai. (Isko **Separation of Concerns** kehte hain, interview me ye line zaroor bolna.)

---

### 1. `package.json`
- **Kya:** project ki list. Konsi libraries chahiye aur scripts (`npm run dev`, `npm start`).
- **Libraries:** express (server), cors, helmet, express-rate-limit (security), joi (validation), morgan (logs), dotenv (.env padhna), nodemon (dev me auto restart).

### 2. `.env.example`
- **Kya:** settings ka sample (PORT, CLIENT_URL...).
- **Kyun:** asli `.env` GitHub pe nahi jaati (secrets hote hain). Dusre log `.env.example` copy karke apni `.env` bana lete hain.

### 3. `src/config/env.js`
- **Kya:** `.env` ki values padhkar ek object me deta hai (`env.port`, `env.clientUrls`...).
- **Kaise:** `dotenv.config()` file load karta hai. Agar value na mile to default use hota hai (jaise port 5000).
- **Kyun yahan:** poora app `process.env` directly nahi use karta, sab isi file se leta hai. Kal naam badalna ho to ek hi jagah badlo.

### 4. `src/constants/task.constants.js`
- **Kya:** allowed `STATUSES`, `PRIORITIES`, `SORT_FIELDS` aur `PRIORITY_ORDER` (low=1, medium=2, high=3).
- **Kyun:** ye values validator aur service dono me chahiye. Ek jagah likhi to typo ka risk kam, aur change ek baar.

### 5. `src/utils/AppError.js`
- **Kya:** apni custom error class jo status code saath rakhti hai. `throw new AppError('Task not found', 404)`.
- **Kaise:** normal `Error` ko extend karti hai aur `statusCode`, `errors`, `isOperational` add karti hai.
- **Kyun:** error handler ko pata chale ki ye "expected error" hai (safe message dikha sakte hain) ya koi bug (message chhupana hai).

### 6. `src/utils/asyncHandler.js`
- **Kya:** controller ko wrap karta hai.
- **Kaise:** agar controller ke andar error aaya to `.catch(next)` se wo error handler tak pahunch jaata hai.
- **Kyun:** warna har controller me `try/catch` likhna padta. Code chhota aur saaf rehta hai.

### 7. `src/validators/task.validator.js`
- **Kya:** Joi ke rules. Teen schemas hain:
  - `createTaskSchema`: title aur description **required**, status default `pending`, priority default `medium`.
  - `updateTaskSchema`: sab optional, par kam se kam ek field chahiye.
  - `listTasksQuerySchema`: search, filter, sort, page, limit ke rules (limit max 100).
- **Khaas cheezein:**
  - `isRealDate` check karta hai ki date asli ho (2026-02-31 reject hoga).
  - Har field ke custom error messages hain (jaise "Title is required").
- **Kyun alag file:** rules ek jagah rahe, controller/service me if-else ka dher na lage.

### 8. `src/middleware/validate.js`
- **Kya:** schema leta hai aur request ka data check karta hai.
- **Kaise:** `schema.validate(...)`. Do options important hain:
  - `abortEarly: false` -> saari galtiyan ek saath batata hai.
  - `stripUnknown: true` -> jo extra fields humne nahi maange (jaise `isAdmin: true`), wo hata deta hai. **Ye security hai.**
- Galti mili to `AppError(400)` bhejta hai. Sahi data ho to saaf kiya hua data `req.body` me rakh deta hai.

### 9. `src/middleware/rateLimiter.js`
- **Kya:** ek IP se limited requests allow karta hai (default 300 per 15 minute).
- **Kyun:** spam aur brute-force attacks se bachne ke liye.

### 10. `src/middleware/notFound.js`
- **Kya:** koi route match na ho to 404 error banata hai.
- **Kyun:** warna Express ka default HTML error page jaata, hume JSON chahiye.

### 11. `src/middleware/errorHandler.js`
- **Kya:** **sab** errors ek hi jagah handle karta hai.
- **Kaise:**
  1. Known error (AppError, bad JSON, body too large) -> uska status aur message bhejta hai.
  2. Unknown error (bug) -> console me log karta hai, client ko sirf "Something went wrong" (500) bhejta hai.
- **Security point:** production me stack trace ya internal details client ko kabhi nahi jaate.
- **Kyun last me:** Express me error handler sabse last register hota hai, tabhi wo upar ke sab errors pakad pata hai.

### 12. `src/services/task.service.js` (sabse important)
- **Kya:** asli logic. Data ek normal array `tasks` me rehta hai (server restart pe reset, jo assignment me allowed hai).
- **Functions:**
  - `getAllTasks(query)`: copy banata hai -> search -> status filter -> priority filter -> sort -> pagination -> `{ data, meta }`.
  - `getTaskById(id)`: dhundhta hai, na mila to 404.
  - `createTask(data)`: `crypto.randomUUID()` se id, `createdAt`/`updatedAt` set karta hai.
  - `updateTask(id, data)`: purana task + naya data merge. `id` aur `createdAt` kabhi nahi badalte, `updatedAt` naya hota hai.
  - `deleteTask(id)`: array se hata deta hai.
  - `seedSampleTasks()`: demo ke liye 5 tasks.
- **Chhote helpers:** `sortTasks` (due date na ho to last me), `findTaskIndex` (404 throw karta hai).
- **Kyun `{ ...task }` copy return karte hain:** taaki bahar ka code galti se asli array ka data na badal de.
- **Kyun alag file:** database badalna ho to sirf yahi file badlegi.

### 13. `src/controllers/task.controller.js`
- **Kya:** 5 functions (get all, get one, create, update, delete).
- **Kaise:** request se data nikalo -> service ko call karo -> sahi status code ke saath response bhejo (200, 201).
- **Kyun patla (thin):** controller me logic nahi, sirf request/response. Logic service me.

### 14. `src/routes/task.routes.js`
- **Kya:** URL + method ko middleware aur controller se jodta hai.
- Example: `router.post('/', validate(createTaskSchema), taskController.createTask)` -> pehle validate, phir create.

### 15. `src/app.js`
- **Kya:** Express app banata hai aur middleware ko **sahi order** me lagata hai.
- **Order kyun important:** security (helmet, cors) pehle, body parser, phir routes, 404 aur errorHandler sabse last.
- `/api/health` route: check karne ke liye ki server chal raha hai. Ye rate limit se bahar hai.

### 16. `src/server.js`
- **Kya:** sirf server start karta hai aur (agar `.env` me allowed ho) sample tasks daalta hai.
- **`app.js` aur `server.js` alag kyun:** `app.js` ko testing me bina server start kiye use kar sakte hain.

### 17. `.gitignore` (root)
- `node_modules/` aur `.env` GitHub pe nahi jaane chahiye. Ye file git ko batati hai ki inhe ignore karo.

---

## Security Summary (interview me ye table bol dena)

| Cheez | Kya karta hai | Kis attack se bachata hai |
|-------|---------------|----------------------------|
| helmet | Safe HTTP headers lagata hai | Common browser attacks (XSS, clickjacking) |
| cors | Sirf `CLIENT_URL` wale frontend ko allow | Dusri websites se API misuse |
| rate limit | IP ke hisaab se limit | Spam, brute-force |
| Joi + stripUnknown | Input check, extra fields hatao | Bad data, mass assignment |
| express.json limit 10kb | Badi body reject | Memory overload |
| errorHandler | 500 me details nahi dikhata | Information leak |
| .env + .gitignore | Secrets code me nahi | Secret leak |

---

## Interview Questions (Backend)

1. **Controller aur service alag kyun?** Controller HTTP sambhalta hai, service logic. Database badle to sirf service badlegi.
2. **Centralized error handling kya hai?** Saare errors ek middleware me jaate hain, isse response format same rehta hai aur code repeat nahi hota.
3. **`stripUnknown` kyun?** Extra fields hatane ke liye, taaki koi `id` ya `createdAt` zabardasti na bhej sake.
4. **Middleware ka order kyun matter karta hai?** Express upar se neeche chalata hai. Error handler last me ho tabhi sab errors pakadta hai.
5. **PUT me 400 aur 404 kab?** Data galat ho to 400, id na mile to 404.
6. **Data restart pe kyun reset?** Assignment me database allowed nahi, in-memory array use hua hai.

---

## Backend kaise chalaye

```bash
cd backend
npm install
copy .env.example .env      # Windows (Mac/Linux: cp .env.example .env)
npm run dev
```
Browser me `http://localhost:5000/api/health` kholo. `API is running` dikhe to sab sahi hai. Tasks dekhne ke liye `http://localhost:5000/api/tasks`.

---

## PART 2: FRONTEND

### Big Picture (pehle ye samjho)

Frontend bhi ek **restaurant ka dining area** jaisa hai (backend kitchen tha):
- **Page** = ek poori table/screen (Dashboard, Create, Edit, Details). Har page ka apna URL hai.
- **Component** = table pe rakhi chhoti cheezein (card, button, form). Inko bar bar reuse karte hain.
- **Hook** = waiter ki yaad-dasht. Ek baar likha, kahin bhi use karo (data load karna, theme yaad rakhna).
- **API layer** = phone line kitchen tak. Sirf yahi file backend se baat karti hai.
- **Context** = notice board jo sabko dikhta hai (saare tasks ki ginti, charts ke numbers).
- **CSS variables** = rang ka dabba. Theme badalna ho to sirf rang badalte hain, layout same rehta hai.

**Tech stack:** React 18 (UI), Vite (fast dev server aur build), React Router (pages), Axios (API calls), `@hello-pangea/dnd` (drag and drop), `lucide-react` (icons). Charts ke liye koi library nahi, plain SVG aur div use hue hain.

### Ek action ka safar (flow)

Maan lo user ne Kanban board pe task card ko "Pending" se "In Progress" me drag kiya:

```
User card drop karta hai
  -> KanbanBoard (onDragEnd chalta hai)
  -> DashboardPage.handleDragEnd
  -> UI turant update (optimistic update, user ko wait nahi karna)
  -> taskApi.updateTask  -> httpClient (axios)  -> Backend PUT /api/tasks/:id
  -> Success: toast "Moved to In Progress" + stats refresh
  -> Fail: purani list wapas (rollback) + error toast
```

### Folder structure

```
frontend/
  index.html, vite.config.js, package.json, .env.example
  src/
    main.jsx            -> app yahan se start hota hai
    App.jsx             -> saare routes (URL -> page)
    api/                -> backend se baat (httpClient, taskApi)
    hooks/              -> reusable logic (useTasks, useDebounce, useTheme)
    context/            -> sabke liye shared data (TaskStatsContext)
    utils/              -> chhote helpers (constants, dates, stats, validators)
    pages/              -> 4 screens
    components/
      layout/           -> TopBar, SideRail, Layout, ThemeToggle
      dashboard/        -> charts, shortcut cards, insights, toolbar
      tasks/            -> Kanban, list table, form, pagination, delete popup
      ui/               -> chhote reusable tukde (Button, Modal, Toast...)
    styles/             -> variables.css (colors), global.css (saari styling)
```

**Folders aise kyun?** Jo cheez kis kaam ki hai uske hisaab se group ki hai. UI ke tukde (`ui/`) kisi bhi project me chal jaayenge, `tasks/` aur `dashboard/` is app ke liye hain. Isse file dhundhna aur samajhna aasan hota hai.

---

### A. Project setup files

#### 1. `package.json`
- **Kya:** libraries ki list aur scripts: `npm run dev` (development server), `npm run build` (production build), `npm run preview`.
- **`"type": "module"`:** modern `import/export` syntax chalta hai.
- **Libraries:** react, react-dom (UI), react-router-dom (pages), axios (API), `@hello-pangea/dnd` (drag and drop), lucide-react (icons). Dev me vite aur `@vitejs/plugin-react`.

#### 2. `.env.example`
- **Kya:** `VITE_API_BASE_URL=http://localhost:5000/api`. Backend ka address.
- **Kyun:** backend kisi aur port/server pe ho to code nahi badalna, sirf `.env` badlo. Vite me env variable ka naam `VITE_` se shuru hona zaroori hai, warna browser tak nahi pahunchta.

#### 3. `vite.config.js`
- **Kya:** React plugin lagata hai aur dev server port **5173** fix karta hai.
- **Kyun 5173:** backend ke `CLIENT_URL` (CORS) me yahi port allowed hai. Port alag hota to CORS error aata.

#### 4. `index.html`
- **Kya:** ek hi HTML page jisme `<div id="root">` hai. Poora React app isi ke andar banta hai (isko **SPA** kehte hain, Single Page Application).
- **Do khaas cheezein:**
  - **Urbanist font** Google Fonts se load hota hai.
  - Ek chhota **inline script** React load hone se *pehle* hi theme set kar deta hai (localStorage ya system setting se). **Kyun:** warna page pehle light dikhta phir dark ho jaata, jise "flash" kehte hain.

#### 5. `src/main.jsx`
- **Kya:** entry point. `App` ko `#root` me render karta hai.
- **`BrowserRouter`:** React Router ko poore app me chalu karta hai (URL badalne par page badalna).
- **`React.StrictMode`:** development me galtiyan jaldi pakadta hai.
- **CSS imports:** `variables.css` pehle, `global.css` baad me (kyunki global.css variables use karti hai).

#### 6. `src/App.jsx`
- **Kya:** saare **routes** ek jagah:
  - `/` -> DashboardPage
  - `/tasks/new` -> CreateTaskPage
  - `/tasks/:id` -> TaskDetailsPage
  - `/tasks/:id/edit` -> EditTaskPage
  - `*` (kuch aur) -> "Page not found"
- **Wrapping:** `ToastProvider` (popup messages) -> `Layout` (top bar + rail) -> `Routes`. Isliye har page me toast aur layout milta hai.

---

### B. API layer (`src/api/`)

#### 7. `httpClient.js`
- **Kya:** poore app ke liye **ek hi axios instance**. `baseURL` env se aata hai, `timeout` 10 second.
- **Interceptor (sabse important):** har error ko ek simple object me badalta hai: `{ message, fieldErrors, status }`.
  1. Server ne error diya (400, 404, 500) -> uska `message` aur `errors` nikalta hai.
  2. Server se jawab hi nahi aaya -> "Cannot reach the server. Please check that the backend is running."
  3. Kuch aur -> generic message.
- **Kyun:** components ko axios ke ajeeb error object se nahi jhoojhna padta. Sab jagah `err.message` likhna kaafi hai. Ye backend ke centralized error handler ka frontend wala jodi hai.

#### 8. `taskApi.js`
- **Kya:** 5 functions: `getTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask`. Har ek ek backend endpoint ko call karta hai.
- **Rule:** components kabhi seedha axios nahi bulate, sirf ye functions use karte hain.
- **Kyun:** kal URL ya library badalni ho to sirf ek file badlegi (backend me jaise `services/` ka kaam tha).

---

### C. Utils (`src/utils/`)

#### 9. `constants.js`
- **Kya:** `APP_NAME`, `USER_NAME`, `STATUSES`, `PRIORITIES`, `SORT_OPTIONS` aur do helpers `statusLabel()` / `priorityLabel()` (`in_progress` -> "In Progress").
- **`SORT_OPTIONS` ka `value`:** `"createdAt:desc"` jaisa text. Use `split(':')` karke `sortBy` aur `order` me tod ke API ko bhejte hain.
- **Kyun:** dropdown, form, board sab yahi list use karte hain. Ek jagah badlo, sab jagah badal jaata hai (backend ke `task.constants.js` jaisa).

#### 10. `formatDate.js`
- **Kya:** date ke helpers: `toYMD`, `todayYMD`, `parseYMD`, `formatShortDate` ("Nov 2"), `formatFullDate`, `formatDateTime`, `formatTime`, `daysUntil`.
- **Khaas baat:** due date `"YYYY-MM-DD"` text hai. `new Date("2026-11-02")` timezone ki wajah se din aage-peeche kar sakta hai. Isliye `parseYMD` haath se year, month, day tod ke local date banata hai. **Interview me ye point zaroor bolna.**

#### 11. `stats.js`
- **Kya:** dashboard ke saare numbers yahin se nikalte hain, sab tasks ki list se calculate hote hain.
- **Functions:**
  - `isOverdue`: due date nikal gayi aur task completed nahi.
  - `isDueSoon`: agle 3 din me due, completed nahi.
  - `hasNoDueDate`: due date hi nahi.
  - `QUICK_FILTERS`: ye teen filters backend nahi jaanta, isliye frontend khud lagata hai.
  - `completionPercent`: kitne % tasks complete.
  - `dueThisWeek`: Mon se Sun, har din kitne tasks due.
  - `completedLast7Days`: pichhle 7 din me roz kitne complete hue (`updatedAt` se).
  - `getInsights`: Smart Insights card ke short messages ("2 tasks are overdue..."), saath me `filter` key jo button dabane par khulti hai.
- **Kyun alag file:** ye pure functions hain (input -> output), UI se alag. Samajhna aur test karna aasan.

#### 12. `validators.js`
- **Kya:** `validateTask(values)` form ke errors ka object lautata hai: title 3-100 chars, description required aur max 500, due date format sahi.
- **Kyun:** backend ke Joi rules jaise hi hain, taaki user ko galti request jaane se *pehle* hi dikh jaaye. Backend phir bhi check karta hai (frontend par bharosa nahi karte, **security ka rule**).

---

### D. Hooks aur Context

#### 13. `hooks/useDebounce.js`
- **Kya:** value tabhi update hoti hai jab user `400ms` tak type karna band kar de.
- **Kaise:** `setTimeout` lagata hai; value dobara badle to purana timer `clearTimeout` se hat jaata hai.
- **Kyun:** user "meeting" type kare to 7 API calls nahi, sirf 1 call jaaye.

#### 14. `hooks/useTasks.js` (sabse important hook)
- **Kya:** tasks load karta hai aur `tasks`, `meta`, `loading`, `error`, `refetch` deta hai.
- **Khaas cheezein:**
  - **`latestRequest` (race condition fix):** har request ko ek number milta hai. Agar purani request der se aayi to ignore ho jaati hai. Warna purane search ka result naye search ko overwrite kar deta.
  - **`paramsKey = JSON.stringify(params)`:** `params` object har render me naya banta hai, to `useEffect` bar bar chalta. Text bana ke compare karne se sirf asli badlav par reload hota hai.
  - **`refetch(true)` = silent:** loading spinner nahi dikhata. Delete ya drag ke baad screen jhapkaata nahi.
- **Kyun hook:** board aur stats dono ko "load + loading + error" chahiye. Ek baar likha, dono use karte hain.

#### 15. `hooks/useTheme.js`
- **Kya:** light/dark theme. Pehli baar system setting follow karta hai, baad me choice `localStorage` (`tms-theme`) me yaad rakhta hai.
- **Kaise:** `<html data-theme="dark">` set karta hai. CSS me `[data-theme='dark']` wale variables tab lag jaate hain.

#### 16. `context/TaskStatsContext.jsx`
- **Kya:** **ek** list sab tasks ki (limit 100) jo top bar ka %, shortcut cards ki ginti, charts aur insights ko chahiye.
- **Kyun alag list?** Board me filtered/paginated list hoti hai (jaise sirf 10 tasks, ya sirf "high"). Lekin "kul kitne complete" ke liye *saare* tasks chahiye. Isliye dono alag: board ki apni list, stats ki apni.
- **Context kyun:** TopBar, DashboardPage, Create/Edit pages sab ko ye data ya `refreshStats()` chahiye. Props se neeche bhejte bhejte (prop drilling) ganda hota, context se seedha mil jaata hai.
- **`refreshStats`:** task banne/badalne/delete hone ke baad bulate hain, taaki numbers turant sahi ho jaayein (silent refetch).

---

### E. Layout (`components/layout/`)

#### 17. `Layout.jsx`
- **Kya:** page ka frame: `TopBar` + `SideRail` + `<main>` jisme page aata hai. `TaskStatsProvider` yahin lagta hai, to frame ke andar sab ko stats mil jaate hain.
- Theme yahin `useTheme()` se aata hai aur dono (TopBar, SideRail) ko jaata hai.

#### 18. `TopBar.jsx`
- **Kya:** logo, "X% of tasks completed" pill, search box, theme button, avatar (naam ka pehla akshar).
- **Search kaise chalta hai:** form submit par `navigate('/?q=...')`. Dashboard URL se `q` padhkar search me daal deta hai. Is tarah kisi bhi page se search karo to board khulta hai.

#### 19. `SideRail.jsx`
- **Kya:** left side ke gol icon buttons: Board, List, Stats, New task, aur neeche theme toggle. Mobile pe ye neeche ka bar ban jaata hai (CSS media query).
- **Active button:** `useLocation` aur `?view=` dekh ke highlight hota hai.
- **Stats button:** dashboard pe jaakar `#stats` section tak smooth scroll karta hai.

#### 20. `ThemeToggle.jsx`
- Chand/sooraj ka button. TopBar aur SideRail dono me use hota hai, isliye alag component.

---

### F. Pages (`src/pages/`)

#### 21. `DashboardPage.jsx` (sabse bada aur sabse important)
- **Kya:** main screen: greeting, shortcut cards, "Due This Week" chart, Smart Insights, Task Board (Kanban ya List), Completed chart.
- **State:** `search`, `filters` (priority, status, quick), `sort`, `page`, `taskToDelete`.
- **View URL me:** board ya list `?view=list` se pata chalta hai (`useSearchParams`). Isse refresh par bhi view wahi rehta hai aur link share ho sakta hai.
- **Data kaise aata hai:**
  1. Search ko `useDebounce` se 400ms ruka ke API params banate hain.
  2. **Board view:** ek baar me 100 tasks, kyunki 3 columns me bantne hain. **List view:** server-side pagination, 10 per page.
  3. Filter ya search badle to `page` wapas 1 ho jaata hai.
  4. `useTasks(params)` backend se list laata hai.
- **Quick filters (Due Soon, Overdue, No Due Date):** backend ye nahi jaanta, isliye list aane ke baad `tasks.filter(QUICK_FILTERS[...])` frontend me lagta hai. Isliye us time pagination band rehti hai (`usePaging`).
- **Shortcut cards:** card dabao to filters set hote hain aur board tak scroll. Wahi card dobara dabao to filter hat jaata hai (toggle).
- **Drag and drop (`handleDragEnd`):** **optimistic update.** Pehle UI badal do, phir API bulao. Fail ho to purani list wapas (`rollback`) aur error toast. User ko fast feel hota hai.
- **Delete:** pehle `ConfirmDeleteModal`, confirm par API, phir toast + list refresh.
- **`useMemo`:** insights, charts ka data tabhi dobara calculate hota hai jab `allTasks` badle.
- **Screen ke 5 halaat (`content` variable):**
  1. Error -> `ErrorState` (Retry button)
  2. Loading -> skeleton cards / spinner
  3. Koi task hi nahi -> `EmptyState` ("Create your first task")
  4. Filter laga par kuch nahi mila -> `EmptyState` ("Clear filters")
  5. Sab theek -> Kanban board ya List table

#### 22. `CreateTaskPage.jsx`
- **Kya:** naya task banane ka page. `TaskForm` ko `createTask` API ke saath jodta hai.
- **Khaas:** column ke "+" se aao to URL me `?status=in_progress` hota hai, to form me wahi status pehle se chuna hua milta hai. Galat status ho to `pending` default.
- Success par: toast, `refreshStats()`, dashboard par wapas.

#### 23. `EditTaskPage.jsx`
- **Kya:** URL ke `:id` se task `getTask` se laata hai, form me pehle se bhar deta hai, save par `updateTask`.
- Loading, error (Retry ke saath), aur form teeno halaat handle karta hai.

#### 24. `TaskDetailsPage.jsx`
- **Kya:** ek task ki poori jaankari: title, status, priority, description, due date, created, last updated. Edit aur Delete buttons.
- Delete par pehle confirm popup aata hai.

---

### G. Task components (`components/tasks/`)

#### 25. `KanbanBoard.jsx`
- **Kya:** 3 columns (STATUSES se) banata hai. Har column ko apne status ke tasks `filter` karke deta hai.
- **`DragDropContext`:** drag library ka main wrapper. Card chhodte hi `onDragEnd` chalta hai.

#### 26. `KanbanColumn.jsx`
- **Kya:** ek column: header (status dot, naam, task count, "+" button) aur cards ki list.
- **`Droppable`:** is area me card gira sakte hain. `droppableId` = status ki value (`pending`, etc.). Isi se pata chalta hai card kis status me gira.
- **`provided.placeholder`:** drag ke dauran jagah banaye rakhta hai.
- Khali column me "No tasks here yet" aur "Add New Task" button.

#### 27. `KanbanCard.jsx`
- **Kya:** ek task card: priority tag, due date chip, high priority par flame icon, title, 2 line ki description, aur View / Edit / Delete icons.
- **`Draggable`:** card ko uthane layak banata hai. Bahar wala div library ke control me hai, andar wala hum style karte hain.
- **Overdue:** date chip laal ho jaata hai (`isOverdue`).

#### 28. `TaskListTable.jsx`
- **Kya:** List view ki table: Name, Status, Priority, Deadline, Actions. Naam par click se details page khulta hai.

#### 29. `Pagination.jsx`
- **Kya:** Previous / Next buttons aur "Page X of Y". Pehle page par Previous aur aakhri par Next disabled.
- Ye **server-side pagination** hai: har baar backend se sirf 10 tasks aate hain.

#### 30. `TaskForm.jsx` (Create aur Edit dono ke liye ek hi form)
- **Kya:** title, description, status, priority, due date.
- **Controlled inputs:** har input ki value state me rehti hai. `handleChange` `name` attribute se sahi field update karta hai (ek function sab fields ke liye).
- **Submit ke 2 step:**
  1. Pehle `validateTask` browser me.
  2. Phir `onSubmit` (API). Backend ne mana kiya to `err.fieldErrors` se har field ke neeche uska error dikhata hai, aur upar `formError`.
- Khali due date ko `null` bhejta hai.
- `submitting` state: button disable aur "Saving..." dikhta hai (double click se do task na bane).
- **Kyun ek form:** Create aur Edit me sirf `initialValues`, `onSubmit` aur button ka text alag hai. Code do baar nahi likhna pada.

#### 31. `ConfirmDeleteModal.jsx`
- "Are you sure?" popup. `busy` ho to buttons disable aur text "Deleting...".

---

### H. Dashboard components (`components/dashboard/`)

#### 32. `BoardToolbar.jsx`
- Search box, priority dropdown, sort dropdown, "Clear filters" (sirf tab dikhta hai jab koi filter laga ho), aur Board/List switch.
- Ye khud kuch nahi rakhta, sab kuch props se aata hai (**controlled component**). State DashboardPage me rehti hai.

#### 33. `ViewToggle.jsx`
- Board | List switch. `aria-pressed` se screen reader ko pata chalta hai kaun sa chuna hua hai.

#### 34. `ShortcutCards.jsx`
- 6 chhote cards: High Priority, Due Soon, Overdue, In Progress, Completed, No Due Date. Har ek me live count.
- **`SHORTCUTS` array:** har card ki `label`, `sub` aur `count` function. Naya card chahiye to array me ek line.

#### 35. `DueThisWeekChart.jsx`
- **Plain div bar chart.** Har din ka bar, height = `count / max * 100%`. Aaj ka din highlight. Count 0 ho to patli line.
- **Kyun library nahi:** itne chhote chart ke liye bhari library ki zaroorat nahi, bundle chhota rehta hai.

#### 36. `CompletedChart.jsx`
- **Plain SVG line chart.** Points ko smooth curve (`C` bezier) se jodta hai, neeche gradient fill, dotted grid, aur sabse ooncha point par dark bubble me number.
- Math: `x` barabar doori par, `y = neeche - (count/max) * height`.

#### 37. `SmartInsights.jsx`
- Ek card jisme ek-ek karke tips dikhte hain. Arrow se agla/pichhla (`%` modulo se ghoomta hai). "VIEW TASKS" dabane par us insight ka filter lag jaata hai.
- `index % insights.length` isliye taaki list chhoti ho jaaye to bhi crash na ho.

---

### I. UI components (`components/ui/`) - chhote reusable tukde

#### 38. `Button.jsx`
- `variant`: primary / ghost / danger. `...rest` se baaki props (`onClick`, `disabled`) seedha `<button>` ko chale jaate hain.

#### 39. `Modal.jsx`
- Popup. **Esc** dabane ya bahar click karne par band. Andar click par band na ho isliye `stopPropagation`.
- `useEffect` ke cleanup me keydown listener hatate hain (memory leak nahi hota).

#### 40. `Toast.jsx`
- Chhota message jo 3 second baad gayab. `ToastProvider` + `useToast()` hook. Use: `showToast('Saved')` ya `showToast('Oops', 'error')`.
- **Context kyun:** koi bhi page ya component seedha toast dikha sake.

#### 41. `Spinner.jsx`, `EmptyState.jsx`, `ErrorState.jsx`
- **Spinner:** ghoomta hua loader. **EmptyState:** jab dikhane ko kuch na ho (button ya link ke saath). **ErrorState:** jab request fail ho (Retry button ke saath).
- **Kyun:** loading, empty, error teeno har data screen par chahiye. Sahi app me ye kabhi chhootne nahi chahiye.

#### 42. `StatusBadge.jsx`, `PriorityTag.jsx`
- Rangeen label. CSS class naam value se bante hain (`badge--completed`, `tag--high`), rang CSS me hain.

---

### J. Styles (`src/styles/`)

#### 43. `variables.css`
- **Kya:** saare rang aur font ek jagah, **light** (default) aur **dark** (`[data-theme='dark']`) dono ke liye.
- **Kyun:** theme badalne par layout nahi badalta, sirf variables badalte hain. `global.css` me rang kabhi seedha nahi likhe, hamesha `var(--accent)` jaise.

#### 44. `global.css`
- **Kya:** poori styling, sections me bati hui: Base, App shell, Page header, Cards, Charts, Board, Tags, List view, Buttons, Forms, States/Modal/Toast, Responsive.
- **App shell:** CSS Grid se left rail (96px) aur main area.
- **Responsive (3 level):**
  - 1099px se kam: do column wali row ek column ho jaati hai.
  - 699px se kam (mobile): rail neeche ka bar ban jaata hai, board ke columns swipe hote hain, form ek column.
- **Accessibility:** `:focus-visible` outline (keyboard se chalane waalon ke liye).
- **Animations:** `spin` (spinner), `shimmer` (loading skeleton), `slide-in` (toast).

---

## Frontend ke important concepts (interview me ye bolna)

| Concept | Kahan use hua | Fayda |
|---------|---------------|-------|
| Component reuse | `Button`, `Modal`, `TaskForm` | Code repeat nahi hota |
| Custom hooks | `useTasks`, `useDebounce`, `useTheme` | Logic UI se alag aur reusable |
| Context API | `TaskStatsContext`, `Toast` | Prop drilling se bachna |
| Debounce | Search | API calls kam |
| Race condition fix | `useTasks` (`latestRequest`) | Purana response naye ko overwrite na kare |
| Optimistic update + rollback | Drag and drop | Fast UI, fail par wapas |
| Server-side pagination | List view | Sirf 10 tasks load |
| Controlled components | `TaskForm`, `BoardToolbar` | State ek jagah, predictable |
| Double validation | `validators.js` + backend Joi | Fast feedback + security |
| URL as state | `?view=list`, `?q=...`, `?status=...` | Refresh par bhi wahi screen, link share |
| Loading / empty / error states | Dashboard, Edit, Details | Har halaat me user ko pata hai kya ho raha |
| CSS variables | Theme | Light/dark bina layout badle |
| Accessibility | `aria-label`, `role`, `aria-pressed`, `:focus-visible` | Screen reader aur keyboard friendly |

---

## Interview Questions (Frontend)

1. **Ek hi `TaskForm` Create aur Edit dono ke liye kaise?** `initialValues`, `onSubmit`, `submitLabel` props se. Form ko pata nahi ki wo create kar raha hai ya edit, wo bas data bhejta hai.
2. **Debounce kya hai aur kyun?** User ke type karna band karne ke baad hi value update. Isse har akshar par API call nahi jaati.
3. **Race condition kya hai aur kaise roka?** Do requests aage-peeche jaayen aur purani baad me aaye to galat data dikhta. `latestRequest` ref se sirf sabse nayi request ka result use karte hain.
4. **Optimistic update kya hai?** API ke jawab ka wait kiye bina UI turant badal dena, fail hone par rollback. Drag and drop me ye use hua.
5. **Alag `TaskStatsContext` kyun, board ki list se hi kyun nahi?** Board filtered/paginated hai. Stats ko hamesha *saare* tasks chahiye.
6. **Due Soon / Overdue filter frontend me kyun?** Backend ye filters support nahi karta. Isliye list aane ke baad frontend lagata hai.
7. **View `?view=list` URL me kyun, state me kyun nahi?** Refresh par ya link share karne par bhi wahi view rahe.
8. **API calls ek hi file me kyun (`taskApi.js`)?** Backend ya library badle to ek jagah badlega. Components saaf rehte hain.
9. **Validation dono jagah kyun?** Frontend user ko jaldi feedback deta hai. Backend asli security hai kyunki frontend ko koi bhi bypass kar sakta hai.
10. **Charts me library kyun nahi?** Chhote charts hain, SVG aur div se ban gaye. Bundle size chhota rehta hai.
11. **Theme flash kaise roka?** `index.html` ke inline script ne React se pehle hi `data-theme` set kar diya.
12. **Date ko `new Date("YYYY-MM-DD")` se kyun nahi padha?** Timezone ki wajah se din badal sakta hai. `parseYMD` local date banata hai.

---

## Frontend kaise chalaye

Pehle backend chalu rakho (`http://localhost:5000`), phir naye terminal me:

```bash
cd frontend
npm install
copy .env.example .env      # Windows (Mac/Linux: cp .env.example .env), optional
npm run dev
```
Browser me `http://localhost:5173` kholo. Dashboard dikhe aur tasks aaye to frontend aur backend dono jud gaye.

Production build ke liye: `npm run build` (output `dist/` folder me).
