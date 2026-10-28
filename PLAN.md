# Cleanomatics TMS - Task Management System Build Plan

Full-stack assignment: React frontend + Node/Express backend, in-memory data, REST API.

---

## 1. What We Are Building (Understanding)

A small Task Manager where a user can:
- See all tasks on a **Dashboard** (title, description, status, priority, created date)
- **Create**, **Edit**, **View** and **Delete** tasks
- See proper **loading / empty / error** states
- Use it on both **desktop and mobile**

Hard constraints:
- NO database, NO Firebase. Data lives in a backend array (resets on restart).
- Backend must have clean **routes -> controllers -> services** separation.
- Frontend must have **reusable components** and a **dedicated API layer**.
- Deliverables: GitHub repo, README, API docs, Postman/Swagger, .env.example, screenshots/demo.

Evaluation weights: UI/UX 20, React 20, REST API 20, Backend architecture 20, Validation/errors 10, Docs/Git 10.

---

## 2. Tech Decisions

| Area | Choice | Why |
|------|--------|-----|
| Frontend | React (Vite) + React Router | Fast setup, matches my skills |
| HTTP client | axios (inside `api/` layer only) | Interceptors for clean error handling |
| Styling | Plain CSS + CSS variables | Easy dark mode, no extra setup risk, responsive with grid/flex |
| Backend | Node.js + Express | Preferred in assignment |
| Validation | Joi (backend) + hand-written validators (frontend) | Clear error messages |
| Storage | In-memory array in `task.service.js` | Assignment rule |
| IDs | `crypto.randomUUID()` | No extra package |
| Config | dotenv (`PORT`, `CLIENT_URL`, `NODE_ENV`) | Env variables requirement |
| Docs | Swagger (swagger-ui-express + OpenAPI yaml) AND Postman collection | Bonus + deliverable |
| Dev tools | nodemon, cors, morgan (logging) | Standard |
| Security | helmet, express-rate-limit, Joi (stripUnknown), 10kb body limit | Basic hardening that is easy to explain |
| Drag and drop | @hello-pangea/dnd | Beginner-friendly Kanban drag and drop library |
| Interview notes | CODE_EXPLANATION.md (separate from this file) | Explains every file: what, how, why |

---

## 3. Project Structure

```
Task-Management/
├── PLAN.md
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── docs/
│   │   ├── openapi.yaml
│   │   └── TaskManagement.postman_collection.json
│   └── src/
│       ├── server.js              # starts server, reads env
│       ├── app.js                 # express app, middlewares, routes
│       ├── config/env.js          # loads and exports env values
│       ├── routes/task.routes.js
│       ├── controllers/task.controller.js
│       ├── services/task.service.js        # in-memory store + business logic
│       ├── validators/task.validator.js    # Joi schemas
│       ├── middleware/
│       │   ├── validate.js                 # runs validator, returns 400
│       │   ├── notFound.js                 # unknown route -> 404
│       │   └── errorHandler.js             # centralized error handler
│       └── utils/
│           ├── AppError.js                 # custom error (statusCode, message)
│           └── asyncHandler.js             # wraps async controllers
└── frontend/
    ├── package.json
    ├── .env.example                        # VITE_API_BASE_URL
    └── src/
        ├── main.jsx, App.jsx
        ├── api/
        │   ├── httpClient.js               # axios instance + error normalizer
        │   └── taskApi.js                  # getTasks, getTask, createTask, updateTask, deleteTask
        ├── hooks/
        │   ├── useTasks.js                 # list state, loading, error, refetch
        │   ├── useDebounce.js
        │   └── useTheme.js                 # dark mode toggle
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── CreateTaskPage.jsx
        │   ├── EditTaskPage.jsx
        │   └── TaskDetailsPage.jsx
        ├── components/
        │   ├── layout/ (Header, Layout, ThemeToggle)
        │   ├── tasks/ (TaskCard, TaskList, TaskForm, TaskFilters, SearchBar, Pagination)
        │   └── ui/ (Button, Badge, Modal, Spinner, EmptyState, ErrorState, Toast)
        ├── utils/ (validators.js, formatDate.js, constants.js)
        └── styles/ (variables.css, global.css)
```

---

## 4. Data Model

