# Recurring Activities & Weekly Tracker Feature

## Overview
The Family Activity Tracker now supports **recurring activities** and includes a **weekly activity tracker** where users can mark activities as completed and view weekly status.

## Features Implemented

### 1. Recurring Activities

Activities can now be set to recur on:
- **Daily**: Activity repeats every day
- **Weekly**: Activity repeats on selected days of the week (e.g., Monday, Wednesday, Friday)
- **Monthly**: Activity repeats on the same date every month

#### Key Features:
- ✅ Optional end date for recurring activities
- ✅ Flexible day selection for weekly recurrence
- ✅ Independent completion tracking for each occurrence
- ✅ Visual indicators showing recurring status

### 2. Weekly Activity Table

A comprehensive weekly view displaying:
- **7-day calendar grid** with all scheduled activities
- **One-click completion toggle** for each activity occurrence
- **Week navigation** (Previous/Next/Current Week)
- **Completion statistics** showing progress
- **Priority and category indicators**
- **Today's date highlighting**

#### Features:
- ✅ Mark activities as complete/incomplete per day
- ✅ Visual completion status (✓ for completed, ○ for pending)
- ✅ Weekly completion rate calculation
- ✅ Color-coded priorities and categories
- ✅ Emoji indicators for different activity types

## Database Schema Changes

### Activity Model Updates

```javascript
{
  // Existing fields...
  
  // New recurring fields
  isRecurring: Boolean,              // Whether activity repeats
  recurrencePattern: String,         // 'daily', 'weekly', or 'monthly'
  recurrenceDays: [Number],          // For weekly: [0=Sun, 1=Mon, ..., 6=Sat]
  recurrenceEndDate: Date,           // When recurring stops (optional)
  parentActivityId: ObjectId,        // Reference to parent recurring activity
  
  // Weekly completion tracking
  weeklyCompletions: [{
    date: Date,                      // The date this was completed
    completed: Boolean,              // Whether it was completed
    completedAt: Date               // When it was marked complete
  }]
}
```

## API Endpoints

### New Endpoints

#### 1. Get Weekly Activities
```
GET /api/activities/weekly?weekStart=2026-02-17
```
Returns a 7-day schedule with all activities (recurring and one-time) for that week.

**Response:**
```json
{
  "success": true,
  "data": {
    "weekStart": "2026-02-17T00:00:00.000Z",
    "weekEnd": "2026-02-23T23:59:59.999Z",
    "schedule": [
      {
        "date": "2026-02-17T00:00:00.000Z",
        "dayName": "Monday",
        "activities": [
          {
            "_id": "...",
            "name": "Morning Exercise",
            "isRecurring": true,
            "recurrencePattern": "daily",
            "completionStatus": {
              "completed": true,
              "completedAt": "2026-02-17T07:30:00.000Z"
            }
          }
        ]
      }
      // ... more days
    ]
  }
}
```

#### 2. Mark Activity Complete
```
POST /api/activities/:id/complete
Body: { "date": "2026-02-17" }
```
Marks an activity as completed for a specific date (for recurring activities) or updates status to "Completed" (for one-time activities).

#### 3. Unmark Activity Complete
```
POST /api/activities/:id/uncomplete
Body: { "date": "2026-02-17" }
```
Marks an activity as incomplete for a specific date.

## Frontend Components

### 1. WeeklyActivityTable Component
**Location:** `/frontend/src/components/Activities/WeeklyActivityTable.js`

A comprehensive table showing:
- 7-day week view with date headers
- Activity rows with completion checkboxes
- Week navigation controls
- Completion statistics

**Props:** None (fetches data internally)

**Usage:**
```jsx
import WeeklyActivityTable from '@/components/Activities/WeeklyActivityTable';

<WeeklyActivityTable />
```

### 2. Updated ActivityForm Component
**Location:** `/frontend/src/components/Activities/ActivityForm.js`

Now includes:
- Recurring activity checkbox
- Recurrence pattern selector (Daily/Weekly/Monthly)
- Day-of-week selector for weekly recurrence
- Optional end date picker

