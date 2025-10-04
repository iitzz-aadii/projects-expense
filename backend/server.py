from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import hashlib
import jwt

# AI Chat imports (optional)
try:
    import google.generativeai as genai

    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("AI chat features disabled - google-generativeai not available")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
db_name = os.environ.get("DB_NAME", "student_expense_manager")

# Initialize database connection
try:
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    print(f"Connected to MongoDB: {db_name}")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    print("Running without database - some features may not work")
db = None
client = None

# In-memory storage for fallback (when database is not available)
demo_storage = {
    "users": [],
    "expenses": [],
    "budgets": [],
    "savings_goals": [],
    "groups": [],
    "group_expenses": [],
}


# Helper functions for database operations
async def db_find_one(collection, query):
    if db:
        return await db[collection].find_one(query)
    else:
        items = demo_storage[collection]
        for item in items:
            if all(item.get(k) == v for k, v in query.items()):
                return item
        return None


async def db_find(collection, query=None, sort=None, limit=None):
    if db:
        cursor = db[collection].find(query or {})
        if sort:
            cursor = cursor.sort(sort[0], sort[1])
        if limit:
            cursor = cursor.limit(limit)
        return await cursor.to_list(1000)
    else:
        items = demo_storage[collection]
        if query:
            filtered = []
            for item in items:
                if all(item.get(k) == v for k, v in query.items()):
                    filtered.append(item)
            items = filtered
        if sort:
            items.sort(key=lambda x: x.get(sort[0], 0), reverse=(sort[1] == -1))
        if limit:
            items = items[:limit]
        return items


async def db_insert_one(collection, document):
    if db:
        return await db[collection].insert_one(document)
    else:
        demo_storage[collection].append(document)

        # Create a mock result object
        class MockResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id

        return MockResult(document.get("id", "demo_id"))


async def db_update_one(collection, query, update):
    if db:
        return await db[collection].update_one(query, update)
    else:
        items = demo_storage[collection]
        for i, item in enumerate(items):
            if all(item.get(k) == v for k, v in query.items()):
                items[i].update(update["$set"])

                class MockResult:
                    def __init__(self, modified_count):
                        self.modified_count = modified_count

                return MockResult(1)

        class MockResult:
            def __init__(self, modified_count):
                self.modified_count = modified_count

        return MockResult(0)


async def db_delete_one(collection, query):
    if db:
        return await db[collection].delete_one(query)
    else:
        items = demo_storage[collection]
        for i, item in enumerate(items):
            if all(item.get(k) == v for k, v in query.items()):
                del items[i]

                class MockResult:
                    def __init__(self, deleted_count):
                        self.deleted_count = deleted_count

                return MockResult(1)

        class MockResult:
            def __init__(self, deleted_count):
                self.deleted_count = deleted_count

        return MockResult(0)


# JWT Secret (in production, use a secure random secret)
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="Student Expense Manager", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# AI Chat instance
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hashlib.sha256(password.encode()).hexdigest() == hashed


