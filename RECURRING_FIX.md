# Recurring Activities Fix - Calendar View

## Problem
Recurring activities were not showing up for all their scheduled days in the calendar. They only appeared on their initial `startTime` date.

## Root Cause
1. **Backend**: Query was only fetching activities where `startTime` fell within the date range, missing recurring activities that started before the range
2. **Frontend**: Calendar was displaying activities based on their `startTime` only, not expanding them to show on all recurrence days

## Solution Implemented

### 1. Backend Changes (`activityController.js`)

Updated the `getActivities` endpoint to fetch recurring activities properly:

```javascript
// Now fetches:
// 1. Non-recurring activities within the date range
// 2. Recurring activities that:
//    - Started on or before the end date
//    - Haven't ended (or end date is after the start of range)
```

**Logic:**
- Non-recurring activities: Must have `startTime` within the requested range
- Recurring activities: Must have:
  - `startTime` ≤ `endDate` (started by the end of range)
  - AND either:
    - No `recurrenceEndDate` (never ends)
    - OR `recurrenceEndDate` ≥ `startDate` (still active in range)

### 2. Frontend Changes (`ActivityCalendar.js`)

Added `expandRecurringActivities()` function that:

1. **For Non-Recurring Activities**: Adds them as-is
2. **For Recurring Activities**: Expands them based on pattern:
   - **Daily**: Shows on every day from start to end
   - **Weekly**: Shows only on selected days of week (recurrenceDays array)
   - **Monthly**: Shows on same date number each month

**Implementation Details:**
```javascript
// Creates multiple instances of recurring activity
// Each instance has:
- Unique _id: `${originalId}_${date}` for React keys
- originalId: Reference to source activity
- startTime: Adjusted to the specific occurrence date
- instanceDate: Date this instance represents
- All other properties: Same as original activity
```

### 3. Visual Indicators

Added visual differentiation for recurring activities:

**Calendar View:**
- Purple badge (instead of blue) on days with recurring activities
- 🔄 icon prefix on activity names in weekly view
- Same in monthly view (desktop only)

**Popup:**
- 🔄 Recurring badge showing pattern type (daily/weekly/monthly)
- Displayed under activity name
- Purple background to match calendar badge

## How It Works Now

### Example: Weekly Recurring Activity

**Setup:**
- Activity: "Morning Exercise"
- Pattern: Weekly
- Days: Monday, Wednesday, Friday
- Start: Jan 1, 2026
- End: No end date

**Result:**
1. Backend fetches this one activity
2. Frontend expands it to show on every Mon, Wed, Fri in the calendar view
3. Each day shows the activity with proper time
4. Click any day → popup shows the activity
5. Purple badge indicates it's recurring

### Example: Daily Recurring Activity

**Setup:**
- Activity: "Take Vitamins"
- Pattern: Daily
- Start: Feb 1, 2026
- End: Feb 29, 2026

**Result:**
1. Backend fetches this one activity
2. Frontend expands it to appear on all days from Feb 1-29
3. Purple badges on all those days
4. Shows on all days in monthly/weekly view

### Example: Monthly Recurring Activity

**Setup:**
- Activity: "Pay Bills"
- Pattern: Monthly
- Start: Jan 15, 2026 (15th of month)
- End: No end date

**Result:**
1. Backend fetches this one activity
2. Frontend shows it on the 15th of every month
3. If viewing February 2026, shows on Feb 15
4. If viewing March 2026, shows on Mar 15

## Visual Design

### Calendar Badges
- **Blue badge** = Regular activities or mix of regular + recurring
- **Purple badge** = Contains at least one recurring activity
- Badge shows total count (e.g., "3 activities")

### Activity Names
- **🔄 icon** = Recurring activity
- Shown in weekly view and activity popup
- Helps user quickly identify recurring items

### Popup Display
```
Morning Exercise                    [High] [Completed]
🔄 weekly                          ← Recurring badge

⏰ 06:00
⏱️ Duration: 30 minutes
🏷️ Category: Fitness
```

## Edge Cases Handled

### 1. Recurrence End Date
- If activity has `recurrenceEndDate`, stops showing after that date
- Backend filters these out if ended before range start
- Frontend respects the end date when expanding

### 2. Activity Started Before Range
- Backend still fetches recurring activities that started earlier
- Frontend only expands within the visible calendar range
- Example: Activity started last year, shows in current month

### 3. Mixed Regular + Recurring
- Both types can appear on same day
- Count includes both
- Popup shows both with appropriate indicators

### 4. Weekly on Specific Days
- Only shows on selected days (recurrenceDays array)
- Days are 0-6 (Sunday-Saturday)
- Skips other days of the week

### 5. Monthly Date Edge Cases
- If start date is 31st, shows on 31st only in months that have 31 days
- Skips months without that date number

## Performance Considerations

### Backend
- Uses MongoDB $or query for efficient fetching
- Indexed on userId and startTime
- Returns all relevant activities in one query

### Frontend
- Expansion happens once when data loads
- Creates in-memory copies for display
- Unique IDs prevent React key conflicts
- No additional API calls needed

## Testing Scenarios

✅ **Daily Recurring**
- Create activity with daily pattern
- Check shows on all days in month
- Verify purple badge appears

✅ **Weekly Recurring**
- Create activity with weekly pattern, select Mon/Wed/Fri
- Verify appears only on those days
- Check other days don't show it

✅ **Monthly Recurring**
- Create activity with monthly pattern on 15th
- View multiple months
- Verify shows on 15th of each month

✅ **With End Date**
- Create recurring activity ending next week
- View next month
- Verify doesn't appear after end date

✅ **Mixed Day**
- Create one regular + one recurring on same day
- Verify count shows "2 activities"
- Popup shows both

✅ **Long Range**
- Create recurring activity from last year
- View current month
- Verify still shows up

## Files Modified

1. **Backend**: `backend/controllers/activityController.js`
   - Updated `getActivities()` query logic
   - Now fetches recurring activities properly

2. **Frontend**: `frontend/src/components/Activities/ActivityCalendar.js`
   - Added `expandRecurringActivities()` function
   - Updated calendar rendering to show purple badges
   - Added 🔄 icons in weekly view
   - Enhanced popup to show recurring badge

## Benefits

✅ Recurring activities now visible on all scheduled days
✅ Visual distinction between regular and recurring
✅ Proper handling of all recurrence patterns
✅ Efficient backend query
✅ No duplicate API calls
✅ Better user experience
✅ Clear visual feedback
