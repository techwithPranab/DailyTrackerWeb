# Home Utility Tracker — Implementation Plan

## Overview
A dedicated module for tracking home appliances/utilities (AC, fridge, water heater, car, etc.)
with scheduled servicing dates, document storage (warranty cards, manuals, invoices) via
Cloudinary, and automatic in-app reminders 1 week before each service is due.

---

## Data Models

### `HomeUtility` (backend/models/HomeUtility.js)
```
name              String   required   e.g. "Samsung Split AC – Bedroom"
category          String   enum: Appliance | Plumbing | Electrical | HVAC | Vehicle | Other
brand             String
modelNumber       String
purchaseDate      Date
warrantyExpiryDate Date
location          String   e.g. "Master Bedroom"
userId            ObjectId → User   required, indexed
notes             String
serviceSchedule   [{
  serviceType     String   e.g. "Annual Service", "Filter Clean"
  scheduledDate   Date     required
  completedDate   Date
  cost            Number
  technician      String
  notes           String
  status          enum: Upcoming | Completed | Missed   default: Upcoming
  reminderSent    Boolean  default: false
}]
documents         [{
  name            String   e.g. "Warranty Card"
  type            enum: Warranty | Manual | Invoice | ServiceReport | Other
  cloudinaryUrl   String
  cloudinaryPublicId String
  uploadedAt      Date
}]
status            enum: Active | Inactive | Disposed   default: Active
```

### No new reminder model needed
The existing `Reminder` model is activity-specific. We'll store `reminderSent` flag on each
`serviceSchedule` entry and rely on a lightweight cron-style endpoint for polling.

---

## Backend Tasks

### B-1  Install dependencies
```bash
cd backend
npm install cloudinary multer multer-storage-cloudinary node-cron
```

### B-2  `backend/models/HomeUtility.js`
Schema as above with compound index `{ userId: 1, 'serviceSchedule.scheduledDate': 1 }`.

### B-3  `backend/config/cloudinary.js`
Configure Cloudinary using env vars:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### B-4  `backend/middleware/upload.js`
Multer + CloudinaryStorage middleware:
- Accepts PDF, JPG, PNG, WEBP
- Max file size 10 MB
- Upload to folder `trakio/home-utilities/:userId`
- Returns `req.file.path` (secure URL) and `req.file.filename` (public_id)

### B-5  `backend/controllers/homeUtilityController.js`
- `createUtility`         POST   /api/utilities
- `getUtilities`          GET    /api/utilities          (with filters: category, status)
- `getUtility`            GET    /api/utilities/:id
- `updateUtility`         PUT    /api/utilities/:id
- `deleteUtility`         DELETE /api/utilities/:id      (also delete Cloudinary docs)
- `addServiceEntry`       POST   /api/utilities/:id/services
- `updateServiceEntry`    PUT    /api/utilities/:id/services/:sid
- `deleteServiceEntry`    DELETE /api/utilities/:id/services/:sid
- `uploadDocument`        POST   /api/utilities/:id/documents    (multipart)
- `deleteDocument`        DELETE /api/utilities/:id/documents/:did  (also purge Cloudinary)
- `getUpcomingServices`   GET    /api/utilities/services/upcoming  (next 30 days)
- `checkAndSendReminders` POST   /api/utilities/reminders/check   (cron endpoint, admin/internal)

### B-6  `backend/routes/utilities.js`
Mount all routes with `protect` middleware.

### B-7  `backend/server.js`
Register `app.use('/api/utilities', require('./routes/utilities'))`.

### B-8  `backend/utils/utilityReminders.js`
Cron job (runs daily at 8 AM) that:
1. Finds all `serviceSchedule` entries where `scheduledDate` is within 7 days, `status: Upcoming`, `reminderSent: false`
2. Sets `reminderSent: true` on each found entry
3. (Extensible) logs to console or sends in-app notification

### B-9  `.env` additions
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Frontend Tasks

### F-1  `frontend/src/app/utilities/page.js`
Main page:
- List all utilities as cards grouped by category
- Filter bar: category, status
- "Add Utility" button → opens modal with form
- Each card shows: name, category, brand, next service date, document count
- Color-coded: red = overdue, orange = due within 7 days, green = ok

### F-2  `frontend/src/app/utilities/[id]/page.js`
Detail page:
- Full utility info (name, brand, model, purchase/warranty dates, location)
- Service history table with add/edit/complete actions
- Documents section: upload button + list of docs with download/delete
- Edit utility button → opens pre-filled form modal

### F-3  `frontend/src/components/HomeUtility/UtilityForm.js`
Create/edit form:
- Name, category, brand, model number
- Purchase date, warranty expiry date
- Location, notes, status

### F-4  `frontend/src/components/HomeUtility/ServiceForm.js`
Add/edit service entry:
- Service type, scheduled date, technician, estimated cost, notes

### F-5  `frontend/src/components/HomeUtility/DocumentUpload.js`
- File picker (PDF/image)
- Document name + type selector
- Upload progress indicator
- Renders list of existing docs with Cloudinary thumbnails/links

### F-6  `frontend/src/components/HomeUtility/UtilityCard.js`
Compact card for the list page showing:
- Emoji icon by category, name, brand
- Next service badge (color coded)
- Docs count
- Quick "Mark Serviced" action

### F-7  Update `frontend/src/components/Layout/Navbar.js`
Add `{ href: '/utilities', label: 'Home', icon: '🏠' }` to `navLinks`.

### F-8  Dashboard integration
Add "Upcoming Services" widget on dashboard — calls `/api/utilities/services/upcoming`
and shows services due in the next 7 days with a warning badge.

---

## API Summary

| Method | Route | Description |
|--------|-------|-------------|
| GET    | /api/utilities | List all utilities |
| POST   | /api/utilities | Create utility |
| GET    | /api/utilities/services/upcoming | Due in next 30 days |
| GET    | /api/utilities/:id | Single utility |
| PUT    | /api/utilities/:id | Update utility |
| DELETE | /api/utilities/:id | Delete utility |
| POST   | /api/utilities/:id/services | Add service entry |
| PUT    | /api/utilities/:id/services/:sid | Update service entry |
| DELETE | /api/utilities/:id/services/:sid | Delete service entry |
| POST   | /api/utilities/:id/documents | Upload document (multipart) |
| DELETE | /api/utilities/:id/documents/:did | Delete document |

---

## File Change Summary

| File | Action |
|------|--------|
| `backend/models/HomeUtility.js` | CREATE |
| `backend/config/cloudinary.js` | CREATE |
| `backend/middleware/upload.js` | CREATE |
| `backend/controllers/homeUtilityController.js` | CREATE |
| `backend/routes/utilities.js` | CREATE |
| `backend/utils/utilityReminders.js` | CREATE |
| `backend/server.js` | MODIFY |
| `backend/.env` | MODIFY (add Cloudinary keys) |
| `backend/package.json` | MODIFY (add deps) |
| `frontend/src/app/utilities/page.js` | CREATE |
| `frontend/src/app/utilities/[id]/page.js` | CREATE |
| `frontend/src/components/HomeUtility/UtilityForm.js` | CREATE |
| `frontend/src/components/HomeUtility/ServiceForm.js` | CREATE |
| `frontend/src/components/HomeUtility/DocumentUpload.js` | CREATE |
| `frontend/src/components/HomeUtility/UtilityCard.js` | CREATE |
| `frontend/src/components/Layout/Navbar.js` | MODIFY |
| `frontend/src/app/dashboard/page.js` | MODIFY |