def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc).timestamp() + 86400,  # 24 hours
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = await db_find_one("users", {"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime


class Expense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    category: str  # Food, Travel, Study Material, Personal, Other
    date: datetime
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    date: datetime
    notes: Optional[str] = None


class Budget(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # 'monthly' or 'category'
    category: Optional[str] = None  # Required if type is 'category'
    amount: float
    month: int  # 1-12
    year: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BudgetCreate(BaseModel):
    type: str
    category: Optional[str] = None
    amount: float
    month: int
    year: int


class SavingsGoal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    target_amount: float
    current_amount: float = 0.0
    target_date: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SavingsGoalCreate(BaseModel):
    title: str
    target_amount: float
    target_date: datetime


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Group Management Models
class GroupMember(BaseModel):
    user_id: str
    name: str
    email: str
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Group(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_by: str
    members: List[GroupMember] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GroupExpense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group_id: str
    paid_by: str  # user_id of who paid
    paid_by_name: str
    amount: float
    description: str
    category: str = "Group"
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    split_among: List[str] = []  # user_ids who should pay
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GroupSettlement(BaseModel):
    debtor: str  # user_id who owes money
    debtor_name: str
    creditor: str  # user_id who should receive money
    creditor_name: str
    amount: float


class GroupSummary(BaseModel):
    group: Group
    total_expenses: float
    member_balances: dict  # {user_id: balance}
    settlements: List[GroupSettlement]


# Helper function to serialize datetime for MongoDB
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data


def parse_from_mongo(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and key in ["date", "created_at", "target_date"]:
                try:
                    item[key] = datetime.fromisoformat(value.replace("Z", "+00:00"))
                except:
                    pass
    return item


# Authentication Routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db_find_one("users", {"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hash_password(user_data.password),
    )

    user_dict = prepare_for_mongo(user.dict())
    await db_insert_one("users", user_dict)

    return UserResponse(**user.dict())


@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db_find_one("users", {"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_jwt_token(user["id"])
    user_obj = parse_from_mongo(user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse(**user_obj),
    }


# Expense Routes
@api_router.post("/expenses", response_model=Expense)
async def create_expense(
    expense_data: ExpenseCreate, current_user: User = Depends(get_current_user)
):
    expense = Expense(user_id=current_user.id, **expense_data.dict())

    expense_dict = prepare_for_mongo(expense.dict())
    await db_insert_one("expenses", expense_dict)

    return expense


@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses(current_user: User = Depends(get_current_user)):
    expenses = await db_find("expenses", {"user_id": current_user.id}, ("date", -1))
    return [Expense(**parse_from_mongo(expense)) for expense in expenses]


@api_router.get("/expenses/{expense_id}", response_model=Expense)
async def get_expense(expense_id: str, current_user: User = Depends(get_current_user)):
    expense = await db_find_one(
        "expenses", {"id": expense_id, "user_id": current_user.id}
    )
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    return Expense(**parse_from_mongo(expense))


@api_router.put("/expenses/{expense_id}", response_model=Expense)
async def update_expense(
    expense_id: str,
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
):
    expense = await db_find_one(
        "expenses", {"id": expense_id, "user_id": current_user.id}
    )
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = prepare_for_mongo(expense_data.dict())
    await db_update_one(
        "expenses",
        {"id": expense_id, "user_id": current_user.id},
        {"$set": update_data},
    )

    updated_expense = await db_find_one(
        "expenses", {"id": expense_id, "user_id": current_user.id}
    )
    return Expense(**parse_from_mongo(updated_expense))


@api_router.delete("/expenses/{expense_id}")
async def delete_expense(
    expense_id: str, current_user: User = Depends(get_current_user)
):
    result = await db_delete_one(
        "expenses", {"id": expense_id, "user_id": current_user.id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")

    return {"message": "Expense deleted successfully"}


# Budget Routes
@api_router.post("/budgets", response_model=Budget)
async def create_budget(
    budget_data: BudgetCreate, current_user: User = Depends(get_current_user)
):
    budget = Budget(user_id=current_user.id, **budget_data.dict())

    budget_dict = prepare_for_mongo(budget.dict())
    await db_insert_one("budgets", budget_dict)

    return budget


@api_router.get("/budgets", response_model=List[Budget])
async def get_budgets(current_user: User = Depends(get_current_user)):
    budgets = await db_find("budgets", {"user_id": current_user.id})
    return [Budget(**parse_from_mongo(budget)) for budget in budgets]


# Savings Goals Routes
@api_router.post("/savings-goals", response_model=SavingsGoal)
async def create_savings_goal(
    goal_data: SavingsGoalCreate, current_user: User = Depends(get_current_user)
):
    goal = SavingsGoal(user_id=current_user.id, **goal_data.dict())

    goal_dict = prepare_for_mongo(goal.dict())
    await db_insert_one("savings_goals", goal_dict)

    return goal


@api_router.get("/savings-goals", response_model=List[SavingsGoal])
async def get_savings_goals(current_user: User = Depends(get_current_user)):
    goals = await db_find("savings_goals", {"user_id": current_user.id})
    return [SavingsGoal(**parse_from_mongo(goal)) for goal in goals]


@api_router.put("/savings-goals/{goal_id}/add-amount")
async def add_to_savings(
    goal_id: str, amount: float, current_user: User = Depends(get_current_user)
):
    goal = await db_find_one(
        "savings_goals", {"id": goal_id, "user_id": current_user.id}
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    new_amount = goal["current_amount"] + amount
    await db_update_one(
        "savings_goals",
        {"id": goal_id, "user_id": current_user.id},
        {"$set": {"current_amount": new_amount}},
    )

    updated_goal = await db_find_one(
        "savings_goals", {"id": goal_id, "user_id": current_user.id}
    )
    return SavingsGoal(**parse_from_mongo(updated_goal))


# Analytics Routes
@api_router.get("/analytics/expense-summary")
async def get_expense_summary(current_user: User = Depends(get_current_user)):
    expenses = await db_find("expenses", {"user_id": current_user.id})

    total_expenses = sum(expense["amount"] for expense in expenses)
    category_totals = {}

    for expense in expenses:
        category = expense["category"]
        category_totals[category] = category_totals.get(category, 0) + expense["amount"]

    return {
        "total_expenses": total_expenses,
        "category_breakdown": category_totals,
        "expense_count": len(expenses),
    }


# AI Chat Routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    message_data: ChatMessage, current_user: User = Depends(get_current_user)
):
    if not AI_AVAILABLE:
        return ChatResponse(
            response="AI chat feature is currently unavailable. Please try again later."
        )

    if not GEMINI_API_KEY:
        return ChatResponse(
            response="AI service not configured. Please contact support."
        )

    try:
        # Configure Gemini API
        genai.configure(api_key=GEMINI_API_KEY)

        # Get user's recent expenses for context
        recent_expenses = await db_find(
            "expenses", {"user_id": current_user.id}, ("date", -1), 10
        )

        # Prepare context about user's expenses
        context = f"""You are a helpful financial advisor AI for a student expense management app. 
        The user {current_user.name} has {len(recent_expenses)} recent transactions.
        Provide helpful, concise financial advice and answer questions about budgeting, saving, and expense management.
        Keep responses friendly, educational, and practical for students.
        Focus on actionable tips and avoid giving specific investment advice."""

        # Create the model
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Create the prompt
        prompt = f"{context}\n\nUser question: {message_data.message}"

        # Generate response
        response = model.generate_content(prompt)

        return ChatResponse(response=response.text)

    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return ChatResponse(response=f"AI service error: {str(e)}")


# Health check
# Group Management Routes
@api_router.post("/groups", response_model=Group)
async def create_group(
    group_data: Group, current_user: User = Depends(get_current_user)
):
    group_dict = group_data.dict()
    group_dict["created_by"] = current_user.id
    group_dict["members"] = [
        GroupMember(
            user_id=current_user.id, name=current_user.name, email=current_user.email
        )
    ] + group_dict.get("members", [])

    await db_insert_one("groups", group_dict)
    return group_dict


@api_router.get("/groups", response_model=List[Group])
async def get_user_groups(current_user: User = Depends(get_current_user)):
    # Get groups where user is a member
    if db:
        groups = await db_find(
            "groups", {"members": {"$elemMatch": {"user_id": current_user.id}}}
        )
    else:
        # For demo mode, filter groups where user is a member
        all_groups = await db_find("groups", {})
        groups = [
            group
            for group in all_groups
            if any(m["user_id"] == current_user.id for m in group["members"])
        ]
    return groups


@api_router.post("/groups/{group_id}/members")
async def add_group_member(
    group_id: str,
    member_data: GroupMember,
    current_user: User = Depends(get_current_user),
):
    group = await db_find_one("groups", {"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Check if user is already a member
    if any(m["user_id"] == member_data.user_id for m in group["members"]):
        raise HTTPException(status_code=400, detail="User already in group")

    group["members"].append(member_data.dict())
    await db_update_one("groups", {"id": group_id}, {"members": group["members"]})
    return {"message": "Member added successfully"}


@api_router.post("/groups/{group_id}/expenses", response_model=GroupExpense)
async def create_group_expense(
    group_id: str,
    expense_data: GroupExpense,
    current_user: User = Depends(get_current_user),
):
    # Verify group exists and user is a member
    group = await db_find_one("groups", {"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if not any(m["user_id"] == current_user.id for m in group["members"]):
        raise HTTPException(status_code=403, detail="Not a member of this group")

    expense_dict = expense_data.dict()
    expense_dict["group_id"] = group_id
    expense_dict["paid_by"] = current_user.id
    expense_dict["paid_by_name"] = current_user.name

    await db_insert_one("group_expenses", expense_dict)
    return expense_dict


@api_router.get("/groups/{group_id}/expenses", response_model=List[GroupExpense])
async def get_group_expenses(
    group_id: str, current_user: User = Depends(get_current_user)
):
    # Verify group exists and user is a member
    group = await db_find_one("groups", {"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if not any(m["user_id"] == current_user.id for m in group["members"]):
        raise HTTPException(status_code=403, detail="Not a member of this group")

    expenses = await db_find("group_expenses", {"group_id": group_id}, ("date", -1))
    return expenses


@api_router.get("/groups/{group_id}/settlement", response_model=GroupSummary)
async def get_group_settlement(
    group_id: str, current_user: User = Depends(get_current_user)
):
    # Verify group exists and user is a member
    group = await db_find_one("groups", {"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if not any(m["user_id"] == current_user.id for m in group["members"]):
        raise HTTPException(status_code=403, detail="Not a member of this group")

    # Get all group expenses
    expenses = await db_find("group_expenses", {"group_id": group_id})

    # Calculate balances for each member
    member_balances = {}
    for member in group["members"]:
        member_balances[member["user_id"]] = 0.0

    total_expenses = 0.0

    for expense in expenses:
        total_expenses += expense["amount"]
        amount_per_person = expense["amount"] / len(expense["split_among"])

        # Add to paid_by's balance (they paid, so positive)
        member_balances[expense["paid_by"]] += expense["amount"]

        # Subtract from each person who should pay
        for user_id in expense["split_among"]:
            member_balances[user_id] -= amount_per_person

    # Calculate settlements (who owes whom)
    settlements = []
    creditors = []  # People who are owed money
    debtors = []  # People who owe money

    for user_id, balance in member_balances.items():
        if balance > 0:
            creditors.append((user_id, balance))
        elif balance < 0:
            debtors.append((user_id, abs(balance)))

    # Simple settlement algorithm
    creditor_idx = 0
    debtor_idx = 0

    while creditor_idx < len(creditors) and debtor_idx < len(debtors):
        creditor_id, creditor_amount = creditors[creditor_idx]
        debtor_id, debtor_amount = debtors[debtor_idx]

        # Find creditor and debtor names
        creditor_name = next(
            m["name"] for m in group["members"] if m["user_id"] == creditor_id
        )
        debtor_name = next(
            m["name"] for m in group["members"] if m["user_id"] == debtor_id
        )

        settlement_amount = min(creditor_amount, debtor_amount)

        settlements.append(
            GroupSettlement(
                debtor=debtor_id,
                debtor_name=debtor_name,
                creditor=creditor_id,
                creditor_name=creditor_name,
                amount=settlement_amount,
            )
        )

        creditors[creditor_idx] = (creditor_id, creditor_amount - settlement_amount)
        debtors[debtor_idx] = (debtor_id, debtor_amount - settlement_amount)

        if creditors[creditor_idx][1] == 0:
            creditor_idx += 1
        if debtors[debtor_idx][1] == 0:
            debtor_idx += 1

    return GroupSummary(
        group=group,
        total_expenses=total_expenses,
        member_balances=member_balances,
        settlements=settlements,
    )


@api_router.get("/")
async def root():
    return {"message": "Student Expense Manager API", "status": "running"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()
