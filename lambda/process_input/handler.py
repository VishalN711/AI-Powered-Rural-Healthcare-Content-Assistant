"""
Process Input Lambda — Orchestrator
Accepts doctor input (voice or image), creates consultation record,
generates pre-signed upload URL, and triggers downstream processing.
"""

import json
import uuid
import os
import sys
import boto3

# Add shared layer to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.config import UPLOADS_BUCKET, AWS_REGION
from shared.db_utils import create_consultation
from shared.s3_utils import generate_presigned_upload_url, upload_base64_file
from shared.response_utils import success_response, error_response

lambda_client = boto3.client("lambda", region_name=AWS_REGION)


def handler(event, context):
    """
    POST /consultations
    Body: {
        "input_type": "voice" | "image",
        "language": "hindi" | "tamil" | ...,
        "patient_phone": "+91...",
        "patient_name": "Patient Name",
        "doctor_id": "doctor-uuid",
        "doctor_name": "Dr. Name",
        "file_data": "base64..." (optional - inline upload),
        "file_content_type": "audio/webm" | "image/jpeg" (optional)
    }
    """
    try:
        body = json.loads(event.get("body", "{}"))

        # Validate required fields
        required = ["input_type", "language", "patient_phone", "doctor_id"]
        missing = [f for f in required if f not in body]
        if missing:
            return error_response(f"Missing required fields: {', '.join(missing)}")

        input_type = body["input_type"]
        if input_type not in ("voice", "image"):
            return error_response("input_type must be 'voice' or 'image'")

        language = body["language"].lower()
        consultation_id = str(uuid.uuid4())

        # Determine file extension and content type
        if input_type == "voice":
            ext = "webm"
            content_type = body.get("file_content_type", "audio/webm")
        else:
            ext = "jpg"
            content_type = body.get("file_content_type", "image/jpeg")

        s3_key = f"inputs/{consultation_id}/{input_type}.{ext}"

        # Create the consultation record
        consultation_data = {
            "doctor_id": body["doctor_id"],
            "doctor_name": body.get("doctor_name", ""),
            "patient_phone": body["patient_phone"],
            "patient_name": body.get("patient_name", ""),
            "input_type": input_type,
            "input_s3_key": s3_key,
            "language": language,
            "status": "processing",
            "original_text": "",
            "extracted_medications": [],
            "dosage_schedule": {},
            "precautions": [],
            "translated_summary": "",
            "audio_s3_url": "",
        }

        record = create_consultation(consultation_id, consultation_data)

        # If inline file data is provided, upload it directly
        response_body = {
            "consultation_id": consultation_id,
            "status": "processing",
            "message": "Consultation created successfully"
        }

        if body.get("file_data"):
            upload_base64_file(s3_key, body["file_data"], content_type)

            # Invoke the appropriate downstream Lambda
            next_function = os.environ.get(
                "VOICE_TO_TEXT_FUNCTION" if input_type == "voice" else "IMAGE_TO_TEXT_FUNCTION",
                ""
            )
            if next_function:
                lambda_client.invoke(
                    FunctionName=next_function,
                    InvocationType="Event",  # Async
                    Payload=json.dumps({
                        "consultation_id": consultation_id,
                        "created_at": record["created_at"],
                        "s3_key": s3_key,
                        "language": language
                    })
                )
        else:
            # Generate pre-signed upload URL for client-side upload
            upload_url = generate_presigned_upload_url(s3_key, content_type)
            response_body["upload_url"] = upload_url
            response_body["s3_key"] = s3_key

        return success_response(response_body, 201)

    except Exception as e:
        print(f"Error in process_input: {str(e)}")
        return error_response(f"Internal server error: {str(e)}", 500)