```json
{
  "id": "uuid",
  "title": "string (required, 3-100 chars)",
  "description": "string (required, max 500 chars)",
  "status": "pending | in_progress | completed   (default: pending)",
  "priority": "low | medium | high              (default: medium)",
  "dueDate": "YYYY-MM-DD or null",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

---

## 5. API Design

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Success | Errors |
|--------|----------|---------|--------|
| GET | /tasks | 200 | - |
| GET | /tasks/:id | 200 | 404 |
| POST | /tasks | 201 | 400 |
| PUT | /tasks/:id | 200 | 400, 404 |
| DELETE | /tasks/:id | 200 | 404 |
| GET | /health | 200 | (extra, for quick check) |

**GET /tasks query params (bonus features, handled on server):**
`search`, `status`, `priority`, `sortBy` (createdAt | priority | dueDate), `order` (asc | desc), `page`, `limit`

**Response shape (consistent everywhere):**
```json
// success (list)
{ "success": true, "data": [ ... ], "meta": { "total": 25, "page": 1, "limit": 10, "totalPages": 3 } }
// success (single)
{ "success": true, "data": { ... } }
// delete
{ "success": true, "message": "Task deleted successfully" }
// error
{ "success": false, "message": "Validation failed", "errors": [ { "field": "title", "message": "Title is required" } ] }
```

**Validation rules (backend):**
- title: required, trimmed, min 3, max 100
- description: required, trimmed, max 500
- status: one of 3 allowed values
- priority: one of 3 allowed values
- dueDate: optional, valid date (YYYY-MM-DD)
- Unknown fields are stripped. Invalid `:id` format or missing task -> 404.

**Status code map:** 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Internal Server Error (generic message, no stack leak in production).

---

## 6. Backend Flow (Layer Responsibilities)

```
Request -> routes (URL + middleware list)
        -> validate middleware (Joi)
        -> controller (read req, call service, send res)
        -> service (business logic + in-memory array, throws AppError)
        -> errorHandler (formats every error in one place)
