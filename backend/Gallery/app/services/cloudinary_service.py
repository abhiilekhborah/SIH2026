import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv
from fastapi import UploadFile

load_dotenv()

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

class CloudinaryService:
    @staticmethod
    def _generate_folder_path(image_type: str, related_id: str = None) -> str:
        """Generate logical folder structure based on type and related entity."""
        base_folder = "mediquick"
        
        folder_map = {
            "PRESCRIPTION": "prescriptions",
            "MEDICINE": "medicines",
            "DIAGNOSTIC_REPORT": "diagnostic_reports",
            "MEDICAL_DOCUMENT": "medical_documents",
            "OTHER": "other"
        }
        
        category = folder_map.get(image_type, "other")
        
        if related_id:
            return f"{base_folder}/{category}/{related_id}"
        return f"{base_folder}/{category}"

    @classmethod
    async def upload_image(cls, file: UploadFile, image_type: str, related_id: str = None) -> dict:
        """
        Upload an image to Cloudinary.
        Returns a dict with 'secure_url', 'public_id', 'format', 'bytes'.
        """
        folder = cls._generate_folder_path(image_type, related_id)
        
        # Read file content for upload
        file_content = await file.read()
        
        try:
            # Upload to Cloudinary
            response = cloudinary.uploader.upload(
                file_content,
                folder=folder,
                resource_type="image"
            )
            return response
        except Exception as e:
            raise Exception(f"Cloudinary upload failed: {str(e)}")

    @classmethod
    def delete_image(cls, public_id: str) -> bool:
        """
        Delete an image from Cloudinary using its public_id.
        """
        try:
            response = cloudinary.uploader.destroy(public_id)
            return response.get('result') == 'ok'
        except Exception as e:
            raise Exception(f"Cloudinary deletion failed: {str(e)}")
