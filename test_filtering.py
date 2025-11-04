"""
Test script to verify tasks have computed project_id
"""
import sqlite3

# Connect to database
conn = sqlite3.connect('E:\\MyDevTools\\tariffs\\tools\\task-orchestrator-dashboard\\data\\tasks.db')
cursor = conn.cursor()

# Execute the same query as the API
query = """
    SELECT 
        t.id,
        t.title,
        t.project_id as direct_project_id,
        t.feature_id,
        f.project_id as feature_project_id,
        COALESCE(t.project_id, f.project_id) as computed_project_id
    FROM tasks t
    LEFT JOIN features f ON t.feature_id = f.id
    LIMIT 10
"""

results = cursor.execute(query).fetchall()

print("=" * 80)
print("TASK PROJECT_ID VERIFICATION")
print("=" * 80)
print()

for row in results:
    task_id, title, direct_pid, feat_id, feat_pid, computed_pid = row
    print(f"Task: {title[:50]}")
    print(f"  Direct project_id: {direct_pid if direct_pid else 'NULL'}")
    print(f"  Feature_id: {feat_id if feat_id else 'NULL'}")
    print(f"  Feature's project_id: {feat_pid if feat_pid else 'NULL'}")
    print(f"  Computed project_id: {computed_pid if computed_pid else 'NULL'}")
    print()

# Count tasks by computed project
print("=" * 80)
print("TASKS BY COMPUTED PROJECT")
print("=" * 80)

query2 = """
    SELECT 
        COALESCE(t.project_id, f.project_id) as computed_project_id,
        p.name as project_name,
        COUNT(*) as task_count
    FROM tasks t
    LEFT JOIN features f ON t.feature_id = f.id
    LEFT JOIN projects p ON COALESCE(t.project_id, f.project_id) = p.id
    GROUP BY computed_project_id, p.name
"""

results2 = cursor.execute(query2).fetchall()

for row in results2:
    computed_pid, proj_name, count = row
    print(f"Project: {proj_name if proj_name else 'ORPHANED'}")
    print(f"  Tasks: {count}")
    print(f"  Project ID: {computed_pid if computed_pid else 'NULL'}")
    print()

conn.close()
