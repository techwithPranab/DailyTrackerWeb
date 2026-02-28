# Subscription + Razorpay + Admin System — Implementation TODO

## Status Legend
- ✅ Done  |  🔄 In Progress  |  ❌ Not Started

---

## PHASE 1 — Backend: Razorpay + Subscription Engine

### 1.1 Install packages
- ❌ `npm install razorpay` in backend

### 1.2 Environment Variables (backend/.env)
- ❌ `RAZORPAY_KEY_ID=rzp_test_xxxxx`
- ❌ `RAZORPAY_KEY_SECRET=xxxxx`
- ❌ `RAZORPAY_WEBHOOK_SECRET=xxxxx`

### 1.3 `backend/config/razorpay.js`
- ❌ Export configured Razorpay instance

### 1.4 `backend/models/Subscription.js`  (NEW Model)
Fields:
- `userId` (ref: User)
- `plan` (free | pro | enterprise)
- `status` (created | active | cancelled | expired | failed)
- `razorpayOrderId`
- `razorpayPaymentId`
- `razorpaySubscriptionId`
- `amount` (in paise)
- `currency` (INR)
- `billingCycle` (monthly | yearly)
- `startDate`, `endDate`, `nextBillingDate`
- `invoices[]` sub-doc: { paymentId, amount, paidAt, invoiceUrl }
- `cancelledAt`, `cancelReason`

### 1.5 `backend/controllers/subscriptionController.js`  (NEW)
Functions:
- ❌ `getPlans` — GET /api/subscriptions/plans — return plan details + pricing
- ❌ `createOrder` — POST /api/subscriptions/create-order — create Razorpay order
- ❌ `verifyPayment` — POST /api/subscriptions/verify — verify signature, activate subscription
- ❌ `getMySubscription` — GET /api/subscriptions/me — current user subscription
- ❌ `cancelSubscription` — POST /api/subscriptions/cancel — cancel, set endDate
- ❌ `getInvoices` — GET /api/subscriptions/invoices — list past payments
- ❌ `handleWebhook` — POST /api/subscriptions/webhook — Razorpay webhook handler (payment.captured, subscription.cancelled etc.)

### 1.6 `backend/routes/subscriptions.js`  (NEW)
- ❌ Mount all subscription routes
- ❌ Webhook route must use `express.raw()` middleware for signature verification

### 1.7 `backend/middleware/planLimit.js`  (NEW)
- ❌ `checkPlanLimit(resource)` middleware — checks user's plan before creating activities etc.
- ❌ Free: max 10 activities; Pro: unlimited; Enterprise: unlimited

### 1.8 Update `backend/server.js`
- ❌ Register `/api/subscriptions` route

### 1.9 Update `backend/controllers/adminController.js`
- ❌ Add `getSubscriptions` — paginated list of all subscriptions with filters
- ❌ Add `getRevenueStats` — total revenue, MRR (monthly recurring revenue), plan breakdown
- ❌ Add `adminUpdateSubscription` — manually change a user's plan/status
- ❌ Add `getTransactions` — all Razorpay payment records

### 1.10 Update `backend/routes/admin.js`
- ❌ `GET /admin/subscriptions` → getSubscriptions
- ❌ `GET /admin/revenue` → getRevenueStats
- ❌ `PUT /admin/subscriptions/:id` → adminUpdateSubscription
- ❌ `GET /admin/transactions` → getTransactions

---

## PHASE 2 — Frontend: User-facing Subscription Flow

### 2.1 Install Razorpay script loader
- ❌ Add Razorpay checkout.js script tag in `frontend/src/app/layout.js` (or load dynamically)

### 2.2 `frontend/src/lib/razorpay.js`  (NEW)
- ❌ `loadRazorpay()` — dynamically loads Razorpay script
- ❌ `openCheckout(options)` — opens Razorpay payment modal