## How to Use

### Creating a Recurring Activity

1. Navigate to **Activities** page
2. Click **"+ New Activity"**
3. Fill in activity details
4. Check **"🔄 Make this a recurring activity"**
5. Select recurrence pattern:
   - **Daily**: Activity occurs every day
   - **Weekly**: Select specific days (Mon, Tue, etc.)
   - **Monthly**: Occurs on same date each month
6. Optionally set an end date
7. Click **"Create Activity"**

### Using the Weekly Tracker

1. Go to **Dashboard** page
2. Scroll to **"Weekly Activity Tracker"** section
3. View all activities scheduled for the week
4. Click the **○** button to mark an activity complete (turns to **✓**)
5. Click the **✓** button to unmark as complete
6. Use navigation buttons to view different weeks:
   - **← Previous**: Go to previous week
   - **This Week**: Return to current week
   - **Next →**: Go to next week

### Weekly Tracker Features

- **Today's Column**: Highlighted in blue
- **Completion Buttons**: 
  - Gray circle (○) = Not completed
  - Green checkmark (✓) = Completed
- **Priority Badges**: 
  - 🔴 High (red)
  - 🟡 Medium (yellow)
  - 🟢 Low (green)
- **Category Emojis**:
  - 🧹 Chores
  - 📚 School
  - 💪 Fitness
  - 🎨 Hobby
  - 📋 Other
- **Recurring Indicator**: 🔄 badge shows recurrence pattern

### Statistics Displayed

- **Total Activities**: Total number of activity occurrences in the week
- **Completed**: Number of completed occurrences
- **Completion Rate**: Percentage of completed activities

## Examples

### Example 1: Daily Morning Routine
```
Activity: "Morning Exercise"
Recurrence: Daily
Start Time: 07:00 AM
Duration: 30 minutes
End Date: None

Result: Appears every day in the weekly tracker
```

### Example 2: Weekend Chores
```
Activity: "Clean Room"
Recurrence: Weekly
Days: Saturday, Sunday
Start Time: 10:00 AM
Duration: 60 minutes
End Date: None

Result: Appears only on Saturdays and Sundays
```

### Example 3: Monthly Review
```
Activity: "Progress Review"
Recurrence: Monthly
Start Date: 1st of month
Duration: 45 minutes
End Date: None

Result: Appears on the 1st of every month
```

## Technical Details

### Date Handling
- Uses `date-fns` library for date manipulation
- Week starts on Monday (configurable)
- All dates normalized to start of day for accurate comparisons
- Timezone-aware date handling

### Completion Tracking
- **One-time activities**: Updates `status` field to "Completed"
- **Recurring activities**: Adds entry to `weeklyCompletions` array
- Each completion tracks the specific date and timestamp
- Historical completion data preserved

### Performance Optimizations
- Efficient database queries with compound indexes
- Client-side caching of weekly data
- Optimistic UI updates for instant feedback
- Batch loading of weekly activities

## Future Enhancements

Potential features for future versions:
- [ ] Bi-weekly recurrence pattern
- [ ] Custom recurrence intervals (every N days)
- [ ] Recurring activity templates
- [ ] Completion streaks tracking
- [ ] Email/push notifications for recurring activities
- [ ] Bulk operations on recurring activities
- [ ] Calendar view integration
- [ ] Export weekly reports

## Troubleshooting

### Activity not appearing in weekly view
- Check that the activity's start date is not after the week
- Verify recurrence end date hasn't passed
- For weekly recurrence, ensure days are selected

### Completion not saving
- Ensure you're authorized to update the activity
- Check that the activity exists and is accessible
- Verify date format is correct (ISO 8601)

### Week navigation issues
- Clear browser cache if week doesn't update
- Check that backend date-fns package is installed
- Verify timezone settings are correct

## Support

For issues or questions:
1. Check console for error messages
2. Verify backend server is running
3. Check MongoDB connection
4. Review API endpoint responses in Network tab

---

**Version**: 2.0.0  
**Last Updated**: February 22, 2026  
**Author**: Family Activity Tracker Team
