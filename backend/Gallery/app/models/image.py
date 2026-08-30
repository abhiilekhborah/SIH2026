from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from datetime import datetime, timezone
from app.core.database import Base

class ImageType(str, enum.Enum):
    PRESCRIPTION = "PRESCRIPTION"
    MEDICINE = "MEDICINE"
    DIAGNOSTIC_REPORT = "DIAGNOSTIC_REPORT"
    MEDICAL_DOCUMENT = "MEDICAL_DOCUMENT"
    OTHER = "OTHER"

class GalleryImage(Base):
    __tablename__ = "gallery_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    public_id = Column(String, unique=True, index=True, nullable=False)
    secure_url = Column(String, nullable=False)
    
    image_type = Column(Enum(ImageType), nullable=False, index=True)
    
    original_filename = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True) # in bytes
    mime_type = Column(String, nullable=True)
    
    # Optional Relations (represented as UUID strings for flexibility across microservices)
    patient_id = Column(String, nullable=True, index=True)
    doctor_id = Column(String, nullable=True, index=True)
    prescription_id = Column(String, nullable=True, index=True)
    medicine_id = Column(String, nullable=True, index=True)
    diagnostic_report_id = Column(String, nullable=True, index=True)
    
    uploaded_by = Column(String, nullable=True)
    description = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