### 2.3 Update Pricing Page (`frontend/src/app/pricing/page.js`)
- ❌ If authenticated → CTA buttons call Razorpay checkout instead of /register
- ❌ Show current plan badge for logged-in users
- ❌ "Upgrade" or "Current Plan" state on each card

### 2.4 `frontend/src/app/subscription/page.js`  (NEW — user-facing)
- ❌ Show current plan details
- ❌ Show next billing date, amount
- ❌ Invoice history table (payment ID, date, amount, download link)
- ❌ "Upgrade Plan" button → opens plan selection modal
- ❌ "Cancel Subscription" button with confirmation

### 2.5 `frontend/src/components/Subscription/PlanModal.js`  (NEW)
- ❌ Modal showing Free / Pro / Enterprise cards
- ❌ Click plan → calls createOrder → opens Razorpay checkout → on success calls verifyPayment
- ❌ Shows loading/success/error states

### 2.6 `frontend/src/components/Subscription/SubscriptionBadge.js`  (NEW)
- ❌ Small badge showing current plan (for Navbar or Settings page)

### 2.7 Update `frontend/src/components/Layout/Navbar.js`
- ❌ Show plan badge next to user name
- ❌ Add "Subscription" link in user menu

---

## PHASE 3 — Frontend: Admin Panel Enhancements

### 3.1 `frontend/src/app/admin/subscriptions/page.js`  (ENHANCE existing)
- ❌ Add revenue summary cards (MRR, total revenue, active paying users)
- ❌ Full subscriptions table with razorpayOrderId, payment date, amount
- ❌ Admin can manually override plan
- ❌ Filter by plan, status, date range

### 3.2 `frontend/src/app/admin/transactions/page.js`  (NEW)
- ❌ Table of all Razorpay transactions
- ❌ Columns: user, amount, payment ID, date, status
- ❌ Search by payment ID or user email
- ❌ Export as CSV

### 3.3 `frontend/src/app/admin/revenue/page.js`  (NEW)
- ❌ MRR chart (line chart — month by month)
- ❌ Revenue by plan (bar chart)
- ❌ Total collected, refunds, net revenue cards

### 3.4 `frontend/src/app/admin/users/page.js`  (ENHANCE existing)
- ❌ Add subscription column (plan badge + status)
- ❌ Add "View Subscription" action per user row

### 3.5 `frontend/src/app/admin/dashboard/page.js`  (ENHANCE existing)
- ❌ Add Revenue section: MRR card, total revenue card
- ❌ Add recent transactions list

### 3.6 `frontend/src/components/Admin/AdminLayout.js`  (UPDATE nav)
- ❌ Add "Transactions" nav link
- ❌ Add "Revenue" nav link

---

## PHASE 4 — Plan Enforcement (Feature Gating)

### 4.1 Backend plan limit middleware
- ❌ Apply `checkPlanLimit('activity')` on POST /api/activities
- ❌ Free plan: max 10 activities, 1 reminder, no recurring, no milestones

### 4.2 Frontend plan gate component
- ❌ `frontend/src/components/Subscription/PlanGate.js` — wraps premium features
- ❌ Shows "Upgrade to Pro" prompt if user's plan doesn't allow the action

---

## PHASE 5 — Polish & Production

- ❌ Add Razorpay webhook endpoint security (verify X-Razorpay-Signature)
- ❌ Email notifications on successful payment (extensible — console.log for now)
- ❌ Handle payment failure gracefully with retry UI
- ❌ Build + test (`npm run build`)
- ❌ Git commit + push

---

## Implementation Order (Optimal)
1. Backend: Razorpay config + Subscription model
2. Backend: subscriptionController + routes
3. Backend: Admin subscription/revenue/transactions endpoints
4. Frontend: razorpay.js util + PlanModal component
5. Frontend: /subscription user page
6. Frontend: Pricing page Razorpay integration
7. Frontend: Admin transactions + revenue pages
8. Frontend: Admin layout nav update + dashboard revenue cards
9. Plan enforcement (planLimit middleware)
10. Build + push
