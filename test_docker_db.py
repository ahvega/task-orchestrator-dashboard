#!/usr/bin/env python3
"""
Test script to verify we can access the Docker volume database
"""

import os
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

# Load .env
load_dotenv()

DB_PATH = os.getenv("TASK_ORCHESTRATOR_DB", "data/tasks.db")

print("=" * 70)
print("DOCKER VOLUME DATABASE ACCESS TEST")
print("=" * 70)
print()
print(f"📁 Configured path: {DB_PATH}")
print()

# Test 1: Check if path exists
db_path = Path(DB_PATH)
if db_path.exists():
    print(f"✅ Database file exists")
    print(f"   Size: {db_path.stat().st_size / 1024:.1f} KB")
    print()
else:
    print(f"❌ Database file not found at: {db_path.absolute()}")
    print()
    exit(1)

# Test 2: Try to connect (read-only immutable mode)
try:
    # Use immutable mode - tells SQLite database won't change (allows concurrent reads)
    db_uri = f"file:{DB_PATH}?mode=ro&immutable=1"
    conn = sqlite3.connect(db_uri, uri=True)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("✅ Successfully connected to database (READ-ONLY mode)")
    print()
    
    # Test 3: Query projects
    projects = cursor.execute("""
        SELECT id, name, status, created_at 
        FROM projects 
        ORDER BY modified_at DESC, created_at DESC
    """).fetchall()
    
    print(f"📊 Found {len(projects)} projects:")
    print()
    
    for proj in projects:
        # Convert BLOB UUID to string
        id_bytes = proj['id']
        if isinstance(id_bytes, bytes):
            hex_str = id_bytes.hex()
            uuid_str = f"{hex_str[0:8]}-{hex_str[8:12]}-{hex_str[12:16]}-{hex_str[16:20]}-{hex_str[20:32]}"
        else:
            uuid_str = str(id_bytes)
        
        print(f"  • {proj['name']}")
        print(f"    ID: {uuid_str}")
        print(f"    Status: {proj['status']}")
        print()
    
    conn.close()
    
    print("=" * 70)
    print("✅ All tests passed! The Docker volume database is accessible.")
    print("=" * 70)
    
except Exception as e:
    print(f"❌ Error accessing database: {e}")
    exit(1)
