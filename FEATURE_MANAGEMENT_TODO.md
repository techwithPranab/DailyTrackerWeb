# Feature Management Framework — Detailed TODO

## Overview
A subscription-aware feature management system that enforces plan limits on both
the **backend** (API middleware) and **frontend** (UI hooks + components), with a
single source of truth (`PLAN_FEATURES` config) shared across the stack.

---

## PHASE 1 — Backend: Centralised Plan Config + Middleware Expansion
**Goal:** One config file defines every plan's limits; middleware enforces them on every route.

### 1.1 `backend/config/planFeatures.js` — SINGLE SOURCE OF TRUTH
- [ ] Define `PLAN_FEATURES` object for `free`, `pro`, `enterprise`
  - `activities`    : max count (10 / -1 / -1)
  - `milestones`    : max count (0 / -1 / -1)  ← Free = no milestones
  - `reminders`     : max per activity (1 / -1 / -1)
  - `utilities`     : max count (2 / 20 / -1)
  - `recurringActivities` : bool (false / true / true)
  - `subActivities` : bool (false / true / true)
  - `documentUpload`: bool (false / true / true)
  - `analytics`     : bool (false / true / true)
  - `dataExport`    : bool (false / true / true)
  - `teamWorkspace` : bool (false / false / true)
- [ ] Export helper `getPlanFeatures(plan)` and `isFeatureAllowed(plan, feature)`
- [ ] Export `PLAN_RANK = { free:0, pro:1, enterprise:2 }` for comparison

### 1.2 `backend/middleware/planLimit.js` — EXPAND
- [ ] Replace hard-coded PLAN_LIMITS with import from `planFeatures.js`
- [ ] Add `checkPlanLimit('milestone')` — enforces milestone count
- [ ] Add `checkPlanLimit('reminder')` — enforces reminders per activity
- [ ] Add `checkPlanLimit('utility')` — enforces utility count
- [ ] Add `checkFeatureAccess('recurring')` — blocks if isRecurring=true on Free
- [ ] Add `checkFeatureAccess('documentUpload')` — blocks document upload on Free
- [ ] Add `checkFeatureAccess('analytics')` — blocks analytics endpoint on Free
- [ ] Add `checkFeatureAccess('dataExport')` — blocks CSV export on Free

### 1.3 Apply middleware to routes
- [ ] `POST /api/milestones`     → `checkPlanLimit('milestone')`
- [ ] `POST /api/reminders`      → `checkPlanLimit('reminder')`
- [ ] `POST /api/utilities`      → `checkPlanLimit('utility')`
- [ ] `POST /api/utilities/:id/documents` → `checkFeatureAccess('documentUpload')`
- [ ] `POST /api/activities`     → add `checkFeatureAccess('recurring')` (if req.body.isRecurring)
- [ ] `GET  /api/progress`       → `checkFeatureAccess('analytics')`

### 1.4 `GET /api/subscriptions/features` — NEW endpoint
- [ ] Returns the full feature set for the current user's plan
- [ ] Used by frontend to drive UI state without hard-coding plan names in components

---

## PHASE 2 — Frontend: `usePlanFeatures` Hook
**Goal:** One hook that gives any component instant access to what the current user can/can't do.

### 2.1 `frontend/src/lib/planFeatures.js` — FRONTEND CONFIG (mirrors backend)
- [ ] Same `PLAN_FEATURES` constant (client-safe, no DB calls)
- [ ] `getPlanFeatures(plan)` helper
- [ ] `isFeatureAllowed(plan, feature)` helper
- [ ] `PLAN_LIMITS` for display (e.g. "10 activities on Free")

### 2.2 `frontend/src/hooks/usePlanFeatures.js`
- [ ] `const features = usePlanFeatures()`
- [ ] Reads `user.subscription.plan` from `AuthContext`
- [ ] Returns:
  ```js
  {
    plan,           // 'free' | 'pro' | 'enterprise'
    can,            // { activities, milestones, reminders, utilities, recurring, ... }
    limits,         // { activities: 10, utilities: 2, ... } or -1
    isAllowed(feature),   // boolean
    requiresPlan(feature), // 'pro' | 'enterprise' | null
  }
  ```
