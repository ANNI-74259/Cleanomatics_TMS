# HANDOFF - Frontend build status (Cleanomatics TMS)

Read this file FIRST if you are an AI agent continuing this work.
Also read `PLAN.md` (section 15 = final UI design, wins over older sections) and look at the existing files in `frontend/src` before changing anything.

Last updated: 2026-10-28.

## STATUS
All frontend source files are WRITTEN. Nothing has been run or tested yet (no `npm install`, no browser check). The next job is to run it, fix errors, and polish.

## Rules (do not break)
- Product name is **Cleanomatics TMS**. The name "Taskly" must never appear in the app.
- Plain JavaScript (no TypeScript), React 18 + Vite, `react-router-dom` v6, `axios` only inside `src/api/`.
- Plain CSS with variables (no Tailwind, no UI library), plain SVG/CSS charts (no chart library).
- Drag and drop: `@hello-pangea/dnd`. Icons: `lucide-react`. Font: Urbanist.
- Code must be simple enough for a fresher to explain in an interview. Short comments, no clever tricks.
- Do not change the backend. Backend: `http://localhost:5000/api`, frontend: `http://localhost:5173`.

## Backend facts
- `GET /tasks?search&status&priority&sortBy(createdAt|priority|dueDate)&order(asc|desc)&page&limit(max 100)` returns `{ success, data: [...], meta: { total, page, limit, totalPages } }`
- `POST /tasks`, `GET /tasks/:id`, `PUT /tasks/:id` (partial updates allowed), `DELETE /tasks/:id`
- Errors: `{ success:false, message, errors:[{field,message}] }`. Rate limit 300 requests / 15 min.

## What exists in frontend/
- Config: package.json, vite.config.js, index.html, .env.example
- src/main.jsx, src/App.jsx
- src/api: httpClient.js, taskApi.js
- src/hooks: useTasks.js, useDebounce.js, useTheme.js
- src/utils: constants.js, formatDate.js, stats.js, validators.js
- src/styles: variables.css, global.css
- src/context: TaskStatsContext.jsx (all tasks for stats widgets)
- src/components/ui: Button, Spinner, EmptyState, ErrorState, Modal, Toast, PriorityTag, StatusBadge
- src/components/layout: Layout, TopBar, SideRail, ThemeToggle
- src/components/tasks: TaskForm, ConfirmDeleteModal, KanbanBoard, KanbanColumn, KanbanCard, TaskListTable, Pagination
- src/components/dashboard: ShortcutCards, DueThisWeekChart, SmartInsights, CompletedChart, BoardToolbar, ViewToggle
- src/pages: DashboardPage, CreateTaskPage, EditTaskPage, TaskDetailsPage

## TODO
1. In `frontend/`: `npm install`, then `npm run dev` (Node v22.20.0). Backend must be running.
2. Fix any import / runtime / console errors.
3. Go through the testing checklist in `PLAN.md` section 11.
4. Check widths 360px, 768px, 1280px in both themes. Fine-tune the curved tabs on the two Row 1 cards (CSS `::before` in global.css is a first version).
5. Tick Phase 3 and Phase 4 in the progress tracker in `PLAN.md`.
6. Add the frontend files to `CODE_EXPLANATION.md` (written in Hinglish: what, how, why for each file).
7. Phase 5: README, Swagger (`openapi.yaml`), Postman collection, screenshots, GitHub push.

## Known open points
- Greeting name "Anni" is a guess from an earlier chat; it lives in `USER_NAME` in `src/utils/constants.js`.
- Due Soon / Overdue / No Due Date shortcut filters run in the browser (backend does not support them). While one is active the list view loads up to 100 tasks and hides pagination.
- Top bar search sends the user to `/?q=...`; DashboardPage reads `q`.
- Never pass `refetch` directly to an onClick (the click event would be read as the `silent` argument). Use `() => refetch()`.
