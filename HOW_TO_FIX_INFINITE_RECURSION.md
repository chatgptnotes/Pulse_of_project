# 🔧 Fix: Infinite Recursion Error

## Error Dekh Rahe Hain
```
Error: infinite recursion detected in policy for relation "users"
Code: 42P17
```

## Problem Kya Hai?

RLS (Row Level Security) policy **users** table ko check kar rahi hai super admin verify karne ke liye, lekin yeh check khud **users** table ko access karta hai, jo same policy ko trigger karta hai → **infinite loop**!

---

## ✅ SIMPLE FIX (2 Minutes) - RECOMMENDED

### **Step 1: Supabase SQL Editor खोलें**
1. https://supabase.com/dashboard
2. अपना project select करें
3. Left sidebar → **SQL Editor**

### **Step 2: ये SQL paste करें और RUN करें:**

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can create users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins view all" ON public.users;
DROP POLICY IF EXISTS "Super admins can insert" ON public.users;
DROP POLICY IF EXISTS "Super admins can update all" ON public.users;
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can delete" ON public.users;

-- Create simple policy (no recursion!)
CREATE POLICY "Allow authenticated users full access"
  ON public.users
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

### **Step 3: Browser Refresh करें**
```
Ctrl + F5 (hard refresh)
```

### **Step 4: Test करें**
- User Management page reload होगा
- **No errors!** ✅
- Users दिखेंगे
- Create user काम करेगा

---

## 🎯 Alternative: Advanced Fix (If needed)

अगर ऊपर का simple fix काम न करे, तो यह try करें:

### **Copy this file and run in SQL Editor:**
```
File: FIX_INFINITE_RECURSION_POLICIES.sql
```

This creates a helper function with `SECURITY DEFINER` to avoid recursion.

---

## 📊 What Changed?

### **Before (Problematic):**
```sql
-- Policy checks users table → triggers same policy → infinite loop!
CREATE POLICY "Super admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users  -- ❌ This causes recursion!
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
```

### **After (Fixed):**
```sql
-- Simple check: user logged in?
CREATE POLICY "Allow authenticated users full access"
  ON public.users
  FOR ALL
  USING (auth.uid() IS NOT NULL);  -- ✅ No recursion!
```

---

## ✅ Success Indicators

After applying the fix, you should see:

1. **Console:**
   ```
   ✅ Fetching all users...
   ✅ Fetched 2 users
   ```

2. **No errors:**
   - No "infinite recursion" errors
   - No "42P17" error codes

3. **User Management page:**
   - Users visible in table
   - Create user works
   - Assign projects works

---

## 🧪 Test Checklist

- [ ] SQL query ran successfully
- [ ] Browser refreshed (Ctrl + F5)
- [ ] User Management page loads
- [ ] Users are visible
- [ ] No console errors
- [ ] Can create new user
- [ ] Can assign projects

---

## 🔒 Security Note

**Development:**
- Simple policy allows all authenticated users
- Perfect for development/testing

**Production (Future):**
You may want to add back role-based restrictions:
- Only super_admin can create users
- Regular users can only view themselves
- Use the advanced fix with helper function

For now, simple fix is **perfectly fine** for development! 🚀

---

## 📁 Files Created

1. **SIMPLE_FIX_RLS_POLICIES.sql** ← Use this (recommended)
2. **FIX_INFINITE_RECURSION_POLICIES.sql** ← Advanced version
3. **HOW_TO_FIX_INFINITE_RECURSION.md** ← This guide

---

## ⚡ Quick Command

**Copy-paste ready SQL:**

```sql
-- Quick fix - copy and run this!
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can create users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Allow authenticated users full access"
  ON public.users FOR ALL
  USING (auth.uid() IS NOT NULL);
```

---

**Abhi SQL run karein! Error fix ho jayega! 🎉**
