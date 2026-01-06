# Database Schema Fixes Applied

## Summary
Fixed all database table and function references across the app to match the actual Supabase schema.

## Changes Made

### 1. SeasonContext.tsx ✅
- Already using correct table: `_seasons`

### 2. RacesScreen.tsx ✅
- Changed from `_races` table to `meets` table
- Updated interface to match meets structure:
  - `race_id` → `meet_id`
  - `race_name` → `meet_name`
  - `race_type` → `meet_course` (25 or 50)
  - Added `min_date` as `race_date`
  - Added `place` as `location`
- Updated filter to use meet_course (25m/50m) instead of race types
- Updated query to filter by `min_date` and `max_date`

### 3. TrainingsScreen.tsx ✅
- Changed from `trainings` table to `sessions` table
- Updated interface to match sessions structure:
  - `training_id` → `sess_id`
  - `training_date` → `date`
  - `training_type` → `type`
  - `duration_minutes` → `volume` (in meters)
  - `notes` → `description`
  - Added `time` field
  - Added `location` field
- Updated query to join with `_groups` table
- Updated rendering to show time, volume (meters), location, and description

### 4. AthletesScreen.tsx ✅
- Already using correct table: `athletes`
- Already using correct function: `get_athletes_details`
- Already using correct table: `_groups`

### 5. AttTrendScreen.tsx ✅
- Already using correct function: `attendance_trend`
- Already using correct tables: `_groups`

## Database Schema Key Points

### Tables (with underscore prefix):
- `_seasons` - Season information
- `_groups` - Training groups
- `_races` - Race/event types (strokes, distances)
- `_categories` - Age categories
- `_status` - Attendance status codes
- `_limits` - Qualification time limits

### Tables (without prefix):
- `athletes` - Athlete information
- `sessions` - Training sessions
- `attendance` - Session attendance records
- `roster` - Links athletes to seasons/categories
- `meets` - Competition meets
- `events` - Individual events within meets
- `results` - Individual race results
- `relay_results` - Relay race results

### Key Functions:
- `get_athletes_details(p_season_id, p_group_id)` - Get athletes with group info
- `attendance_trend(p_season_id, p_group_id, p_type, p_fincode)` - Monthly attendance trends
- `attendance_summary(p_season_id, p_group_id, p_type)` - Overall attendance summary

## Relationships
- sessions → _groups (via sess_group_id)
- attendance → sessions (via sess_id)
- attendance → athletes (via fincode)
- roster → athletes (via fincode)
- roster → _seasons (via season_id)
- roster → _categories (via ros_cat_id)
