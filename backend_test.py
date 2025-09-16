import requests
import sys
import json
from datetime import datetime, timezone
import time

class StudentExpenseAPITester:
    def __init__(self, base_url="https://expense-wizard-67.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_expense_id = None
        self.created_budget_id = None
        self.created_savings_goal_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=True):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("Health Check", "GET", "", 200, auth_required=False)

    def test_register(self):
        """Test user registration"""
        timestamp = int(time.time())
        test_data = {
            "name": "John Student",
            "email": f"john.test.{timestamp}@test.com",
            "password": "test123"
        }
        
        success, response = self.run_test(
            "User Registration", 
            "POST", 
            "auth/register", 
            200, 
            test_data, 
            auth_required=False
        )
        
        if success and 'id' in response:
            self.user_id = response['id']
            print(f"   Created user ID: {self.user_id}")
            # Store credentials for login test
            self.test_email = test_data['email']
            self.test_password = test_data['password']
            return True
        return False

    def test_login(self):
        """Test user login"""
        if not hasattr(self, 'test_email'):
            print("❌ Cannot test login - no registered user")
            return False
            
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.run_test(
            "User Login", 
            "POST", 
            "auth/login", 
            200, 
            login_data, 
            auth_required=False
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Got JWT token: {self.token[:50]}...")
            return True
        return False

    def test_create_expense(self):
        """Test creating an expense"""
        expense_data = {
            "amount": 25.50,
            "category": "Food",
            "date": datetime.now(timezone.utc).isoformat(),
            "notes": "Lunch at campus cafeteria"
        }
        
        success, response = self.run_test(
            "Create Expense", 
            "POST", 
            "expenses", 
            200, 
            expense_data
        )
        
        if success and 'id' in response:
            self.created_expense_id = response['id']
            print(f"   Created expense ID: {self.created_expense_id}")
            return True
        return False

    def test_get_expenses(self):
        """Test getting user expenses"""
        return self.run_test("Get Expenses", "GET", "expenses", 200)

    def test_get_single_expense(self):
        """Test getting a single expense"""
        if not self.created_expense_id:
            print("❌ Cannot test get single expense - no expense created")
            return False
            
        return self.run_test(
            "Get Single Expense", 
            "GET", 
            f"expenses/{self.created_expense_id}", 
            200
        )

    def test_update_expense(self):
        """Test updating an expense"""
        if not self.created_expense_id:
            print("❌ Cannot test update expense - no expense created")
            return False
            
        update_data = {
            "amount": 30.00,
            "category": "Food",
            "date": datetime.now(timezone.utc).isoformat(),
            "notes": "Updated: Dinner at restaurant"
        }
        
        return self.run_test(
            "Update Expense", 
            "PUT", 
            f"expenses/{self.created_expense_id}", 
            200, 
            update_data
        )

    def test_create_budget(self):
        """Test creating a budget"""
        current_date = datetime.now()
        budget_data = {
            "type": "monthly",
            "amount": 1000.0,
            "month": current_date.month,
            "year": current_date.year
        }
        
        success, response = self.run_test(
            "Create Budget", 
            "POST", 
            "budgets", 
            200, 
            budget_data
        )
        
        if success and 'id' in response:
            self.created_budget_id = response['id']
            print(f"   Created budget ID: {self.created_budget_id}")
            return True
        return False

    def test_get_budgets(self):
        """Test getting user budgets"""
        return self.run_test("Get Budgets", "GET", "budgets", 200)

    def test_create_savings_goal(self):
        """Test creating a savings goal"""
        goal_data = {
            "title": "New Laptop",
            "target_amount": 1200.0,
            "target_date": "2025-12-31T00:00:00Z"
        }
        
        success, response = self.run_test(
            "Create Savings Goal", 
            "POST", 
            "savings-goals", 
            200, 
            goal_data
        )
        
        if success and 'id' in response:
            self.created_savings_goal_id = response['id']
            print(f"   Created savings goal ID: {self.created_savings_goal_id}")
            return True
        return False

    def test_get_savings_goals(self):
        """Test getting user savings goals"""
        return self.run_test("Get Savings Goals", "GET", "savings-goals", 200)

    def test_add_to_savings(self):
        """Test adding money to savings goal"""
        if not self.created_savings_goal_id:
            print("❌ Cannot test add to savings - no savings goal created")
            return False
            
        # The API expects amount as a query parameter
        url = f"{self.api_url}/savings-goals/{self.created_savings_goal_id}/add-amount?amount=100.0"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing Add to Savings...")
        print(f"   URL: {url}")
        
        try:
            response = requests.put(url, headers=headers, timeout=10)
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True
                except:
                    return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_expense_summary(self):
        """Test getting expense analytics summary"""
        return self.run_test("Expense Summary", "GET", "analytics/expense-summary", 200)

    def test_ai_chat(self):
        """Test AI chat functionality"""
        chat_data = {
            "message": "How can I save money as a student?"
        }
        
        print("   Note: AI response may take a few seconds...")
        success, response = self.run_test(
            "AI Chat", 
            "POST", 
            "chat", 
            200, 
            chat_data
        )
        
        if success and 'response' in response:
            print(f"   AI Response: {response['response'][:100]}...")
            return True
        return False

    def test_delete_expense(self):
        """Test deleting an expense"""
        if not self.created_expense_id:
            print("❌ Cannot test delete expense - no expense created")
            return False
            
        return self.run_test(
            "Delete Expense", 
            "DELETE", 
            f"expenses/{self.created_expense_id}", 
            200
        )

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Student Expense Manager API Tests")
        print(f"   Base URL: {self.base_url}")
        print(f"   API URL: {self.api_url}")
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_register,
            self.test_login,
            self.test_create_expense,
            self.test_get_expenses,
            self.test_get_single_expense,
            self.test_update_expense,
            self.test_create_budget,
            self.test_get_budgets,
            self.test_create_savings_goal,
            self.test_get_savings_goals,
            self.test_add_to_savings,
            self.test_expense_summary,
            self.test_ai_chat,
            self.test_delete_expense
        ]
        
        for test in tests:
            try:
                test()
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
        
        # Print final results
        print(f"\n📊 Final Results:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = StudentExpenseAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())