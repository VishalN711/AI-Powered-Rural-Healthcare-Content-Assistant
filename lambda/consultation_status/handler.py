"""
Consultation Status Lambda — Status Query Handler
Returns consultation details by ID or lists consultations by doctor.
"""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.db_utils import get_consultation, query_by_doctor
from shared.response_utils import success_response, error_response
from shared.s3_utils import generate_presigned_download_url


def handler(event, context):
    """
    API Gateway routes:
      GET /consultations/{id}           → Get single consultation
      GET /consultations?doctor_id=xxx  → List by doctor
    """
    try:
        path_params = event.get("pathParameters", {}) or {}
        query_params = event.get("queryStringParameters", {}) or {}

        consultation_id = path_params.get("id", "")

        # Single consultation lookup
        if consultation_id:
            consultation = get_consultation(consultation_id)
            if not consultation:
                return error_response("Consultation not found", 404)

            # Refresh audio URL if present
            audio_key = consultation.get("audio_s3_key", "")
            if audio_key:
                consultation["audio_s3_url"] = generate_presigned_download_url(audio_key)

            return success_response({
                "consultation": consultation
            })

        # List by doctor_id
        doctor_id = query_params.get("doctor_id", "")
        if doctor_id:
            limit = int(query_params.get("limit", "20"))
            consultations = query_by_doctor(doctor_id, limit=limit)

            return success_response({
                "consultations": consultations,
                "count": len(consultations)
            })

        return error_response("Provide consultation ID or doctor_id query parameter", 400)

    except Exception as e:
        print(f"Error in consultation_status: {str(e)}")
        return error_response(f"Internal server error: {str(e)}", 500)
