
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from app.core.dependencies import get_current_user
from app.models.user import User
from app.database import Base, engine
from app.routers.auth import router as auth_router
from app.routers.product import router as products_router
from app.models import Organization, User, Product, StockMovement


# Initialize database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="StockFlow API",
    description="SaaS Inventory Management System",
    version="1.0.0"
)
#Register API routers
app.include_router(auth_router)
app.include_router(products_router)


# Configure frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():
    return {
        "message": "Welcome to StockFlow API",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }
@app.get("/users/me")
def read_current_user(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "organization_id": current_user.organization_id,
        "is_active": current_user.is_active
    }