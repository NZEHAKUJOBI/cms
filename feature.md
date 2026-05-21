roduction-Grade Improvement Plan — PSCMS
FONT — Google Minimalist Recommendation
Current font: Inter — a solid choice but slightly generic.

Recommended: Switch to Geist (modern, minimal, purpose-built for dashboards) or keep Inter but pair with:

Purpose	Font	Why
UI / Body	Inter	Already installed, clean
Headings / Brand	DM Sans	Geometric, minimal, great at large sizes
Monospace (batch numbers, codes)	JetBrains Mono	Clear for BatchNo, OrderNumber, FacilityCode
Add to index.html:

Then in tailwind.config.js:

Apply font-display to all page titles (h1, h2, card headers) and font-mono to OrderNumber, BatchNumber, FacilityCode.

CRITICAL — Security (Fix Before Deploy)
#	File	Issue	Fix
1	appsettings.json	JWT secret & DB password hardcoded	Move to environment variables / Azure Key Vault / .env
2	Program.cs	AllowAnyOrigin() CORS	Replace with WithOrigins("https://your-domain.com")
3	Program.cs	db.Database.Migrate() on every startup	Move to a startup health check or deployment pipeline step
4	AuthController.cs	/register is open	Guard with [Authorize(Roles = "Admin")] or remove it
5	lib/api.ts	JWT in localStorage (XSS-stealable)	Prefer httpOnly cookie via server Set-Cookie; or add CSP header
6	Backend — all controllers	No DTO validation attributes ([Required], [MaxLength], etc.)	Add DataAnnotations or FluentValidation
7	Backend	No rate limiting	Add app.UseRateLimiter() (.NET 7+) on /login at minimum
8	Backend	No global exception middleware	Add app.UseExceptionHandler("/error") + structured error responses
HIGH — Backend Quality
Area	Current State	Needed
Logging	None visible	Add Serilog with structured JSON logs (file + console sink)
Health checks	None	Add app.MapHealthChecks("/health") for DB + app status
Pagination validation	None	Validate page >= 1, pageSize <= 100 in all paginated endpoints
Migrations in prod	Auto-run on start	Use dotnet ef database update in CI/CD pipeline, remove from Program.cs
Refresh tokens	None (480 min JWT)	Add a RefreshToken table + /auth/refresh endpoint; reduce JWT to 15–60 min
Soft deletes	No DeletedAt pattern	Add IsDeleted + DeletedAt columns to all entities; filter in queries
Unit of Work	Services use DbContext directly	Not critical now, but wrap mutations in transaction scope where needed (e.g. Order + Stock)
API versioning	None	Add /api/v1/ prefix now before clients exist
HIGH — Frontend Quality
Area	Current State	Fix
Error Boundaries	None	Wrap each page in <ErrorBoundary> with graceful fallback UI
Loading skeletons	Likely null / blank	Add <Skeleton /> shimmer components for all data tables and stat cards
Toast notifications	Not visible	Add Sonner or React Hot Toast for success/error feedback on mutations
Optimistic UI	None	Use TanStack Query's onMutate for instant feedback (stock adjust, status change)
Confirmation dialogs	None on deletes	Add <ConfirmModal> before destructive actions (delete product, reject order)
Empty states	Blank tables	Add empty state illustrations/messages for tables with no data
Token expiry UX	Silent 401 redirect	Show "Session expired" toast before redirect; preserve intended URL
Form validation	Client-side only	Add React Hook Form + Zod for type-safe validation
MEDIUM — UX / UI Improvements
Area	Recommendation
Breadcrumbs	Layout has no breadcrumbs — add them to all inner pages (Dashboard > Orders > #ORD-001)
Table column sorting	Tables have no sortable columns — add click-to-sort on Name, Date, Status
Date format consistency	Mix of raw ISO strings and locale — standardize with date-fns format()
Expiry date highlighting	Inventory table shows expiry date but no color-coding — highlight amber (<90 days), red (<30 days)
Mobile bottom nav	Only 4 items in bottom nav — ensure badge counts (e.g. pending orders) show on nav
Sidebar active state	Verify active route highlight works correctly on all nested routes
Accessible focus states	Confirm all buttons/inputs have visible :focus-visible rings (keyboard nav)
Print / PDF export	Reports page has Excel export — add a print-friendly view
Dashboard KPI drill-down	Stat cards are static — clicking "Pending Orders" should navigate to filtered orders list
Responsive tables	Wide tables collapse badly on mobile — add horizontal scroll with sticky first column
MEDIUM — Features Missing for Production
Feature	Benefit
CSV/Excel bulk import for inventory	Pharmacists can upload initial stock instead of entering row-by-row
Audit trail UI	StockLedger is tracked in DB but there's no UI — add a "View History" modal per product per facility
Notification center	In-app notifications for order approvals, low stock alerts, shipment updates
Password reset flow	There's only change-password (requires current password) — add email-based reset
User activity log	Track LastLoginAt, LastActionAt per user
Facility map view	Region and District are stored — could render on a simple map
Demand forecasting	Use weekly snapshots to project next period's need (even a simple moving average)
LOW — Developer Experience
Item	Action
vite.config.ts API URL	Move target: 'http://localhost:5241' to .env.local as VITE_API_URL
No .env.example	Create one with all required env vars documented
No CI/CD	Add GitHub Actions: build client → build server → run EF migrations → deploy
No docker-compose.yml	Add one for local dev (postgres + api + vite)
ESLint/Prettier	Verify config is enforced in CI — currently no linting step in build
No backend tests	Add at minimum integration tests for Auth + Inventory endpoints using WebApplicationFactory
Quick-Win Summary (Do First)
Font — Add DM Sans for headings, JetBrains Mono for codes in index.html + tailwind config
CORS — Lock to your actual domain in Program.cs
Secrets — Move JWT key and DB password to environment variables
Toasts — Add Sonner for all mutation feedback (1 hour of work, massive UX improvement)
Error Boundaries — Wrap pages so one failed API call doesn't blank the whole screen
Confirmation dialogs — Before any delete or reject action
Skeleton loaders — Replace blank loading states with shimmer placeholders
Expiry date color coding — In the inventory table, red/amber highlights
Want me to start implementing any of these? I can tackle them in priority order.