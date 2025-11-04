# Testing Guide - Phase 1 Backend

## Prerequisites

Ensure you have the virtual environment set up:

```powershell
# If not already created:
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Quick Testing (Recommended)

### Step 1: Start the Server
```powershell
# Use the quick start script
.\start_server.ps1
```

This will:
- ✓ Check for virtual environment
- ✓ Activate venv automatically
- ✓ Start the server on http://localhost:8888

### Step 2: Run Automated Tests
In a **new terminal window**:
```powershell
.\test_phase1.ps1
```

Expected output:
```
==================================================================
Phase 1 Backend Endpoint Tests
==================================================================

1. Testing server health...
   ✓ Server is healthy
   Database: connected
   Version: 2.0.0

2. Testing /api/projects/summary...
   ✓ Endpoint working
   Found 3 projects
   Sample: Auth System (5 features, 23 tasks)

3. Testing /api/projects/most-recent...
   ✓ Endpoint working
   Most recent: Auth System (status: in-development)

4. Testing /api/recent-activity (all projects)...
   ✓ Endpoint working
   Found 20 recent activities
   Latest: task 'Implement OAuth' in Auth System

5. Testing /api/projects/{id}/overview...
   ✓ Endpoint working
   Project: Auth System
   Stats: 5 features, 23 tasks
          12 dependencies, 45 sections

6. Testing /api/recent-activity (project-scoped)...
   ✓ Endpoint working
   Found 15 activities for this project

==================================================================
All Phase 1 endpoints are implemented and functional!
```

## Manual Testing

### Test Individual Endpoints

With the server running, use these commands in PowerShell:

```powershell
# 1. Health check
Invoke-RestMethod -Uri "http://localhost:8888/api/health" | ConvertTo-Json

# 2. Project summary
Invoke-RestMethod -Uri "http://localhost:8888/api/projects/summary" | ConvertTo-Json

# 3. Most recent project
Invoke-RestMethod -Uri "http://localhost:8888/api/projects/most-recent" | ConvertTo-Json

# 4. Recent activity (all)
Invoke-RestMethod -Uri "http://localhost:8888/api/recent-activity?limit=10" | ConvertTo-Json

# 5. Project overview (replace {id} with actual project ID)
Invoke-RestMethod -Uri "http://localhost:8888/api/projects/{id}/overview" | ConvertTo-Json

# 6. Recent activity (project-scoped)
Invoke-RestMethod -Uri "http://localhost:8888/api/recent-activity?project_id={id}&limit=10" | ConvertTo-Json
```

### Interactive API Testing

Visit the FastAPI auto-generated docs:
```
http://localhost:8888/docs
```

Features:
- 📖 Complete API documentation
- ▶️ "Try it out" buttons for each endpoint
- 📝 Request/response examples
- 🔍 Schema visualization

## Testing Scenarios

### Scenario 1: Empty Database
**Expected behavior:**
- `/api/projects/summary` returns `{"projects": [], "count": 0}`
- `/api/projects/most-recent` returns 404
- `/api/recent-activity` returns `{"activities": [], "count": 0}`

### Scenario 2: Single Project
**Expected behavior:**
- `/api/projects/summary` returns 1 project with counts
- `/api/projects/most-recent` returns that project
- `/api/projects/{id}/overview` returns full details
- `/api/recent-activity` shows activities from that project

### Scenario 3: Multiple Projects
**Expected behavior:**
- `/api/projects/summary` lists all projects sorted by modified_at
- `/api/projects/most-recent` returns the most recently modified
- `/api/recent-activity` without filter shows mixed activities
- `/api/recent-activity?project_id=X` filters to one project

## Troubleshooting

### Issue: "Server is not running"
**Solution:**
```powershell
# Check if something is already using port 8888
Get-NetTCPConnection -LocalPort 8888

# If needed, kill the process and restart
Stop-Process -Id <PID>
.\start_server.ps1
```

### Issue: "Module not found"
**Solution:**
```powershell
# Ensure venv is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "Database not found"
**Solution:**
Check the database path in server logs:
```
Using database: E:\MyDevTools\tariffs\tools\task-orchestrator-dashboard\data\tasks.db
```

If missing, the database will be created automatically on first run.

### Issue: Test script shows 404 errors
**Cause:** No data in database yet

**Expected:** This is normal for empty databases. The endpoints are working correctly.

## Validation Checklist

Before proceeding to Phase 3, verify:

- [ ] Server starts without errors
- [ ] All 4 new endpoints respond (even if with empty data)
- [ ] `/api/health` returns `"status": "healthy"`
- [ ] API docs load at `/docs`
- [ ] No Python syntax errors
- [ ] Endpoints handle UUID formats correctly
- [ ] Project filtering works in recent-activity
- [ ] Response format matches documentation

## Next Steps

Once all tests pass:

1. **Review** the API docs at http://localhost:8888/docs
2. **Proceed** to Phase 3: Project Selector Modal (Frontend)
3. **Reference** `ENHANCEMENTS_PLAN.md` for Phase 3 details

## Need Help?

Check these files:
- `PHASE1_COMPLETE.md` - Detailed API documentation
- `README_PHASE1.md` - Architecture overview
- `ENHANCEMENTS_PLAN.md` - Complete implementation plan
