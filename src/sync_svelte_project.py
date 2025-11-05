#!/usr/bin/env python3
"""
Script to manually insert the Svelte Flowbite Quotation App project
from MCP Task Orchestrator into the dashboard's database.
"""

import sqlite3
import uuid
from pathlib import Path
from datetime import datetime

DB_PATH = Path("data/tasks.db")

# Project data from MCP
PROJECT_DATA = {
    "id": "0f323bf8-531c-40db-bf8a-bb85f91d021b",
    "name": "Svelte Flowbite Quotation App",
    "summary": "A web application for generating transportation quotations, built with Svelte and Flowbite.",
    "status": "PLANNING",
    "created_at": "2025-10-31 10:33:30.330",
    "modified_at": "2025-10-31 10:33:30.330"
}

def uuid_to_blob(uuid_str):
    """Convert UUID string to BLOB(16)"""
    return bytes.fromhex(uuid_str.replace('-', ''))

def main():
    print("=" * 70)
    print("SYNC SVELTE PROJECT TO DASHBOARD DATABASE")
    print("=" * 70)
    print()
    
    if not DB_PATH.exists():
        print(f"❌ Database not found at: {DB_PATH.absolute()}")
        return
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # Check if project already exists
    project_id_blob = uuid_to_blob(PROJECT_DATA["id"])
    existing = cursor.execute(
        "SELECT id FROM projects WHERE id = ?",
        (project_id_blob,)
    ).fetchone()
    
    if existing:
        print(f"✓ Project '{PROJECT_DATA['name']}' already exists in database")
        print(f"  ID: {PROJECT_DATA['id']}")
        conn.close()
        return
    
    print(f"📝 Inserting project: {PROJECT_DATA['name']}")
    print(f"   ID: {PROJECT_DATA['id']}")
    
    try:
        cursor.execute("""
            INSERT INTO projects (id, name, summary, status, created_at, modified_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            project_id_blob,
            PROJECT_DATA["name"],
            PROJECT_DATA["summary"],
            PROJECT_DATA["status"],
            PROJECT_DATA["created_at"],
            PROJECT_DATA["modified_at"]
        ))
        
        conn.commit()
        print("✅ Project inserted successfully!")
        print()
        
        # Verify
        result = cursor.execute(
            "SELECT COUNT(*) FROM projects"
        ).fetchone()[0]
        
        print(f"📊 Total projects in database: {result}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error inserting project: {e}")
    finally:
        conn.close()
    
    print()
    print("=" * 70)
    print("✅ Sync complete! Restart your dashboard server to see the changes.")
    print("=" * 70)

if __name__ == "__main__":
    main()
