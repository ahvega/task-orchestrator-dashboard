#!/usr/bin/env python3
"""
Debug script to query projects directly from the SQLite database
and see what the /api/projects/summary query is actually returning.
"""

import sqlite3
import sys
from pathlib import Path

# Add parent directory to path to import database_pool
sys.path.insert(0, str(Path(__file__).parent))

from services.database_pool import dict_from_row

DB_PATH = Path("data/tasks.db")

def main():
    print("=" * 70)
    print("PROJECT DATABASE DIAGNOSTIC")
    print("=" * 70)
    print()
    
    if not DB_PATH.exists():
        print(f"❌ Database not found at: {DB_PATH.absolute()}")
        return
    
    print(f"📁 Database: {DB_PATH.absolute()}")
    print()
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Query 1: Simple project list
    print("1️⃣  SIMPLE PROJECT QUERY (no JOINs)")
    print("-" * 70)
    projects = cursor.execute("""
        SELECT * FROM projects
        ORDER BY modified_at DESC, created_at DESC
    """).fetchall()
    
    print(f"Found {len(projects)} projects:")
    print()
    for proj_row in projects:
        proj = dict_from_row(proj_row)
        print(f"  • {proj['name']}")
        print(f"    ID: {proj['id']}")
        print(f"    Status: {proj.get('status', 'N/A')}")
        print(f"    Created: {proj.get('created_at', 'N/A')}")
        print(f"    Modified: {proj.get('modified_at', 'N/A')}")
        print()
    
    print()
    
    # Query 2: The actual API query with subquery
    print("2️⃣  API QUERY (/api/projects/summary) - WITH SUBQUERY")
    print("-" * 70)
    api_projects = cursor.execute("""
        SELECT 
            p.*,
            COUNT(DISTINCT f.id) as feature_count,
            (
                SELECT COUNT(DISTINCT t.id)
                FROM tasks t
                LEFT JOIN features f2 ON t.feature_id = f2.id
                WHERE t.project_id = p.id OR f2.project_id = p.id
            ) as task_count
        FROM projects p
        LEFT JOIN features f ON f.project_id = p.id
        GROUP BY p.id
        ORDER BY p.modified_at DESC, p.created_at DESC
    """).fetchall()
    
    print(f"Found {len(api_projects)} projects:")
    print()
    for row in api_projects:
        proj = dict_from_row(row)
        print(f"  • {proj['name']}")
        print(f"    ID: {proj['id']}")
        print(f"    Features: {row['feature_count']}")
        print(f"    Tasks: {row['task_count']}")
        print()
    
    print()
    
    # Query 3: Check features for each project
    print("3️⃣  FEATURES BY PROJECT")
    print("-" * 70)
    for proj_row in projects:
        proj = dict_from_row(proj_row)
        proj_id_blob = proj_row['id']  # Keep as BLOB
        
        features = cursor.execute("""
            SELECT COUNT(*) as count FROM features WHERE project_id = ?
        """, (proj_id_blob,)).fetchone()
        
        print(f"  • {proj['name']}: {features['count']} features")
    
    print()
    
    # Query 4: Check tasks for each project
    print("4️⃣  TASKS BY PROJECT (direct + through features)")
    print("-" * 70)
    for proj_row in projects:
        proj = dict_from_row(proj_row)
        proj_id_blob = proj_row['id']  # Keep as BLOB
        
        # Direct tasks
        direct_tasks = cursor.execute("""
            SELECT COUNT(*) as count FROM tasks WHERE project_id = ?
        """, (proj_id_blob,)).fetchone()
        
        # Tasks through features
        feature_tasks = cursor.execute("""
            SELECT COUNT(DISTINCT t.id) as count
            FROM tasks t
            INNER JOIN features f ON t.feature_id = f.id
            WHERE f.project_id = ?
        """, (proj_id_blob,)).fetchone()
        
        total = direct_tasks['count'] + feature_tasks['count']
        
        print(f"  • {proj['name']}")
        print(f"    Direct tasks: {direct_tasks['count']}")
        print(f"    Feature tasks: {feature_tasks['count']}")
        print(f"    Total: {total}")
        print()
    
    conn.close()
    
    print()
    print("=" * 70)
    print("✅ Diagnostic complete!")
    print("=" * 70)

if __name__ == "__main__":
    main()
