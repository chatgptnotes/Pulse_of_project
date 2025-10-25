# Supabase Integration Example for BugReport Component

This guide shows how to update your existing BugReport component to use the new Supabase backend.

## Key Changes Required

### 1. Import Supabase Service

```typescript
// Add this import at the top of BugReport.tsx
import supabaseService from '../../../services/supabaseService.js';
```

### 2. Update State Management

Replace the local state with Supabase data:

```typescript
// Replace the useState with this
const [bugs, setBugs] = useState<Bug[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Add useEffect to load data on component mount
useEffect(() => {
  loadBugReports();
}, []);

const loadBugReports = async () => {
  try {
    setLoading(true);
    const reports = await supabaseService.getBugReports('Neuro360');
    setBugs(reports);
    setError(null);
  } catch (err) {
    setError('Failed to load bug reports');
    console.error('Error loading bug reports:', err);
  } finally {
    setLoading(false);
  }
};
```

### 3. Update handleAddBug Function

Replace the local add logic with Supabase integration:

```typescript
const handleAddBug = async () => {
  if (!newBug.snag || !newBug.screen) {
    alert('Please fill in required fields: Screen and Snag description');
    return;
  }

  try {
    setLoading(true);

    const bugData = {
      project_name: 'Neuro360',
      project_version: version,
      module: newBug.module || 'E-commerce',
      screen: newBug.screen || '',
      snag: newBug.snag || '',
      severity: newBug.severity as 'P1' | 'P2' | 'P3' || 'P3',
      comments: newBug.comments || '',
      status: newBug.status as Bug['status'] || 'Open',
      reported_by: 'Current User', // Replace with actual user from auth
      assigned_to: '', // Optional
    };

    const createdBug = await supabaseService.createBugReport(bugData);

    // Reload the bug reports to get updated data
    await loadBugReports();

    // Reset form
    setNewBug({
      date: new Date().toISOString().split('T')[0],
      module: 'E-commerce',
      screen: '',
      snag: '',
      severity: 'P3',
      comments: '',
      status: 'Open',
      testingStatus: 'Pending'
    });
    setShowAddForm(false);

    alert('Bug report created successfully!');
  } catch (error) {
    console.error('Error creating bug report:', error);
    alert('Failed to create bug report. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### 4. Update handleUpdateBug Function

```typescript
const handleUpdateBug = async (bugId: string, updates: Partial<Bug>) => {
  try {
    await supabaseService.updateBugReport(bugId, updates);
    await loadBugReports(); // Reload to get updated data
    setEditingBug(null);
  } catch (error) {
    console.error('Error updating bug report:', error);
    alert('Failed to update bug report. Please try again.');
  }
};
```

### 5. Update handleDeleteBug Function

```typescript
const handleDeleteBug = async (bugId: string) => {
  if (!confirm('Are you sure you want to delete this bug report?')) {
    return;
  }

  try {
    await supabaseService.deleteBugReport(bugId);
    await loadBugReports(); // Reload to get updated data
    alert('Bug report deleted successfully!');
  } catch (error) {
    console.error('Error deleting bug report:', error);
    alert('Failed to delete bug report. Please try again.');
  }
};
```

### 6. Add Image Upload Functionality

```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, bugId?: string) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
    return;
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    alert('File size must be less than 10MB');
    return;
  }

  try {
    if (bugId) {
      // Upload for existing bug
      const imageData = await supabaseService.uploadBugImage(
        bugId,
        'Neuro360',
        file,
        'Current User' // Replace with actual user from auth
      );

      // Update the bug with the new image URL
      await supabaseService.updateBugReport(bugId, {
        image_url: imageData.file_path
      });

      await loadBugReports(); // Reload to see the image
      alert('Image uploaded successfully!');
    } else {
      // For new bug form - store file temporarily
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBug({ ...newBug, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Failed to upload image. Please try again.');
  }
};
```

### 7. Add Loading and Error States

Add loading and error handling to the UI:

```typescript
// Add this inside the component render, after the header
{loading && (
  <div className="p-8 text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
    <p className="mt-2 text-gray-600">Loading bug reports...</p>
  </div>
)}

{error && (
  <div className="p-4 bg-red-50 border-l-4 border-red-400">
    <div className="flex">
      <div className="ml-3">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={loadBugReports}
          className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
        >
          Try again
        </button>
      </div>
    </div>
  </div>
)}
```

### 8. Update Bug Statistics

Replace local statistics with real-time data:

```typescript
// Add this useEffect to load statistics
const [bugStats, setBugStats] = useState({
  total: 0,
  open: 0,
  p1: 0,
  p2: 0,
  p3: 0,
  passed: 0,
  failed: 0
});

useEffect(() => {
  loadBugStatistics();
}, [bugs]);

const loadBugStatistics = async () => {
  try {
    const stats = await supabaseService.getBugStatistics('Neuro360');
    if (stats) {
      setBugStats({
        total: stats.totalBugs,
        open: stats.openBugs,
        p1: stats.severityBreakdown.P1,
        p2: stats.severityBreakdown.P2,
        p3: stats.severityBreakdown.P3,
        passed: 0, // You'll need to implement this based on testing_tracker
        failed: 0  // You'll need to implement this based on testing_tracker
      });
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
};
```

### 9. Add Real-time Updates (Optional)

For real-time updates when other users make changes:

```typescript
useEffect(() => {
  if (!supabaseService.isAvailable()) return;

  // Subscribe to changes on bug_reports table
  const subscription = supabaseService.supabase
    .channel('bug_reports_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bug_reports',
        filter: `project_name=eq.Neuro360`
      },
      (payload) => {
        console.log('Bug report changed:', payload);
        loadBugReports(); // Reload data when changes occur
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Testing the Integration

1. **Deploy the database schema** using the `deploy-migrations.sql` file
2. **Update your BugReport component** with the changes above
3. **Test basic operations**:
   - Create a new bug report
   - Update an existing bug report
   - Delete a bug report
   - Upload an image
4. **Verify data persistence** by refreshing the page

## Environment Variables

Ensure your `.env` file has the correct Supabase configuration:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Error Handling Best Practices

1. **Always wrap Supabase calls in try-catch blocks**
2. **Provide user-friendly error messages**
3. **Log detailed errors to the console for debugging**
4. **Implement retry mechanisms for failed operations**
5. **Validate data before sending to Supabase**

## Security Considerations

1. **Use RLS policies** to control data access
2. **Validate file uploads** (type, size, content)
3. **Sanitize user inputs** before storing
4. **Use proper authentication** instead of hardcoded user names
5. **Implement proper error boundaries** to prevent app crashes

## Next Steps

1. Implement user authentication with Supabase Auth
2. Add testing tracker functionality
3. Create project-specific dashboards
4. Implement advanced filtering and search
5. Add export/import functionality with Supabase data
6. Set up automated backups and monitoring

This integration provides a robust, scalable backend for your bug tracking system while maintaining the existing UI/UX of your component.