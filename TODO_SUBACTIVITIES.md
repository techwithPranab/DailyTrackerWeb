# Sub-Activities Feature — Implementation TODO

## Overview
When an activity is saved (created **or** updated), a `SubActivity` document is auto-generated
for **each scheduled date** derived from the recurrence pattern. Each `SubActivity` is a
stand-alone record with its own `status`, `notes`, and `completedAt` so individual days can
be tracked independently.

---

## Data Model

### New Model — `SubActivity`
```
parentActivityId  ObjectId → Activity   (required, indexed)
userId            ObjectId → User       (required, indexed)
scheduledDate     Date                  (required, indexed) — midnight UTC of the day
status            'Not Started' | 'In Progress' | 'Completed'   default: 'Not Started'
notes             String                (optional, per-day notes)
completedAt       Date                  (set when status → Completed)
createdAt / updatedAt  timestamps
```
Unique compound index: `{ parentActivityId, scheduledDate }` — prevents duplicates on re-sync.

---

## Backend Tasks

### ✅ B-1  Create `backend/models/SubActivity.js`
- Schema as above
- Compound unique index `{ parentActivityId, scheduledDate }`
- Indexes for `userId` and `parentActivityId`

### ✅ B-2  Create `backend/utils/syncSubActivities.js`
- Helper: `syncSubActivities(activity)` 
  - Iterates `activity.scheduledDates`
  - Uses `bulkWrite` with `updateOne + upsert:true` so existing sub-activities (with their
    user-set status/notes) are **not overwritten** — only *new* dates get inserted
  - Deletes sub-activities whose `scheduledDate` is no longer in `scheduledDates`
    (relevant when recurrence is edited and dates are removed)

### ✅ B-3  Update `backend/controllers/activityController.js`
- `createActivity`: call `syncSubActivities(activity)` after `Activity.create()`
- `updateActivity`: call `syncSubActivities(activity)` after `findByIdAndUpdate()`
- `deleteActivity`: delete all sub-activities where `parentActivityId === activity._id`

### ✅ B-4  Create `backend/controllers/subActivityController.js`
- `getSubActivities(req, res)` — GET `/api/activities/:id/subactivities`
  - Returns all sub-activities for a parent activity, sorted by `scheduledDate` ASC
- `getSubActivitiesByDate(req, res)` — GET `/api/subactivities/date/:date`
  - Returns all sub-activities for `req.user._id` on a specific date
  - Useful for dashboard "Today" section
- `updateSubActivity(req, res)` — PUT `/api/subactivities/:id`
  - Updates `status`, `notes`, optionally sets `completedAt`
  - Only the owning user can update

### ✅ B-5  Create `backend/routes/subActivities.js`
```
GET    /api/activities/:id/subactivities      → getSubActivities
GET    /api/subactivities/date/:date          → getSubActivitiesByDate
PUT    /api/subactivities/:id                 → updateSubActivity
```

### ✅ B-6  Register routes in `backend/server.js`
- Mount sub-activity routes

### ✅ B-7  Update `getTodayActivities` in `activityController.js`
- Also return today's sub-activities via the new date endpoint
  (or keep as is and rely on the new subactivities endpoint — chosen approach)

---

## Frontend Tasks

### ✅ F-1  Create `frontend/src/components/Activities/SubActivityList.js`
- Props: `activityId`, `activityName`
- Fetches `/api/activities/:id/subactivities`
- Renders a table / list of sub-activity rows:
  - Date | Status (dropdown) | Notes (inline edit) | Completed At
- Each row has an inline status toggle (Not Started → In Progress → Completed)
- "Save notes" button per row
- Shows a progress bar: X / total completed

### ✅ F-2  Update `frontend/src/components/Activities/ActivityCard.js`
- Add an "📋 Sub-activities" expand button (accordion)
- When expanded, renders `<SubActivityList activityId={activity._id} />`
- Shows a mini progress chip: e.g. `3/7 done` next to the recurring badge

### ✅ F-3  Update `frontend/src/app/dashboard/page.js` — Today's section
- Fetch `/api/subactivities/date/<today>` in addition to `/api/activities/today`
- Render today's sub-activities as small status cards
- Each card shows: Activity name → today's date → status toggle → notes field

### ✅ F-4  Update `frontend/src/app/activities/page.js`
- Show sub-activity count per parent activity in the table
- Clicking an activity row expands a sub-activity list panel

---

## Key Design Decisions

1. **Non-destructive upsert**: existing sub-activities keep their status/notes when the parent is
   re-saved. Only new dates are inserted; removed dates are deleted.

2. **No cascade on status**: parent activity status is NOT auto-updated when a sub-activity
   changes. The parent remains a "template". Users update each day independently.

3. **Cap**: same 2-year cap as `generateScheduledDates` — prevents unbounded inserts.

4. **Bulk write**: one MongoDB `bulkWrite` call per save — efficient even for 700+ sub-activities.

5. **Auth**: every sub-activity endpoint checks `userId === req.user._id`.

---

## File Change Summary

| File | Action |
|------|--------|
| `backend/models/SubActivity.js` | CREATE |
| `backend/utils/syncSubActivities.js` | CREATE |
| `backend/controllers/subActivityController.js` | CREATE |
| `backend/routes/subActivities.js` | CREATE |
| `backend/controllers/activityController.js` | MODIFY (add sync calls + delete cascade) |
| `backend/server.js` | MODIFY (register new routes) |
| `frontend/src/components/Activities/SubActivityList.js` | CREATE |
| `frontend/src/components/Activities/ActivityCard.js` | MODIFY (add expand panel) |
| `frontend/src/app/dashboard/page.js` | MODIFY (today sub-activities) |
| `frontend/src/app/activities/page.js` | MODIFY (sub-activity count + expand) |
