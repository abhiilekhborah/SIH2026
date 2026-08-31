from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import images, gallery

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediQuick Gallery Service",
    description="Backend service for managing healthcare images with Cloudinary",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(images.router)
app.include_router(gallery.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "MediQuick Gallery Service"}
