
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Import all models before creating database tables
from app.models import Organization, User, Product


# Initialize database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="StockFlow API",
    description="SaaS Inventory Management System",
    version="1.0.0"
)
from app.routers.auth import router as auth_router

app.include_router(auth_router)

# Configure frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
