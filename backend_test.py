#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class DJLoukAPITester:
    def __init__(self, base_url: str = "https://booth-capture-system.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, passed: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "passed": passed,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")

    def test_health_check(self) -> bool:
        """Test /api/health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["status", "service"]
                has_fields = all(field in data for field in expected_fields)
                self.log_test("Health Check", has_fields, f"Status: {response.status_code}, Data: {data}")
                return has_fields
            else:
                self.log_test("Health Check", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_settings_get(self) -> bool:
        """Test /api/settings endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/settings", timeout=10)
            if response.status_code == 200:
                data = response.json()
                # Check for expected default settings fields
                expected_fields = ["photo_count", "theme", "welcome_message", "enable_sounds"]
                has_fields = all(field in data for field in expected_fields)
                self.log_test("Settings GET", has_fields, f"Status: {response.status_code}, Has required fields: {has_fields}")
                return has_fields
            else:
                self.log_test("Settings GET", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Settings GET", False, f"Exception: {str(e)}")
            return False

    def test_events_active(self) -> bool:
        """Test /api/events/active endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/events/active", timeout=10)
            if response.status_code == 200:
                data = response.json()
                # Should return null if no active event, or event object if exists
                is_valid = data is None or (isinstance(data, dict) and "event_id" in data)
                self.log_test("Events Active", is_valid, f"Status: {response.status_code}, Data: {data}")
                return is_valid
            else:
                self.log_test("Events Active", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Events Active", False, f"Exception: {str(e)}")
            return False

    def test_groups_list(self) -> bool:
        """Test /api/groups endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/groups", timeout=10)
            if response.status_code == 200:
                data = response.json()
                # Should return an array (empty or with groups)
                is_valid = isinstance(data, list)
                self.log_test("Groups List", is_valid, f"Status: {response.status_code}, Type: {type(data)}, Count: {len(data) if is_valid else 'N/A'}")
                return is_valid
            else:
                self.log_test("Groups List", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Groups List", False, f"Exception: {str(e)}")
            return False

    def test_api_root(self) -> bool:
        """Test /api/ root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                has_message = "message" in data
                self.log_test("API Root", has_message, f"Status: {response.status_code}, Data: {data}")
                return has_message
            else:
                self.log_test("API Root", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Root", False, f"Exception: {str(e)}")
            return False

    def test_cors_headers(self) -> bool:
        """Test CORS headers are present"""
        try:
            response = requests.options(f"{self.base_url}/api/health", timeout=10)
            cors_headers = [
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Methods",
                "Access-Control-Allow-Headers"
            ]
            has_cors = any(header in response.headers for header in cors_headers)
            self.log_test("CORS Headers", has_cors, f"Headers: {dict(response.headers)}")
            return has_cors
        except Exception as e:
            self.log_test("CORS Headers", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests"""
        print("🚀 Starting DJ LOUK Backend API Tests...")
        print(f"🔗 Base URL: {self.base_url}")
        print("-" * 50)

        # Run tests
        self.test_health_check()
        self.test_settings_get()
        self.test_events_active()
        self.test_groups_list()
        self.test_api_root()
        self.test_cors_headers()

        # Summary
        print("-" * 50)
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📊 Results: {self.tests_passed}/{self.tests_run} tests passed ({success_rate:.1f}%)")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed!")
        else:
            print("⚠️  Some backend tests failed - check details above")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": success_rate,
            "results": self.test_results
        }

def main():
    """Main function"""
    tester = DJLoukAPITester()
    results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    return 0 if results["success_rate"] == 100 else 1

if __name__ == "__main__":
    sys.exit(main())