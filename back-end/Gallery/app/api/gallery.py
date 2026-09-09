from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import os

from app.core.database import get_db
from app.models.image import ImageType
from app.services.image_service import ImageService

router = APIRouter(tags=["gallery"])

# Setup Jinja2 templates directory
templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
templates = Jinja2Templates(directory=templates_dir)

@router.get("/gallery", response_model=None) # Normally returns JSON for the app, but user asked for test-gallery route
def get_gallery_json(db: Session = Depends(get_db)):
    """
    JSON endpoint for Gallery (to be used by mobile app eventually)
    """
    images, total = ImageService.get_images(db, limit=100)
    return {"items": images, "total": total}

@router.get("/test-gallery", response_class=HTMLResponse)
def test_gallery_page(request: Request, db: Session = Depends(get_db)):
    """
    Serves the simple browser-based testing interface for the Gallery.
    """
    images, _ = ImageService.get_images(db, limit=100)
    return templates.TemplateResponse(
        request=request, 
        name="test_gallery.html", 
        context={"images": images}
    )
