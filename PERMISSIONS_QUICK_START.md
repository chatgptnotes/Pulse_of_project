# 🚀 Granular Permissions - Quick Start (3 Minutes)

## Step 1: Run Migration (1 min)
```sql
-- Open Supabase Dashboard → SQL Editor
-- Run PERMISSIONS_MIGRATION.sql
```

## Step 2: Assign Permissions (2 min)

### Option A: Use Presets (Recommended)
1. Go to `/users`
2. Click **folder icon** on user
3. Click preset button:
   - **View Only** = Just view metrics/timeline
   - **Standard User** = Can upload docs, manage bugs, testing
   - **Full Access** = Everything enabled
4. Select projects
5. Click **"Assign Projects"**

### Option B: Custom Permissions
1. Go to `/users`
2. Click **folder icon** on user
3. Check/uncheck specific permissions:
   - ✅ **View Detailed Plan** - Hides the purple "View Detailed Project Plan" button
   - ✅ **Upload Documents**
   - ✅ **Manage Bugs**
   - ✅ **Testing Tracker**
   - ✅ **Project Documents**
   - ✅ **Metrics**
   - ✅ **Timeline**
4. Select projects
5. Click **"Assign Projects"**

---

## 📊 Permission Presets

### View Only (Clients)
```
✅ View Metrics
✅ View Timeline
❌ Everything else
```

### Standard User (Team Members)
```
✅ Upload Documents
✅ Manage Bugs
✅ Testing Tracker
✅ Project Documents
✅ View Metrics
✅ View Timeline
❌ View Detailed Plan (HIDDEN)
❌ Edit Project Data
```

### Full Access (Managers)
```
✅ ALL permissions enabled
```

---

## 🎯 Key Permission

### **View Detailed Project Plan**
This controls the purple button that lets users edit milestones and tasks:

**ENABLED** (✅):
```
┌──────────────────────────────────────────┐
│ 📝 View Detailed Project Plan         →  │
│ Edit milestones, tasks, dates...         │
└──────────────────────────────────────────┘
Button is visible ✅
```

**DISABLED** (❌):
```
Button is HIDDEN ❌
User cannot access detailed editing
```

---

## ✅ Done!

**Test it**:
1. Create test user
2. Use "Standard User" preset
3. Assign project
4. Login as that user
5. Should NOT see "View Detailed Project Plan" button ✅

---

## 📖 Full Guide
For detailed docs, see: `GRANULAR_PERMISSIONS_GUIDE.md`
