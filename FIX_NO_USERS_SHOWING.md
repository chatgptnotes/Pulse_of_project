# 🔧 Fix: "No users found" in User Management

## समस्या (Problem)
User Management page पर **"No users found"** दिख रहा है और permission module UI नहीं दिख रहा।

## कारण (Reason)
`public.users` table में कोई user नहीं है। Permission UI (folder icon 📁) तभी दिखेगा जब users होंगे।

---

## ✅ तुरंत Fix करें (Quick Fix)

### Option 1: Supabase SQL Editor में चलाएं (RECOMMENDED)

1. **Supabase Dashboard खोलें**
   - https://supabase.com/dashboard
   - अपना project select करें

2. **SQL Editor पर जाएं**
   - Left sidebar में "SQL Editor" click करें

3. **ये SQL paste करें और Run करें:**

```sql
-- सभी auth users को public.users में add करें
INSERT INTO public.users (id, email, full_name, role, is_active, created_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)) as full_name,
  'super_admin' as role,
  true as is_active,
  created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin', is_active = true;

-- Verify करें
SELECT id, email, full_name, role FROM public.users;
```

4. **Result check करें:**
   - आपको अपना email दिखना चाहिए
   - Role: `super_admin` होना चाहिए

5. **User Management page refresh करें**
   - http://localhost:5173/users
   - अब आपका user दिखेगा! ✅

---

### Option 2: Specific Email के लिए (If you know your email)

```sql
-- अपना email यहाँ डालें 👇
INSERT INTO public.users (id, email, full_name, role, is_active)
SELECT
  id,
  email,
  'Super Admin',
  'super_admin',
  true
FROM auth.users
WHERE email = 'your-email@example.com'  -- 👈 CHANGE THIS
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin', is_active = true;
```

---

### Option 3: Migration File से (If tables don't exist)

अगर ऊपर के queries fail हो रहे हैं (table doesn't exist error), तो पहले migration चलाएं:

```sql
-- Copy complete content from:
COMPLETE_USER_PERMISSIONS_MIGRATION.sql

-- और Supabase SQL Editor में paste करके Run करें
```

---

## 🎯 Permission UI कैसे दिखेगा

Bootstrap के बाद:

### 1. User Management Page पर
```
┌────────────────────────────────────────────────────────┐
│ Users                                   [+ Add User]   │
├────────────────────────────────────────────────────────┤
│ USER              │ ROLE        │ PROJECTS │ ACTIONS  │
├───────────────────┼─────────────┼──────────┼──────────┤
│ Super Admin       │ super_admin │    0     │ 📁 🗑️  │  ← Folder Icon
│ admin@ex.com      │             │          │          │
└────────────────────────────────────────────────────────┘
```

### 2. Folder Icon 📁 Click करने पर:

```
┌─────────────────────────────────────────────────────┐
│ Assign Projects to User                       [×]   │
├─────────────────────────────────────────────────────┤
│ Permission Presets:                                 │
│ [View Only] [Standard User] [Full Access]          │
│                                                     │
│ Custom Permissions:                                 │
│ ☑ Edit Project Data                                │
│ ☑ View Detailed Plan ⭐                            │
│ ☑ Upload Documents                                 │
│ ☑ Manage Bugs                                      │
│ ☑ Testing Tracker                                  │
│ ☑ Project Documents                                │
│ ☑ View Metrics                                     │
│ ☑ View Timeline                                    │
│                                                     │
│ Select Projects:                                    │
│ ☑ NeuroSense MVP                                   │
│ ☐ E-Commerce Platform                              │
│                                                     │
│          [Cancel]  [Assign Projects]               │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 Test Permission Module

### Step 1: Add a new user (Test के लिए)

1. Click **"+ Add User"** button
2. Fill करें:
   ```
   Full Name: Test User
   Email: test@example.com
   Password: test123
   Role: user  (NOT super_admin)
   ```
3. Click **"Create User"**

### Step 2: Assign Project with Permissions

1. Test user के सामने **folder icon 📁** click करें
2. **"Standard User"** preset select करें
   - यह automatically सब permissions set कर देगा
   - `can_view_detailed_plan = false` होगा
3. एक project select करें (e.g., neurosense-mvp)
4. Click **"Assign Projects"**

### Step 3: Test Permission

1. **Logout** करें (current super admin से)
2. **Login** करें as `test@example.com` / `test123`
3. Project खोलें: http://localhost:5173/pulse-of-project?project=neurosense-mvp
4. **Result:**
   - ✅ Documents upload दिखेगा
   - ✅ Bug tracker दिखेगा
   - ✅ Testing tracker दिखेगा
   - ❌ **"View Detailed Project Plan"** purple button **HIDDEN** होगा ⭐

---

## 🔍 Troubleshooting

### Problem: "relation public.users does not exist"
**Solution:** पहले migration चलाएं:
```bash
# Copy content from COMPLETE_USER_PERMISSIONS_MIGRATION.sql
# Paste in Supabase SQL Editor and Run
```

### Problem: User add हो गया but permission UI नहीं दिख रहा
**Solution:** Browser refresh करें:
```
Ctrl + F5 (hard refresh)
या
Close और reopen browser tab
```

### Problem: Folder icon है but modal नहीं खुल रहा
**Solution:** Console check करें:
```
F12 → Console tab → Errors देखें
```

---

## ✅ Success Checklist

- [ ] Supabase SQL Editor में bootstrap query चलाई
- [ ] User Management page पर user दिख रहा है
- [ ] Folder icon 📁 दिख रहा है
- [ ] Folder icon click करने पर modal खुल रहा है
- [ ] Permission presets दिख रहे हैं (View Only, Standard User, Full Access)
- [ ] 8 permission checkboxes दिख रहे हैं
- [ ] Project select कर सकते हैं
- [ ] "Assign Projects" button काम कर रहा है

---

## 📖 Next Steps

1. **Bootstrap करें** (ऊपर का SQL चलाएं)
2. **Page refresh करें** (User Management)
3. **Test user बनाएं** (+ Add User)
4. **Permissions assign करें** (📁 Folder icon)
5. **Test करें** (उस user से login करके)

---

**अभी try करें! 🚀**

File location: `bootstrap-super-admin.sql` (ऊपर दिए गए SQL के साथ)
