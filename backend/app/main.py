from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import employees, attendance, notifications

app = FastAPI(title="Management API", version="1.0.0")

# CORS - Allow all origins for now (can be restricted later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(employees.router, tags=["Employees"], prefix="/api/employees")
app.include_router(attendance.router, tags=["Attendance"], prefix="/api/attendance")
app.include_router(notifications.router, tags=["Notifications"], prefix="/api/notifications")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to HRMS Lite API"}