```

- Routes: only wiring, no logic.
- Controllers: thin, wrapped in `asyncHandler`.
- Service: all array operations (filter, search, sort, paginate, CRUD). Seeds 4-5 sample tasks on startup so dashboard is not empty during demo.
- errorHandler: handles AppError, Joi errors, malformed JSON, and unknown errors.
- CORS: allow `CLIENT_URL` from env.

---

## 7. Frontend Plan

**Routes**
- `/` Dashboard (Kanban board with drag and drop, plus a List view toggle)
- `/tasks/new` Create Task
- `/tasks/:id` Task Details
- `/tasks/:id/edit` Edit Task

**Key behaviors**
- `taskApi.js` is the ONLY place that calls the backend. Components never use axios directly.
- `useTasks` hook holds `tasks, loading, error, meta` and exposes `refetch`. Refetches after create/update/delete.
- `TaskForm` is ONE reusable component for both create and edit (props: `initialValues`, `onSubmit`, `submitLabel`).
- Client validation: title (required, min 3), description (required), dueDate valid. Errors shown under each field; submit blocked until fixed.
- Delete uses a confirmation modal, then toast + list refresh.
- States: Spinner (loading), EmptyState with "Create your first task" button, ErrorState with Retry button. Separate "no results for filters" empty message.
- Responsive: CSS grid of cards (1 column on mobile, 2 on tablet, 3 on desktop), filters collapse into a stacked layout on small screens, tap-friendly buttons.
- Dark mode: CSS variables switched by `data-theme` on `<html>`, saved in localStorage, defaults to system preference.
- Debounced search: 400ms `useDebounce`, query goes to the API.

---

## 8. Bonus Features Checklist

- [x] Search by title/description (debounced)
- [x] Filter by status and priority
- [x] Sort by created date / priority / due date
- [x] Pagination (server-side)
- [x] Dark mode
- [x] Swagger docs at `/api-docs` + Postman collection

---

## 9. Build Order (Phases)

**Phase 1 - Setup (Day 1, morning)**
1. `git init`, `.gitignore`, create GitHub repo
2. Scaffold backend (`npm init`, install express, cors, dotenv, joi, morgan, nodemon)
3. Scaffold frontend with Vite

**Phase 2 - Backend (Day 1)**
4. app.js, server.js, env config, health route
5. AppError, asyncHandler, notFound, errorHandler
6. task.service.js with CRUD + seed data
7. Joi validators + validate middleware
8. Controller + routes, test every endpoint with Postman/curl
9. Add search / filter / sort / pagination to service

**Phase 3 - Frontend core (Day 2)**
10. Router, layout, header, theme toggle, CSS variables
11. httpClient + taskApi
12. Dashboard: TaskList, TaskCard, loading/empty/error states
13. TaskForm + Create page, then Edit page
14. Task Details page, delete confirmation modal, toasts

**Phase 4 - Bonus and polish (Day 2-3)**
15. SearchBar (debounced), TaskFilters, sort dropdown, Pagination
16. Responsive pass (check 360px, 768px, 1280px widths)
17. Accessibility basics (labels, focus states, aria on modal)

**Phase 5 - Docs and delivery (Day 3)**
18. Swagger `openapi.yaml` + Postman collection export
19. README (setup, run, env vars, endpoints, folder structure, screenshots)
20. `.env.example` for both apps
21. Screenshots (desktop, mobile, dark mode) or a short demo video
22. Final test of the whole flow, push to GitHub

---

## 10. Git Practices

- `main` stays stable; work on small feature branches or at least small commits.
- Commit messages in conventional style, for example:
  - `chore: initialize backend with express`
  - `feat(api): add task CRUD service and routes`
  - `feat(api): add joi validation and error handler`
  - `feat(ui): add dashboard with loading and empty states`
  - `feat(ui): add reusable TaskForm with validation`
  - `docs: add README and swagger spec`
- Never commit `.env` or `node_modules`.

---

## 11. Testing Checklist (before submit)

- [ ] POST with missing title -> 400 with field error
- [ ] POST valid -> 201, task appears on dashboard
- [ ] GET unknown id -> 404
- [ ] PUT updates `updatedAt`, keeps `createdAt`
- [ ] DELETE then GET same id -> 404
- [ ] Empty list shows empty state
- [ ] Stop backend -> UI shows error state with Retry
- [ ] Search, filter, sort, pagination work together
- [ ] Mobile layout has no horizontal scroll
- [ ] Dark mode persists after refresh
- [ ] Fresh clone + README steps run without errors

---

## 12. Risks and Decisions

- **Server-side vs client-side filtering:** doing it on the server keeps pagination correct and shows API design skill.
- **Date handling:** store `dueDate` as `YYYY-MM-DD` string to avoid timezone shifts.
- **Overbuilding:** assignment says focus is code quality and architecture, not fancy visuals. Keep UI clean and simple.
- **Express version:** use Express 4 (stable, widely documented).

---

## 13. Final Deliverables Checklist

- [ ] GitHub repo (frontend + backend)
- [ ] README with setup and run steps
- [ ] API endpoint documentation (README table + Swagger)
- [ ] Postman collection
- [ ] `.env.example` (backend and frontend)
- [ ] Screenshots or demo video

---

## 14. Updates (v2) - Decisions After Review

**Code style rule:** simple JavaScript (CommonJS on backend, plain functions and hooks on frontend) that a fresher can explain in an interview. Production-level in behavior (secure, validated, separated), but no clever tricks.

**Kanban dashboard (frontend):**
- Dashboard shows 3 columns: Pending, In Progress, Completed.
- Drag a card to another column -> frontend calls `PUT /api/tasks/:id` with the new `status`. UI updates instantly (optimistic) and rolls back if the API fails.
- Search, priority filter and sort apply to the board cards.
- Pagination lives in the **List view** (toggle next to the view title). Board view loads up to 100 tasks (API max limit) so drag and drop works across all columns.
- New components: `KanbanBoard`, `KanbanColumn`, `KanbanCard`, `ViewToggle`.

**Security additions (backend):**
- `helmet` for safe HTTP headers, `express-rate-limit` on `/api`, JSON body limit of 10kb.
- Joi with `stripUnknown` so extra fields never reach the service.
- CORS only for origins listed in `CLIENT_URL` (comma separated allowed).
- 500 errors never leak stack traces or internal messages to the client.

**Extra backend files added to structure:**
- `src/constants/task.constants.js` (allowed statuses, priorities, sort fields)
- `src/middleware/rateLimiter.js`
- `src/config/env.js`
- `src/utils/AppError.js`, `src/utils/asyncHandler.js`
- `src/validators/task.validator.js`, `src/middleware/validate.js`, `src/middleware/notFound.js`

**Explanation file:** `CODE_EXPLANATION.md` in the project root explains each file (what it does, how it works, why it is placed there) in Hinglish. It is updated after every build step.

**Backend env variables:** `PORT`, `NODE_ENV`, `CLIENT_URL`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `SEED_SAMPLE_DATA`.

**Progress tracker**
- [x] Phase 1/2: Backend core
- [ ] Phase 3: Frontend core + Kanban
- [ ] Phase 4: Bonus polish (search, filters, sort, pagination, dark mode)
- [ ] Phase 5: Swagger, Postman, README, screenshots, GitHub push

---

## 15. UI Design System (Light + Dark Themes)

This section is the final UI decision. If it conflicts with older sections (7 and 14), **this section wins**.

### 15.0 Project name
The product name is **Cleanomatics TMS** (TMS = Task Management System). It is used in the top bar logo, browser tab title, README title, Swagger title and package names (`cleanomatics-tms-backend`, `cleanomatics-tms-frontend`). The reference design's name "Taskly" is NOT used anywhere in our app.

### 15.1 Design sources and the merge rule
- **Design 1 (Taskly, light):** used for the app shell: top bar, icon rail, welcome header, shortcut cards, chart cards with curve tabs, Smart Insights card, List view table.
- **Design 2 (dark Kanban):** used for the Kanban board styling: column headers, task card layout, priority tags, drag lift, empty-column button, and the dark colors.
- **Rule:** Taskly shell + dark-design Kanban board. One layout, two color themes. Only CSS variables change between themes.
- **Not copied** (we have no such data or feature): projects/categories sidebar, avatars, comments, attachments, progress bars, invite member, private toggle, time tracking, AI bots.

### 15.2 Design principles
1. Soft and calm: no harsh borders, very light shadows.
2. One accent color per theme, the rest is neutral gray.
3. Everything rounded: cards 28px, pills fully round.
4. Dark button = main action (New Task). Accent color = data and status only.
5. Hierarchy through size and gray tone, not through many colors.
6. Lots of empty space inside and between cards.
7. Dotted dividers in tables and chart grids (light look).
8. Charts are plain SVG/CSS (no chart library), easier to explain in an interview.

### 15.3 Final layout
```
Top bar    : Logo "Cleanomatics TMS" | "70% of tasks completed" pill | Search | Theme toggle | Avatar
Icon rail  : Home(Board) | List | Stats | ... | Theme toggle (bottom)
Header     : "Welcome, Anni!" + subtitle | dark [+ New Task] | shortcut cards (scroll)
Row 1      : [Due This Week bar chart (tab top-left)] [Smart Insights (tab top-right)]
Row 2      : Task Board (full width): toolbar + 3 Kanban columns, with Board | List toggle
Row 3      : Completed Tasks line chart (week)
```
- **Curve tab:** only the two Row 1 cards have the small curved tab on the top outer corner (`card--tab-left`, `card--tab-right`, made with CSS `::before` / `::after`). Hidden on mobile.
- **Shortcut cards** (replace Invoice Bot / Data Analyzer / Report AI): High Priority, Due Soon, Overdue, In Progress, Completed, No Due Date. Each shows a live count and applies a filter on click.
- **Due This Week** (replaces Automated Task List): bar per day with count of tasks due, today highlighted with accent gradient.
- **Smart Insights** (replaces Optimize Workflow): arrows cycle through insights (urgent tasks, overdue, completed this week). Button "VIEW TASKS" applies the matching filter.
- **Kanban toolbar:** search (debounced), priority filter, sort dropdown, Board | List toggle, and a "Last updated" dot with time.
- **Kanban column header:** status dot + name + count + `+` button (opens the create form with that status preselected).
- **Kanban card:** priority tag + due date chip, title, 2-line description, footer with View / Edit / Delete icons. High priority also shows an orange flame.
- **Drag and drop:** card lifts with a small tilt and shadow while dragging, target column gets a soft highlight, dropping calls `PUT /api/tasks/:id` with the new status.
- **Empty column:** soft card with "Add New Task" button.
- **List view:** Taskly Tasks List style table (name, status badge, priority, deadline, actions) with dotted dividers and pagination.

### 15.4 Typography (both themes)
- Font: **Urbanist** (Google Fonts, weights 400/500/600/700). Inter is NOT used.
- Load: `https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap`, fallback `system-ui, sans-serif`.

| Use | Size | Weight |
|-----|------|--------|
| Page greeting | 48-56px (32px on mobile) | 600 |
| Card title | 28-32px (22px on mobile) | 500 |
| Task title | 18-20px | 500 |
| Body text | 16px | 400 |
| Labels, table headers, subtitles | 14px (muted) | 400 |
| Badges, tags | 13-14px | 500 |
| Big stat number (70%) | 36px | 700 |

Headings use `letter-spacing: -0.02em`.

### 15.5 Light theme tokens (from Taskly design)
| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `linear-gradient(135deg, #e9eaf4, #f4f4fa)` | Page background |
| `--card` | `rgba(247, 247, 251, 0.85)` | Cards |
| `--text` | `#2b2b31` | Headings, task names |
| `--muted` | `#8a8a9a` | Subtitles, labels |
| `--dark` | `#37373d` | Main buttons (+, SET UP style), white text |
| `--accent` | `#6f86f2` | Chart highlight, 70% number, active states |
| `--accent-soft` | `#dce3fb` | In progress badge, chart fill |
| `--success` / `--success-soft` | `#4e9a3f` / `#d8f0d0` | Completed badge |
| `--warning` | `#f5a623` | Flame icon, sparkle |
| `--border` | `#d5d6e3` | Dotted dividers |
| `--shadow` | `0 8px 30px rgba(120,130,190,0.08)` | Cards |

### 15.6 Dark theme tokens (colors measured from the dark reference image)
| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0f1215` | Page background |
| `--rail` / `--panel` | `#181b1b` | Icon rail, side panels |
| `--column` | `#181b1e` | Kanban column header bar |
| `--card` | `#24272a` | Task cards, dashboard cards |
| `--input` | `#111315` | Search box background |
| `--active` | `#2a2d2d` | Active nav item, hover |
| `--text` | `#ffffff` | Titles |
| `--text-soft` | `#e4e6e7` | Card description text |
| `--muted` | `#888a8b` | Breadcrumb, labels |
| `--button` | `#454b4b` (white text) | Main button (Add New Task style) |
| `--chip` | `#3a3d42` | Date chip background |
| `--accent` | `#a8d5ff` | Toggle, chart highlight, active states |
| `--border` | `#2e3236` | Subtle card edge |
| `--shadow` | `0 8px 24px rgba(0,0,0,0.35)` | Cards |

Dark status and decoration colors (from the image):
- Green `#aafe9b` (completed, progress), Yellow `#fdef9f`, Pink-red `#f9999f`, Lavender `#c6b7ea`, Mint `#b7e4cf`, Peach `#e8c998`.

### 15.7 Priority tags and status badges (both themes)
Tag = pastel text on a tinted background (the same color at about 14% opacity).

| Item | Dark theme text | Light theme text |
|------|-----------------|------------------|
| Priority Low | `#b7e4cf` (green) | `#4e9a3f` |
| Priority Medium | `#fdef9f` (yellow) | `#b8860b` |
| Priority High | `#f9999f` (red) | `#d64545` |
| Status Pending | muted gray | muted gray |
| Status In Progress | accent | accent |
| Status Completed | `#aafe9b` | `#4e9a3f` |

### 15.8 Theme switching (simple to explain)
- All colors are CSS variables. `:root` holds the light theme, `[data-theme="dark"]` overrides them.
- `useTheme` hook sets `data-theme` on `<html>`, saves the choice in `localStorage`, and on first visit follows the system setting (`prefers-color-scheme`).
- Toggle (moon/sun) is in the icon rail and the top bar.
- Both themes use the same layout, spacing, radius and font. Light theme is the default look for screenshots; dark theme is better for the board.

### 15.9 Component states and motion
- Hover: cards lift `translateY(-2px)`, buttons darken a little.
- Transitions: 150-200ms ease on color, transform and shadow. Theme change fades colors smoothly.
- Focus: visible 2px accent outline on all inputs and buttons (accessibility).
- Loading: skeleton cards inside columns. Error: card with Retry button. Empty: soft "Add New Task" card.

### 15.10 Responsive rules
- **Desktop (1100px+):** layout as shown above.
- **Tablet (700-1099px):** Row 1 cards stack, board columns scroll horizontally.
- **Mobile (below 700px):** icon rail becomes a bottom bar, curve tabs hidden, shortcut cards and Kanban columns scroll horizontally with scroll-snap, font sizes scale down, buttons at least 44px tall.

### 15.11 Extra frontend components from this design
`TopBar`, `SideRail`, `ShortcutCards`, `StatPill`, `DueThisWeekChart`, `SmartInsights`, `CompletedChart`, `BoardToolbar`, `ViewToggle`, `KanbanBoard`, `KanbanColumn`, `KanbanCard`, `PriorityTag`, `StatusBadge`, `ThemeToggle`.
