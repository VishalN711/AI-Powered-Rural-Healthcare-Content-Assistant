"""
Doctor Review Lambda — Review Workflow Handler
Supports GET (fetch for review), PUT (edit), and POST /approve flow.
"""

import json
import os
import sys
import boto3

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.config import AWS_REGION
from shared.db_utils import get_consultation, update_consultation
from shared.response_utils import success_response, error_response

lambda_client = boto3.client("lambda", region_name=AWS_REGION)


def handler(event, context):
    """
    API Gateway routes:
      GET  /consultations/{id}/review   → Fetch consultation for review
      PUT  /consultations/{id}/review   → Update/correct content
      POST /consultations/{id}/approve  → Approve and trigger delivery
    """
    try:
        http_method = event.get("httpMethod", "GET")
        path_params = event.get("pathParameters", {}) or {}
        consultation_id = path_params.get("id", "")

        if not consultation_id:
            return error_response("Missing consultation ID", 400)

        # Fetch the consultation
        consultation = get_consultation(consultation_id)
        if not consultation:
            return error_response("Consultation not found", 404)

        created_at = consultation["created_at"]

        # GET — Return consultation for doctor review
        if http_method == "GET":
            review_data = {
                "consultation_id": consultation["consultation_id"],
                "status": consultation["status"],
                "input_type": consultation.get("input_type", ""),
                "language": consultation.get("language", ""),
                "original_text": consultation.get("original_text", ""),
                "extracted_medications": consultation.get("extracted_medications", []),
                "dosage_schedule": consultation.get("dosage_schedule", {}),
                "precautions": consultation.get("precautions", []),
                "translated_summary": consultation.get("translated_summary", ""),
                "whatsapp_message": consultation.get("whatsapp_message", ""),
                "audio_s3_url": consultation.get("audio_s3_url", ""),
                "patient_name": consultation.get("patient_name", ""),
                "patient_phone": consultation.get("patient_phone", ""),
                "created_at": created_at
            }
            return success_response(review_data)

        # PUT — Doctor edits/corrects the generated content
        elif http_method == "PUT":
            body = json.loads(event.get("body", "{}"))

            allowed_fields = [
                "translated_summary", "dosage_schedule", "precautions",
                "extracted_medications", "whatsapp_message",
                "doctor_review_notes"
            ]

            updates = {}
            for field in allowed_fields:
                if field in body:
                    updates[field] = body[field]

            if not updates:
                return error_response("No valid fields to update", 400)

            updates["status"] = "reviewed"
            update_consultation(consultation_id, created_at, updates)

            return success_response({
                "consultation_id": consultation_id,
                "message": "Consultation updated successfully",
                "updated_fields": list(updates.keys())
            })

        # POST — Approve and trigger delivery
        elif http_method == "POST":
            # Check if the path indicates approval
            path = event.get("path", "")

            update_consultation(consultation_id, created_at, {
                "status": "approved",
                "doctor_review_notes": json.loads(
                    event.get("body", "{}")
                ).get("notes", "Approved by doctor")
            })

            # Trigger delivery
            deliver_function = os.environ.get("DELIVER_CONTENT_FUNCTION", "")
            if deliver_function:
                lambda_client.invoke(
                    FunctionName=deliver_function,
                    InvocationType="Event",
                    Payload=json.dumps({
                        "consultation_id": consultation_id,
                        "created_at": created_at
                    })
                )

            return success_response({
                "consultation_id": consultation_id,
                "status": "approved",
                "message": "Consultation approved. Delivery in progress."
            })

        else:
            return error_response(f"Unsupported method: {http_method}", 405)

    except Exception as e:
        print(f"Error in doctor_review: {str(e)}")
        return error_response(f"Internal server error: {str(e)}", 500)
