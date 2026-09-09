from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from typing import Optional, List
from app.models.image import GalleryImage, ImageType
from app.schemas.image import ImageBase, ImageResponse
from app.services.cloudinary_service import CloudinaryService
import uuid

class ImageService:
    
    ALLOWED_EXTENSIONS = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

    @staticmethod
    def _validate_file(file: UploadFile):
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")
            
        if file.content_type not in ImageService.ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Unsupported image format. Allowed: jpg, jpeg, png, webp")

    @staticmethod
    async def process_and_save_upload(
        db: Session, 
        file: UploadFile, 
        image_data: ImageBase
    ) -> GalleryImage:
        
        ImageService._validate_file(file)
        
        # Read file size from FastAPI's UploadFile attribute
        file_size = getattr(file, 'size', 0)
        
        if file_size == 0:
            # Fallback if size attribute is missing but file might be empty
            content = await file.read(1)
            if not content:
                raise HTTPException(status_code=400, detail="Empty file uploaded")
            await file.seek(0)
            
        if file_size and file_size > ImageService.MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB")

        # Determine related_id for folder structure
        related_id = (
            image_data.patient_id or 
            image_data.medicine_id or 
            image_data.doctor_id or 
            image_data.prescription_id or 
            image_data.diagnostic_report_id
        )

        # Upload to Cloudinary
        try:
            cloud_response = await CloudinaryService.upload_image(file, image_data.image_type.value, related_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

        # Save to Database
        try:
            db_image = GalleryImage(
                public_id=cloud_response['public_id'],
                secure_url=cloud_response['secure_url'],
                image_type=image_data.image_type,
                original_filename=file.filename,
                file_size=file_size,
                mime_type=file.content_type,
                patient_id=image_data.patient_id,
                doctor_id=image_data.doctor_id,
                prescription_id=image_data.prescription_id,
                medicine_id=image_data.medicine_id,
                diagnostic_report_id=image_data.diagnostic_report_id,
                uploaded_by=image_data.uploaded_by,
                description=image_data.description
            )
            
            db.add(db_image)
            db.commit()
            db.refresh(db_image)
            return db_image
            
        except Exception as e:
            db.rollback()
            # If DB save fails, clean up Cloudinary to prevent orphans
            CloudinaryService.delete_image(cloud_response['public_id'])
            raise HTTPException(status_code=500, detail=f"Database save failed: {str(e)}")

    @staticmethod
    def delete_image(db: Session, image_id: uuid.UUID) -> bool:
        db_image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
        if not db_image:
            raise HTTPException(status_code=404, detail="Image not found")
            
        # Delete from Cloudinary
        cloud_success = CloudinaryService.delete_image(db_image.public_id)
        if not cloud_success:
            raise HTTPException(status_code=500, detail="Failed to delete image from Cloudinary")
            
        # Delete from Database
        try:
            db.delete(db_image)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to delete database record: {str(e)}")

    @staticmethod
    def get_images(
        db: Session, 
        image_type: Optional[ImageType] = None,
        patient_id: Optional[str] = None,
        prescription_id: Optional[str] = None,
        skip: int = 0, 
        limit: int = 50
    ) -> (List[GalleryImage], int):
        
        query = db.query(GalleryImage)
        
        if image_type:
            query = query.filter(GalleryImage.image_type == image_type)
        if patient_id:
            query = query.filter(GalleryImage.patient_id == patient_id)
        if prescription_id:
            query = query.filter(GalleryImage.prescription_id == prescription_id)
            
        total = query.count()
        images = query.order_by(GalleryImage.created_at.desc()).offset(skip).limit(limit).all()
        
        return images, total
