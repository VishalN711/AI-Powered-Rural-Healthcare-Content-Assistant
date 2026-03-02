"""
Extract Medical Info Lambda — Amazon Bedrock Handler
Uses Claude 3 Sonnet to extract structured medical information
from transcribed/OCR text, then triggers content generation.
"""

import json
import os
import sys
import boto3

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.config import BEDROCK_MODEL_ID, BEDROCK_REGION
from shared.db_utils import get_consultation, update_consultation

bedrock = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)
lambda_client = boto3.client("lambda", region_name=os.environ.get("AWS_REGION", "ap-south-1"))

EXTRACTION_PROMPT = """You are a medical information extraction assistant. Your task is to extract structured medical information from the following doctor's prescription or consultation notes.

IMPORTANT RULES:
- Extract EXACT medication names, dosages, and frequencies as written
- Do NOT alter any dosage amounts or units
- If information is unclear or ambiguous, mark it with "VERIFY" flag
- Use standard medical abbreviations where appropriate
- Organize medications clearly

INPUT TEXT:
{input_text}

Return ONLY a valid JSON object with this exact structure:
{{
    "extracted_medications": [
        {{
            "name": "medication name",
            "dosage": "dosage amount and unit",
            "frequency": "how often (e.g., twice daily, three times a day)",
            "duration": "how long to take (e.g., 5 days, 2 weeks)",
            "instructions": "special instructions (e.g., take after food)",
            "needs_verification": false
        }}
    ],
    "precautions": [
        "precaution or warning text"
    ],
    "diagnosis": "extracted diagnosis if mentioned",
    "follow_up": "follow-up instructions if mentioned",
    "confidence_score": 0.95
}}"""


def handler(event, context):
    """
    Invoked asynchronously by voice_to_text or image_to_text.
    Event: {
        "consultation_id": "uuid",
        "created_at": "iso-timestamp",
        "language": "hindi"
    }
    """
    try:
        consultation_id = event["consultation_id"]
        created_at = event["created_at"]
        language = event.get("language", "hindi")

        # Get the consultation record with original text
        consultation = get_consultation(consultation_id)
        if not consultation:
            raise ValueError(f"Consultation {consultation_id} not found")

        original_text = consultation.get("original_text", "")
        if not original_text:
            raise ValueError("No text available for extraction")

        # Build the prompt
        prompt = EXTRACTION_PROMPT.format(input_text=original_text)

        # Invoke Bedrock Claude 3 Sonnet
        request_body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "temperature": 0.1,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })

        response = bedrock.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=request_body
        )

        response_body = json.loads(response["body"].read())
        assistant_text = response_body["content"][0]["text"]

        # Parse the JSON from Claude's response
        # Handle potential markdown code blocks in response
        json_text = assistant_text.strip()
        if json_text.startswith("```"):
            json_text = json_text.split("\n", 1)[1]
            json_text = json_text.rsplit("```", 1)[0]

        extracted_data = json.loads(json_text)

        # Update DynamoDB with extracted medical info
        update_consultation(consultation_id, created_at, {
            "extracted_medications": extracted_data.get("extracted_medications", []),
            "precautions": extracted_data.get("precautions", []),
            "diagnosis": extracted_data.get("diagnosis", ""),
            "follow_up": extracted_data.get("follow_up", ""),
            "extraction_confidence": str(extracted_data.get("confidence_score", 0)),
            "status": "info_extracted"
        })

        # Invoke content generation
        generate_function = os.environ.get("GENERATE_CONTENT_FUNCTION", "")
        if generate_function:
            lambda_client.invoke(
                FunctionName=generate_function,
                InvocationType="Event",
                Payload=json.dumps({
                    "consultation_id": consultation_id,
                    "created_at": created_at,
                    "language": language
                })
            )

        return {
            "status": "completed",
            "medications_found": len(extracted_data.get("extracted_medications", [])),
            "precautions_found": len(extracted_data.get("precautions", []))
        }

    except json.JSONDecodeError as e:
        print(f"JSON parse error from Bedrock response: {str(e)}")
        update_consultation(
            event["consultation_id"],
            event.get("created_at", ""),
            {"status": "failed", "error_message": f"Failed to parse AI response: {str(e)}"}
        )
        raise

    except Exception as e:
        print(f"Error in extract_medical_info: {str(e)}")
        if "consultation_id" in event:
            update_consultation(
                event["consultation_id"],
                event.get("created_at", ""),
                {"status": "failed", "error_message": str(e)}
            )
        raise
