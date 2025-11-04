"""Check what's in the Docker database"""
import sqlite3

conn = sqlite3.connect('\\\\wsl$\\docker-desktop\\mnt\\docker-desktop-disk\\data\\docker\\volumes\\mcp-task-data\\_data\\tasks.db')
cursor = conn.cursor()

results = cursor.execute('''
SELECT 
    COALESCE(t.project_id, f.project_id) as computed_project_id,
    p.name as project_name,
    COUNT(*) as task_count
FROM tasks t
LEFT JOIN features f ON t.feature_id = f.id
LEFT JOIN projects p ON COALESCE(t.project_id, f.project_id) = p.id
GROUP BY computed_project_id, p.name
''').fetchall()

print('Tasks by project in Docker database:')
for row in results:
    print(f'  {row[1] or "ORPHANED"}: {row[2]} tasks')

conn.close()
