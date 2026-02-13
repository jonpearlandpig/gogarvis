#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class GoGarvisNewFeaturesTester:
    def __init__(self, base_url="https://gogarvis.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def log_test(self, name, success, details="", expected_data=None, actual_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.results.append({
            "test": name,
            "success": success,
            "details": details,
            "expected": expected_data,
            "actual": actual_data
        })

    def test_dashboard_stats(self):
        """Test dashboard stats for expected counts"""
        try:
            response = requests.get(f"{self.api_url}/dashboard/stats", timeout=10)
            if response.status_code == 200:
                data = response.json()
                expected_counts = {
                    "total_documents": 18,
                    "total_glossary_terms": 30, 
                    "total_components": 8,
                    "total_pigpen_operators": 18,
                    "total_brand_profiles": 1
                }
                
                all_correct = True
                details = []
                for key, expected in expected_counts.items():
                    actual = data.get(key, 0)
                    if actual != expected:
                        all_correct = False
                        details.append(f"{key}: expected {expected}, got {actual}")
                
                if all_correct:
                    self.log_test("Dashboard Stats - All Counts Correct", True, 
                                f"Docs: {data.get('total_documents')}, Glossary: {data.get('total_glossary_terms')}, Components: {data.get('total_components')}, Operators: {data.get('total_pigpen_operators')}, Brands: {data.get('total_brand_profiles')}")
                else:
                    self.log_test("Dashboard Stats - Count Mismatch", False, "; ".join(details), expected_counts, data)
            else:
                self.log_test("Dashboard Stats API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Dashboard Stats API", False, f"Error: {str(e)}")

    def test_pigpen_api(self):
        """Test Pig Pen operators API"""
        try:
            # Test main pigpen endpoint
            response = requests.get(f"{self.api_url}/pigpen", timeout=10)
            if response.status_code == 200:
                data = response.json()
                operators = data.get("operators", [])
                total = data.get("total", 0)
                
                if len(operators) == 18 and total == 18:
                    self.log_test("Pig Pen API - 18 Operators", True, f"Found {len(operators)} operators")
                    
                    # Test categories
                    categories = set(op.get("category") for op in operators)
                    expected_categories = {"Core Resolution", "Business", "Creative", "Systems", "Quality", "Optional"}
                    if categories.intersection(expected_categories):
                        self.log_test("Pig Pen API - Categories Present", True, f"Categories: {', '.join(sorted(categories))}")
                    else:
                        self.log_test("Pig Pen API - Categories Missing", False, f"Found: {categories}")
                        
                    # Test category filter
                    response = requests.get(f"{self.api_url}/pigpen?category=Core Resolution", timeout=10)
                    if response.status_code == 200:
                        filtered_data = response.json()
                        core_ops = [op for op in operators if op.get("category") == "Core Resolution"]
                        if len(filtered_data.get("operators", [])) == len(core_ops):
                            self.log_test("Pig Pen API - Category Filter", True, f"Core Resolution: {len(core_ops)} operators")
                        else:
                            self.log_test("Pig Pen API - Category Filter", False, f"Expected {len(core_ops)}, got {len(filtered_data.get('operators', []))}")
                    else:
                        self.log_test("Pig Pen API - Category Filter", False, f"Status: {response.status_code}")
                        
                else:
                    self.log_test("Pig Pen API - Operator Count", False, f"Expected 18, got {len(operators)} (total: {total})")
            else:
                self.log_test("Pig Pen API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Pig Pen API", False, f"Error: {str(e)}")

    def test_brands_api(self):
        """Test Brand profiles API"""
        try:
            response = requests.get(f"{self.api_url}/brands", timeout=10)
            if response.status_code == 200:
                data = response.json()
                brands = data.get("brands", [])
                total = data.get("total", 0)
                
                if len(brands) == 1 and total == 1:
                    self.log_test("Brands API - 1 Brand Profile", True, f"Found {len(brands)} brand(s)")
                    
                    # Check brand structure
                    if brands:
                        brand = brands[0]
                        required_fields = ["brand_id", "name", "description", "primary_color", "secondary_color", "font_heading", "font_body"]
                        missing_fields = [field for field in required_fields if field not in brand]
                        
                        if not missing_fields:
                            self.log_test("Brands API - Brand Structure", True, f"Brand: {brand.get('name')}")
                        else:
                            self.log_test("Brands API - Brand Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Brands API - Brand Count", False, f"Expected 1, got {len(brands)} (total: {total})")
            else:
                self.log_test("Brands API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Brands API", False, f"Error: {str(e)}")

    def test_audit_log_api(self):
        """Test Audit Log API (requires auth)"""
        try:
            response = requests.get(f"{self.api_url}/audit-log", timeout=10)
            # Should return 401 without auth
            if response.status_code == 401:
                self.log_test("Audit Log API - Auth Required", True, "Correctly requires authentication")
            else:
                self.log_test("Audit Log API - Auth Check", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("Audit Log API", False, f"Error: {str(e)}")

    def test_pigpen_categories_api(self):
        """Test Pig Pen categories endpoint"""
        try:
            response = requests.get(f"{self.api_url}/pigpen/categories/list", timeout=10)
            if response.status_code == 200:
                data = response.json()
                categories = data.get("categories", [])
                expected_categories = ["Business", "Core Resolution", "Creative", "Optional", "Quality", "Systems"]
                
                if set(categories) == set(expected_categories):
                    self.log_test("Pig Pen Categories API", True, f"Categories: {', '.join(categories)}")
                else:
                    self.log_test("Pig Pen Categories API", False, f"Expected: {expected_categories}, Got: {categories}")
            else:
                self.log_test("Pig Pen Categories API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Pig Pen Categories API", False, f"Error: {str(e)}")

    def test_individual_operator(self):
        """Test individual operator retrieval"""
        try:
            # First get all operators to get an ID
            response = requests.get(f"{self.api_url}/pigpen", timeout=10)
            if response.status_code == 200:
                operators = response.json().get("operators", [])
                if operators:
                    operator_id = operators[0]["operator_id"]
                    
                    # Test individual operator endpoint
                    response = requests.get(f"{self.api_url}/pigpen/{operator_id}", timeout=10)
                    if response.status_code == 200:
                        operator = response.json()
                        required_fields = ["operator_id", "tai_d", "name", "capabilities", "role", "authority", "status", "category"]
                        missing_fields = [field for field in required_fields if field not in operator]
                        
                        if not missing_fields:
                            self.log_test("Individual Operator API", True, f"Operator: {operator.get('name')}")
                        else:
                            self.log_test("Individual Operator API", False, f"Missing fields: {missing_fields}")
                    else:
                        self.log_test("Individual Operator API", False, f"Status: {response.status_code}")
                else:
                    self.log_test("Individual Operator API", False, "No operators found to test")
            else:
                self.log_test("Individual Operator API", False, "Could not fetch operators list")
        except Exception as e:
            self.log_test("Individual Operator API", False, f"Error: {str(e)}")

    def test_individual_brand(self):
        """Test individual brand retrieval"""
        try:
            # First get all brands to get an ID
            response = requests.get(f"{self.api_url}/brands", timeout=10)
            if response.status_code == 200:
                brands = response.json().get("brands", [])
                if brands:
                    brand_id = brands[0]["brand_id"]
                    
                    # Test individual brand endpoint
                    response = requests.get(f"{self.api_url}/brands/{brand_id}", timeout=10)
                    if response.status_code == 200:
                        brand = response.json()
                        required_fields = ["brand_id", "name", "description", "primary_color", "secondary_color"]
                        missing_fields = [field for field in required_fields if field not in brand]
                        
                        if not missing_fields:
                            self.log_test("Individual Brand API", True, f"Brand: {brand.get('name')}")
                        else:
                            self.log_test("Individual Brand API", False, f"Missing fields: {missing_fields}")
                    else:
                        self.log_test("Individual Brand API", False, f"Status: {response.status_code}")
                else:
                    self.log_test("Individual Brand API", False, "No brands found to test")
            else:
                self.log_test("Individual Brand API", False, "Could not fetch brands list")
        except Exception as e:
            self.log_test("Individual Brand API", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all new feature tests"""
        print("🧪 Testing GoGarvis New Features (Pig Pen, Brands, Audit Log)")
        print("=" * 60)
        
        self.test_dashboard_stats()
        self.test_pigpen_api()
        self.test_brands_api()
        self.test_audit_log_api()
        self.test_pigpen_categories_api()
        self.test_individual_operator()
        self.test_individual_brand()
        
        print("\n" + "=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        # Save detailed results
        with open("/app/backend_test_new_features_results.json", "w") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "total_tests": self.tests_run,
                "passed_tests": self.tests_passed,
                "success_rate": f"{(self.tests_passed/self.tests_run*100):.1f}%",
                "results": self.results
            }, f, indent=2)
        
        return self.tests_passed == self.tests_run

def main():
    tester = GoGarvisNewFeaturesTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())