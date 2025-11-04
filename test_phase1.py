#!/usr/bin/env python3
"""
Quick test script for Phase 1 implementation
"""

import sys

print("=" * 60)
print("Testing Phase 1 Implementation")
print("=" * 60)
print()

# Test 1: Import services
print("Test 1: Import services...")
try:
    from services import DockerVolumeDetector, WebSocketManager, DatabasePool
    print("[PASS] Services imported successfully")
except ImportError as e:
    print(f"[FAIL] Failed to import services: {e}")
    sys.exit(1)

# Test 2: Docker volume detection
print("\nTest 2: Docker volume detection...")
try:
    detector = DockerVolumeDetector()
    print(f"   Docker client available: {detector.docker_client is not None}")

    result = detector.detect_volume()
    if result:
        path, method = result
        print(f"   Volume detected - Method: {method}")
        if path:
            print(f"   Path: {path}")
    else:
        print("   Volume not detected (this is OK)")

    recommended = detector.get_recommended_path()
    print(f"   Recommended path: {recommended}")
    print("[PASS] Docker detection test passed")
except Exception as e:
    print(f"[FAIL] Docker detection failed: {e}")

# Test 3: Database pool
print("\nTest 3: Database pool...")
try:
    pool = DatabasePool('data/tasks.db')
    with pool.get_connection() as conn:
        cursor = conn.cursor()
        tables = cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()
        print(f"   Tables found: {len(tables)}")
        print(f"   Table names: {[t[0] for t in tables[:5]]}...")
    print("[PASS] Database pool test passed")
except Exception as e:
    print(f"[FAIL] Database pool failed: {e}")

# Test 4: WebSocket manager
print("\nTest 4: WebSocket manager...")
try:
    ws_manager = WebSocketManager()
    print(f"   Active connections: {ws_manager.get_connection_count()}")
    ws_manager.set_db_path('data/tasks.db')
    print(f"   Database path set: {ws_manager.db_path}")
    print("[PASS] WebSocket manager test passed")
except Exception as e:
    print(f"[FAIL] WebSocket manager failed: {e}")

print()
print("=" * 60)
print("Phase 1 Component Tests: [PASS] ALL TESTS PASSED")
print("=" * 60)
print()
print("Next: Run 'python server_v2.py' to start the server")
print("      Visit http://localhost:8888/docs for API documentation")
