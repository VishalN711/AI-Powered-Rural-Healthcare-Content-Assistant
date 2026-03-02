"""
Image-to-Text Lambda — Amazon Textract Handler
Extracts text from prescription images using Amazon Textract,
then triggers medical info extraction.
"""

import json
import os
import sys
import boto3

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.config import UPLOADS_BUCKET, AWS_REGION
from shared.db_utils import update_consultation
from shared.s3_utils import download_file_bytes

textract = boto3.client("textract", region_name=AWS_REGION)
lambda_client = boto3.client("lambda", region_name=AWS_REGION)


def handler(event, context):
    """
    Invoked asynchronously by process_input Lambda.
    Event: {
        "consultation_id": "uuid",
        "created_at": "iso-timestamp",
        "s3_key": "inputs/uuid/image.jpg",
        "language": "hindi"
    }
    """
    try:
        consultation_id = event["consultation_id"]
        created_at = event["created_at"]
        s3_key = event["s3_key"]
        language = event.get("language", "hindi")

        # Call Textract synchronous API (works for single-page documents)
        response = textract.detect_document_text(
            Document={
                "S3Object": {
                    "Bucket": UPLOADS_BUCKET,
                    "Name": s3_key
                }
            }
        )

        # Extract text blocks and their confidence scores
        lines = []
        low_confidence_lines = []

        for block in response.get("Blocks", []):
            if block["BlockType"] == "LINE":
                text = block.get("Text", "")
                confidence = block.get("Confidence", 0)

                lines.append(text)
                if confidence < 80:
                    low_confidence_lines.append({
                        "text": text,
                        "confidence": round(confidence, 2)
                    })

        extracted_text = "\n".join(lines)

        # Update DynamoDB
        updates = {
            "original_text": extracted_text,
            "status": "text_extracted"
        }

        if low_confidence_lines:
            updates["ocr_warnings"] = json.dumps(low_confidence_lines)

        update_consultation(consultation_id, created_at, updates)

        # Invoke medical info extraction
        extract_function = os.environ.get("EXTRACT_MEDICAL_INFO_FUNCTION", "")
        if extract_function:
            lambda_client.invoke(
                FunctionName=extract_function,
                InvocationType="Event",
                Payload=json.dumps({
                    "consultation_id": consultation_id,
                    "created_at": created_at,
                    "language": language
                })
            )

        return {
            "status": "completed",
            "text_length": len(extracted_text),
            "lines_extracted": len(lines),
            "low_confidence_count": len(low_confidence_lines)
        }

    except Exception as e:
        print(f"Error in image_to_text: {str(e)}")
        if "consultation_id" in event:
            update_consultation(
                event["consultation_id"],
                event.get("created_at", ""),
                {"status": "failed", "error_message": f"OCR failed: {str(e)}"}
            )
        raise
