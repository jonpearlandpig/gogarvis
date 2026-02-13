#!/usr/bin/env python3
"""
Backend API Testing for GoGarvis Application
Tests all API endpoints for functionality and integration
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, List

class GoGarvisAPITester:
    def __init__(self, base_url="https://gogarvis.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.session_id = None

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")

    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_status = "status" in data and data["status"] == "healthy"
                has_timestamp = "timestamp" in data
                success = has_status and has_timestamp
                details = f"Status: {response.status_code}, Health: {data.get('status', 'unknown')}"
            else:
                details = f"Status: {response.status_code}"
                data = None
                
            self.log_test("Health Check", success, details, data)
            return success
            
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_dashboard_stats(self):
        """Test /api/dashboard/stats endpoint"""
        try:
            response = requests.get(f"{self.api_url}/dashboard/stats", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = [
                    "total_documents", "total_glossary_terms", "total_components",
                    "active_components", "document_categories", "glossary_categories",
                    "system_status", "authority_chain"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    # Check expected values from requirements
                    expected_docs = 18
                    expected_terms = 30
                    expected_components = 8
                    
                    docs_ok = data["total_documents"] == expected_docs
                    terms_ok = data["total_glossary_terms"] == expected_terms
                    components_ok = data["total_components"] == expected_components
                    
                    if not (docs_ok and terms_ok and components_ok):
                        details = f"Expected: docs={expected_docs}, terms={expected_terms}, components={expected_components}. Got: docs={data.get('total_documents')}, terms={data.get('total_glossary_terms')}, components={data.get('total_components')}"
                    else:
                        details = f"All stats correct: {data['total_documents']} docs, {data['total_glossary_terms']} terms, {data['total_components']} components"
            else:
                details = f"Status: {response.status_code}"
                data = None
                
            self.log_test("Dashboard Stats", success, details, data)
            return success
            
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Exception: {str(e)}")
            return False

    def test_documents_endpoint(self):
        """Test /api/documents endpoint"""
        try:
            # Test basic documents list
            response = requests.get(f"{self.api_url}/documents", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_documents = "documents" in data and "total" in data
                if has_documents:
                    docs_count = len(data["documents"])
                    total_count = data["total"]
                    success = docs_count == total_count and docs_count > 0
                    details = f"Found {docs_count} documents, total: {total_count}"
                else:
                    success = False
                    details = "Missing 'documents' or 'total' fields"
            else:
                details = f"Status: {response.status_code}"
                data = None
                
            self.log_test("Documents List", success, details, data)
            
            # Test search functionality
            if success:
                search_response = requests.get(f"{self.api_url}/documents?search=GARVIS", timeout=10)
                search_success = search_response.status_code == 200
                if search_success:
                    search_data = search_response.json()
                    search_details = f"Search returned {len(search_data.get('documents', []))} results"
                else:
                    search_details = f"Search failed with status: {search_response.status_code}"
                
                self.log_test("Documents Search", search_success, search_details)
                
            # Test categories
            cat_response = requests.get(f"{self.api_url}/documents/categories/list", timeout=10)
            cat_success = cat_response.status_code == 200
            if cat_success:
                cat_data = cat_response.json()
                cat_details = f"Found {len(cat_data.get('categories', []))} categories"
            else:
                cat_details = f"Categories failed with status: {cat_response.status_code}"
            
            self.log_test("Documents Categories", cat_success, cat_details)
            
            return success
            
        except Exception as e:
            self.log_test("Documents Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_glossary_endpoint(self):
        """Test /api/glossary endpoint"""
        try:
            # Test basic glossary list
            response = requests.get(f"{self.api_url}/glossary", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_terms = "terms" in data and "total" in data
                if has_terms:
                    terms_count = len(data["terms"])
                    total_count = data["total"]
                    success = terms_count == total_count and terms_count > 0
                    details = f"Found {terms_count} terms, total: {total_count}"
                else:
                    success = False
                    details = "Missing 'terms' or 'total' fields"
            else:
                details = f"Status: {response.status_code}"
                data = None
                
            self.log_test("Glossary List", success, details, data)
            
            # Test search functionality
            if success:
                search_response = requests.get(f"{self.api_url}/glossary?search=GARVIS", timeout=10)
                search_success = search_response.status_code == 200
                if search_success:
                    search_data = search_response.json()
                    search_details = f"Search returned {len(search_data.get('terms', []))} results"
                else:
                    search_details = f"Search failed with status: {search_response.status_code}"
                
                self.log_test("Glossary Search", search_success, search_details)
                
            # Test categories
            cat_response = requests.get(f"{self.api_url}/glossary/categories", timeout=10)
            cat_success = cat_response.status_code == 200
            if cat_success:
                cat_data = cat_response.json()
                cat_details = f"Found {len(cat_data.get('categories', []))} categories"
            else:
                cat_details = f"Categories failed with status: {cat_response.status_code}"
            
            self.log_test("Glossary Categories", cat_success, cat_details)
            
            return success
            
        except Exception as e:
            self.log_test("Glossary Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_architecture_endpoint(self):
        """Test /api/architecture/components endpoint"""
        try:
            response = requests.get(f"{self.api_url}/architecture/components", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_components = "components" in data
                if has_components:
                    components = data["components"]
                    components_count = len(components)
                    expected_count = 8  # From requirements
                    
                    success = components_count == expected_count
                    if success:
                        # Check component structure
                        required_fields = ["id", "name", "description", "status", "layer", "key_functions"]
                        for component in components:
                            missing = [field for field in required_fields if field not in component]
                            if missing:
                                success = False
                                details = f"Component missing fields: {missing}"
                                break
                        else:
                            details = f"Found {components_count} components with correct structure"
                    else:
                        details = f"Expected {expected_count} components, got {components_count}"
                else:
                    success = False
                    details = "Missing 'components' field"
            else:
                details = f"Status: {response.status_code}"
                data = None
                
            self.log_test("Architecture Components", success, details, data)
            return success
            
        except Exception as e:
            self.log_test("Architecture Components", False, f"Exception: {str(e)}")
            return False

    def test_chat_endpoint(self):
        """Test /api/chat endpoint"""
        try:
            # Test chat message
            chat_payload = {
                "message": "What is GARVIS?",
                "session_id": None
            }
            
            response = requests.post(
                f"{self.api_url}/chat", 
                json=chat_payload, 
                timeout=30  # AI responses can take time
            )
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_response = "response" in data and "session_id" in data
                if has_response:
                    self.session_id = data["session_id"]
                    response_text = data["response"]
                    success = len(response_text) > 0
                    details = f"Got AI response ({len(response_text)} chars), session: {self.session_id[:8]}..."
                else:
                    success = False
                    details = "Missing 'response' or 'session_id' fields"
            else:
                details = f"Status: {response.status_code}"
                data = None
                
            self.log_test("Chat AI Response", success, details, data)
            
            # Test chat history if we have a session
            if success and self.session_id:
                history_response = requests.get(f"{self.api_url}/chat/history/{self.session_id}", timeout=10)
                history_success = history_response.status_code == 200
                if history_success:
                    history_data = history_response.json()
                    messages_count = len(history_data.get("messages", []))
                    history_details = f"Found {messages_count} messages in history"
                else:
                    history_details = f"History failed with status: {history_response.status_code}"
                
                self.log_test("Chat History", history_success, history_details)
            
            return success
            
        except Exception as e:
            self.log_test("Chat Endpoint", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting GoGarvis API Tests...")
        print(f"📡 Testing against: {self.api_url}")
        print("=" * 60)
        
        # Run all tests
        tests = [
            self.test_health_endpoint,
            self.test_dashboard_stats,
            self.test_documents_endpoint,
            self.test_glossary_endpoint,
            self.test_architecture_endpoint,
            self.test_chat_endpoint
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ CRITICAL ERROR in {test.__name__}: {str(e)}")
            print()
        
        # Summary
        print("=" * 60)
        print(f"📊 RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED!")
            return 0
        else:
            print("⚠️  SOME TESTS FAILED")
            return 1

    def get_test_summary(self):
        """Get test summary for reporting"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "test_results": self.test_results
        }

def main():
    tester = GoGarvisAPITester()
    exit_code = tester.run_all_tests()
    
    # Save detailed results
    summary = tester.get_test_summary()
    with open("/app/backend_test_results.json", "w") as f:
        json.dump(summary, f, indent=2)
    
    return exit_code

if __name__ == "__main__":
    sys.exit(main())