# Restart Checklist - Apply All Changes

## 🔴 ACTION REQUIRED: Restart Server

The dashboard code has been updated but the server needs to be restarted to apply changes.

### Quick Restart

```powershell
# Stop the current server (Ctrl+C in its terminal)
# Then start fresh:
.\start_server.ps1
```

---

## ✅ Post-Restart Checklist

After restarting, verify everything works:

### 1. Server Starts Successfully ✅

Look for this output:
```
============================================================
Task Orchestrator Dashboard - Starting
============================================================
Using database: ...
Database pool initialized successfully
Starting WebSocket database watcher...
Dashboard server ready!
============================================================
```

### 2. Open Dashboard ✅

Visit: http://localhost:8888

### 3. Check API Documentation ✅

Visit: http://localhost:8888/docs

Verify these **4 new endpoints** appear:
- ✅ `/api/projects/summary`
- ✅ `/api/projects/{project_id}/overview`
- ✅ `/api/recent-activity`
- ✅ `/api/projects/most-recent`

### 4. Test Project Selector ✅

1. Click the **📁 Select Project** button in header
2. Modal should open with project grid
3. If you have projects, they should display
4. Click a project to select it
5. Modal closes, button updates with project name

### 5. Test Current Project View ✅

After selecting a project:
1. Overview tab should show project header
2. Features grid should appear (if project has features)
3. Recent tasks list should appear (if project has tasks)
4. No console errors

### 6. Check Browser Console ✅

Press F12, check Console tab. Should see:
```
Initializing Task Orchestrator Dashboard v2.0...
Loading view: overview
Dashboard initialized successfully
WebSocket connected
```

**No errors** about:
- ❌ 404 on /api/projects/summary
- ❌ timeline-feed not found

---

## 🐛 Troubleshooting

### Problem: Still Getting 404 Errors

**Cause:** Server not properly restarted

**Solution:**
```powershell
# Force kill all Python processes
Get-Process python | Stop-Process -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start fresh
.\start_server.ps1
```

### Problem: "timeline-feed not found" Error

**Cause:** Browser cache showing old JavaScript

**Solution:**
1. Hard reload: **Ctrl+Shift+R** (Chrome/Edge) or **Ctrl+F5**
2. Or clear cache: F12 → Network tab → Disable cache (checkbox)
3. Reload page

### Problem: Modal Opens But Empty

**Possible causes:**
1. No projects in database (expected)
2. API endpoint not loading

**Check:**
```powershell
# Test endpoint directly
Invoke-RestMethod http://localhost:8888/api/projects/summary
```

Should return:
```json
{"projects": [], "count": 0}  // If no projects
```

Or:
```json
{"projects": [{...}], "count": N}  // If projects exist
```

### Problem: Can't See Project Selector Button

**Cause:** Browser cache

**Solution:**
- Hard reload: **Ctrl+Shift+R**
- Clear cache and reload

### Problem: Server Won't Start

**Error:** "Address already in use"

**Solution:**
```powershell
# Find process using port 8888
Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue

# Kill it
Stop-Process -Id <PID> -Force

# Start server
.\start_server.ps1
```

---

## 🧪 Test the Complete Flow

### Full User Journey Test:

1. **Start:** Dashboard loads with empty state
2. **Click:** 📁 project selector button
3. **View:** Project grid (or "No projects" message)
4. **Select:** Click a project card
5. **See:** Project header with stats
6. **Browse:** Features grid with progress bars
7. **Review:** Tasks list with badges
8. **Switch:** Try other tabs (Kanban, Graph, Analytics)
9. **Return:** Back to Overview - project data still there
10. **Reload:** Refresh page - selection persists!

---

## 📝 Expected Console Output (Clean)

**Good console output:**
```
Initializing Task Orchestrator Dashboard v2.0...
Loading view: overview
Dashboard initialized successfully
WebSocket connected
WebSocket message received: Object
WebSocket connection confirmed: Connected
```

**Bad console output (needs fixing):**
```
❌ Failed to load projects: Error: HTTP 404
❌ Container #timeline-feed not found
❌ Failed to load resource: 404 (Not Found)
```

If you see bad output → **Server needs restart** or **Browser cache needs clearing**

---

## 🎯 Success Criteria

All of these should work:
- ✅ No 404 errors in console
- ✅ Project selector button visible in header
- ✅ Modal opens when button clicked
- ✅ Projects display in grid (or "No projects" message)
- ✅ Selecting project updates view
- ✅ Project data persists on reload
- ✅ No JavaScript errors in console

---

## 📞 Still Having Issues?

1. **Check Files Modified:**
   - `server_v2.py` - Has 4 new endpoints?
   - `dashboard.html` - Has project selector button?
   - `static/js/main.js` - LoadOverviewView simplified?

2. **Verify Files Exist:**
   ```powershell
   Test-Path static/js/utils/app-state.js
   Test-Path static/js/components/project_selector.js
   Test-Path static/js/components/current_project.js
   ```
   All should return **True**

3. **Check Server Logs:**
   Look at terminal where server is running
   - Any Python errors?
   - Does it show the new endpoints being registered?

4. **Test Backend Directly:**
   ```powershell
   # Health check
   Invoke-RestMethod http://localhost:8888/api/health

   # New endpoint
   Invoke-RestMethod http://localhost:8888/api/projects/summary
   ```

---

**After completing this checklist, everything should work perfectly!** 🎉
