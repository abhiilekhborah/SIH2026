from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.image import ImageType

class ImageBase(BaseModel):
    image_type: ImageType
    description: Optional[str] = None
    patient_id: Optional[str] = None
    doctor_id: Optional[str] = None
    prescription_id: Optional[str] = None
    medicine_id: Optional[str] = None
    diagnostic_report_id: Optional[str] = None
    uploaded_by: Optional[str] = None

class ImageResponse(ImageBase):
    id: UUID
    public_id: str
    secure_url: str
    original_filename: Optional[str]
    file_size: Optional[int]
    mime_type: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginatedImageResponse(BaseModel):
    items: List[ImageResponse]
    total: int
    
class GenericResponse(BaseModel):
    success: bool
    message: str

class UploadResponse(GenericResponse):
    image: Optional[ImageResponse] = None
