from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid

from app.core.database import get_db
from app.models.image import ImageType, GalleryImage
from app.schemas.image import ImageResponse, PaginatedImageResponse, UploadResponse, ImageBase, GenericResponse
from app.services.image_service import ImageService

router = APIRouter(prefix="/images", tags=["images"])

@router.post("/upload", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    image_type: ImageType = Form(...),
    patient_id: Optional[str] = Form(None),
    doctor_id: Optional[str] = Form(None),
    prescription_id: Optional[str] = Form(None),
    medicine_id: Optional[str] = Form(None),
    diagnostic_report_id: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    uploaded_by: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload an image to Cloudinary and store metadata in the database.
    Accepts multipart/form-data.
    """
    image_data = ImageBase(
        image_type=image_type,
        patient_id=patient_id,
        doctor_id=doctor_id,
        prescription_id=prescription_id,
        medicine_id=medicine_id,
        diagnostic_report_id=diagnostic_report_id,
        description=description,
        uploaded_by=uploaded_by
    )
    
    db_image = await ImageService.process_and_save_upload(db, file, image_data)
    
    return UploadResponse(
        success=True, 
        message="Image uploaded successfully", 
        image=db_image
    )

@router.get("", response_model=PaginatedImageResponse)
def get_images(
    type: Optional[ImageType] = None,
    patient_id: Optional[str] = None,
    prescription_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    List images with optional filtering and pagination.
    """
    images, total = ImageService.get_images(
        db=db, 
        image_type=type, 
        patient_id=patient_id, 
        prescription_id=prescription_id, 
        skip=skip, 
        limit=limit
    )
    
    return PaginatedImageResponse(items=images, total=total)

@router.get("/{image_id}", response_model=ImageResponse)
def get_single_image(image_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get a single image's metadata by ID.
    """
    db_image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
    return db_image

@router.delete("/{image_id}", response_model=GenericResponse)
def delete_image(image_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Delete an image from Cloudinary and the database.
    """
    success = ImageService.delete_image(db, image_id)
    if success:
        return GenericResponse(success=True, message="Image deleted successfully")
    raise HTTPException(status_code=500, detail="Failed to delete image")