- [ ] Memoised with `useMemo`

---

## PHASE 3 — Frontend: Smarter UI Enforcement

### 3.1 `PlanGate` component — ENHANCE existing
- [ ] Add `feature` prop (e.g. `feature="recurring"`) as alternative to `requiredPlan`
- [ ] Auto-resolve required plan from `planFeatures.js` config
- [ ] Add `showUsage` prop — shows "7 / 10 activities used" progress bar for count-limited features
- [ ] Export `usePlanGate(feature)` hook variant

### 3.2 `PlanUsageBar` — NEW component
- [ ] Props: `feature` (activity / milestone / utility / reminder), `current`, `max`
- [ ] Renders a progress bar: green → yellow (>70%) → red (>90%)
- [ ] Shows "X / Y used · Upgrade for unlimited" when near/at limit
- [ ] Used on Activities, Milestones, Utilities pages

### 3.3 `UpgradeBanner` — NEW component
- [ ] Dismissible top banner shown when user hits 80%+ of a limit
- [ ] "You've used 8/10 activities — upgrade to Pro for unlimited"
- [ ] CTA opens `PlanModal`
- [ ] Persisted in sessionStorage so it doesn't re-appear immediately

---

## PHASE 4 — Page-level Integration

### 4.1 Activities page (`/activities`)
- [ ] Show `PlanUsageBar` for activity count (Free only)
- [ ] "Add Activity" button disabled + tooltip when at limit
- [ ] Recurring toggle in `ActivityForm` wrapped with `PlanGate feature="recurring"`
- [ ] `UpgradeBanner` when ≥80% of activity limit used

### 4.2 Milestones page (`/milestones`)
- [ ] Entire page wrapped in `PlanGate requiredPlan="pro"` — Free users see upgrade prompt
- [ ] Show `PlanUsageBar` for milestone count (Pro: unlimited, shown as count only)

### 4.3 Reminders page (`/reminders`)
- [ ] "Add Reminder" checks if activity already has a reminder (Free limit = 1/activity)
- [ ] Show inline message: "Free plan: 1 reminder per activity"
- [ ] Multi-reminder input gated behind Pro

### 4.4 Utilities page (`/utilities`)
- [ ] Show `PlanUsageBar` for utility count (Free: 2, Pro: 20, Enterprise: unlimited)
- [ ] "Add Utility" disabled at limit with upgrade prompt
- [ ] Document upload button on utility detail gated behind Pro (`PlanGate feature="documentUpload"`)

### 4.5 Analytics / Progress charts
- [ ] `ProgressChart` and any analytics section wrapped with `PlanGate feature="analytics"`
- [ ] Free users see blurred chart with upgrade overlay

### 4.6 Navbar / Dashboard usage indicator
- [ ] Dashboard shows a mini "Plan Usage" widget when user is on Free
  - Activity count bar, Utility count bar
  - "Upgrade" link below

---

## PHASE 5 — Backend Error Handling → Frontend Toast

### 5.1 `frontend/src/lib/axios.js` — intercept 403 `PLAN_LIMIT_REACHED`
- [ ] Add response interceptor
- [ ] On `{ code: 'PLAN_LIMIT_REACHED' }` — show toast with upgrade prompt
- [ ] On `{ code: 'FEATURE_NOT_ALLOWED' }` — show toast with plan name required

---

## PHASE 6 — Test & Push
- [ ] `npm run build` — 0 errors
- [ ] Manual smoke test: Free user hitting each limit gets correct block
- [ ] `git commit` + `git push`

---

## Implementation Order
1. `backend/config/planFeatures.js`
2. Expand `backend/middleware/planLimit.js`
3. Apply middleware to all routes
4. Add `GET /api/subscriptions/features` endpoint
5. `frontend/src/lib/planFeatures.js`
6. `frontend/src/hooks/usePlanFeatures.js`
7. Enhance `PlanGate`
8. `PlanUsageBar` component
9. `UpgradeBanner` component
10. Axios 403 interceptor
11. Page integrations (Activities → Milestones → Reminders → Utilities → Analytics)
12. Dashboard usage widget
13. Build + Push
