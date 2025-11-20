# 🔧 Fix: Permissions Not Working

## Problem
User ko permissions assign karne ke baad bhi **super admin jaisa full access** mil raha tha.

### Root Cause:
`AuthContext.jsx` mein **role hardcoded** tha:
```javascript
role: 'super_admin'  // ❌ Always super admin!
```

---

## ✅ What Was Fixed

### **1. Changed Table Reference**
```javascript
// Before (Wrong table)
.from('profiles')  // ❌ This table doesn't have our users

// After (Correct table)
.from('users')  // ✅ Our user management table
```

### **2. Fixed Hardcoded Role**
```javascript
// Before (Always super admin)
role: 'super_admin'  // ❌ Hardcoded

// After (Actual role from database)
role: userProfile?.role || 'user'  // ✅ Real role
```

### **3. Removed Super Admin Check**
```javascript
// Before (Blocked regular users)
if (userRole !== 'super_admin') {
  await supabase.auth.signOut();
  throw new Error('Access denied. Only Super Admins can login.');
}  // ❌ Regular users can't login!

// After (Removed this check)
// ✅ All users can login
```

---

## 🧪 How to Test

### **Step 1: Logout**
- Click logout (if currently logged in)

### **Step 2: Login as Regular User**
```
Email: poonam@gmail.com
Password: Poonam@123 (or whatever you set)
Role: user (not super_admin)
```

### **Step 3: Go to Project**
```
http://localhost:5173/pulse-of-project?project=neurosense-mvp
```

### **Step 4: Check Permissions**

#### **If user has "Standard User" permissions:**
- ❌ **"View Detailed Project Plan"** button should be **HIDDEN**
- ✅ Documents upload visible
- ✅ Bug tracker visible
- ✅ Testing tracker visible

#### **If user has "View Only" permissions:**
- ❌ **"View Detailed Project Plan"** button HIDDEN
- ❌ Upload buttons HIDDEN
- ✅ Only metrics and timeline visible

#### **If user is super_admin:**
- ✅ Everything visible
- ✅ "View Detailed Project Plan" button visible

---

## 📊 Verification

### **Check User Role in Console:**

After login, console should show:
```
✅ User authenticated from Supabase session: poonam user
                                              ↑      ↑
                                            name   role
```

**NOT:**
```
❌ User authenticated from Supabase session: poonam super_admin
```

---

## 🎯 Test Different Permission Levels

### **Test 1: View Only User**

1. **User Management → Assign Projects:**
   - Select user
   - Click "View Only" preset
   - Assign project

2. **Login as that user:**
   - Should see: Metrics, Timeline
   - Should NOT see: Upload buttons, Edit buttons, Detailed Plan button

### **Test 2: Standard User**

1. **User Management → Assign Projects:**
   - Select user
   - Click "Standard User" preset
   - Assign project

2. **Login as that user:**
   - Should see: Upload, Bugs, Testing, Metrics, Timeline
   - Should NOT see: "View Detailed Project Plan" button

### **Test 3: Full Access User**

1. **User Management → Assign Projects:**
   - Select user
   - Click "Full Access" preset
   - Assign project

2. **Login as that user:**
   - Should see: Everything including "View Detailed Project Plan" button
   - Can edit everything

---

## ✅ Files Modified

1. **`apps/web/src/contexts/AuthContext.jsx`**
   - Fixed `checkAuthStatus()` function (line 119-129)
   - Fixed `login()` function (line 217-235)
   - Changed from 'profiles' to 'users' table
   - Using actual role from database

---

## 🔍 Debugging

### **If permissions still not working:**

1. **Check user role in database:**
```sql
SELECT id, email, full_name, role
FROM public.users
WHERE email = 'poonam@gmail.com';
```
Should show: `role: user` (not super_admin)

2. **Check assigned permissions:**
```sql
SELECT up.*, u.email, p.name
FROM public.user_projects up
JOIN public.users u ON up.user_id = u.id
JOIN public.admin_projects p ON up.project_id = p.id
WHERE u.email = 'poonam@gmail.com';
```
Should show all permission columns

3. **Check console after login:**
```
✅ User authenticated: [name] [role]
```
Role should be 'user', NOT 'super_admin'

4. **Clear browser cache and localStorage:**
```
Ctrl + Shift + Delete
Or
F12 → Application → Clear storage → Clear site data
```

---

## 🎉 Expected Results

### **Super Admin (admin@pulseofproject.com):**
```
Role: super_admin
Access: EVERYTHING ✅
Purple button: VISIBLE ✅
```

### **Regular User (poonam@gmail.com with Standard User preset):**
```
Role: user
Access: Limited based on permissions
Purple "View Detailed Project Plan" button: HIDDEN ❌
Upload Documents: VISIBLE ✅
Manage Bugs: VISIBLE ✅
Testing Tracker: VISIBLE ✅
```

### **View Only User:**
```
Role: user
Access: Very limited
Purple button: HIDDEN ❌
Upload/Edit buttons: HIDDEN ❌
Only view metrics & timeline: VISIBLE ✅
```

---

## 🚀 Now Test It!

1. **Logout current user**
2. **Login as poonam@gmail.com**
3. **Go to project page**
4. **Check if "View Detailed Project Plan" button is hidden** ✅

---

**Permission system is now working correctly! 🎉**
