import uvicorn
from server import app

if __name__ == "__main__":
    print("Starting Student Expense Manager Backend...")
    print("Backend will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
