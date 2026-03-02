"""
Generate Content Lambda — Amazon Bedrock Handler
Uses Claude 3 Sonnet to generate patient-friendly, multilingual
healthcare instructions from extracted medical data.
Then triggers audio generation.
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

CONTENT_GENERATION_PROMPT = """You are a healthcare communication assistant helping rural patients in India understand their medical instructions. Generate patient-friendly content in {language}.

CRITICAL RULES:
- Use simple, everyday language — avoid ALL medical jargon
- Use culturally appropriate terminology for India
- Make dosage instructions extremely clear with emoji markers
- Structure for easy reading on a basic mobile phone
- Ensure complete medical accuracy — never change dosage amounts
- Include relevant food/lifestyle precautions
- Format for WhatsApp readability (short lines, bullet points)

EXTRACTED MEDICAL INFORMATION:
Medications: {medications}
Precautions: {precautions}
Diagnosis: {diagnosis}
Follow-up: {follow_up}

Generate the response in {language} language with this exact JSON structure:
{{
    "translated_summary": "A complete treatment summary in {language} (2-3 paragraphs, simple language)",
    "dosage_schedule": {{
        "morning": [
            {{
                "medicine": "medicine name in {language}",
                "dosage": "amount",
                "instructions": "e.g., after breakfast"
            }}
        ],
        "afternoon": [],
        "evening": [],
        "night": []
    }},
    "precautions_translated": [
        "precaution in {language}"
    ],
    "whatsapp_message": "Complete formatted WhatsApp message in {language} with emojis and clear structure"
}}

IMPORTANT: Generate ALL text content in {language} language. Use the script native to {language} (e.g., Devanagari for Hindi, Tamil script for Tamil, etc.)."""


def handler(event, context):
    """
    Invoked asynchronously by extract_medical_info.
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

        # Get consultation with extracted data
        consultation = get_consultation(consultation_id)
        if not consultation:
            raise ValueError(f"Consultation {consultation_id} not found")

        medications = consultation.get("extracted_medications", [])
        precautions = consultation.get("precautions", [])
        diagnosis = consultation.get("diagnosis", "")
        follow_up = consultation.get("follow_up", "")

        # Build prompt
        prompt = CONTENT_GENERATION_PROMPT.format(
            language=language,
            medications=json.dumps(medications, ensure_ascii=False),
            precautions=json.dumps(precautions, ensure_ascii=False),
            diagnosis=diagnosis,
            follow_up=follow_up
        )

        # Invoke Bedrock
        request_body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4096,
            "temperature": 0.3,
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

        # Parse JSON response
        json_text = assistant_text.strip()
        if json_text.startswith("```"):
            json_text = json_text.split("\n", 1)[1]
            json_text = json_text.rsplit("```", 1)[0]

        generated_content = json.loads(json_text)

        # Update DynamoDB
        update_consultation(consultation_id, created_at, {
            "translated_summary": generated_content.get("translated_summary", ""),
            "dosage_schedule": generated_content.get("dosage_schedule", {}),
            "precautions_translated": generated_content.get("precautions_translated", []),
            "whatsapp_message": generated_content.get("whatsapp_message", ""),
            "language_used": language,
            "status": "content_generated"
        })

        # Invoke audio generation
        audio_function = os.environ.get("GENERATE_AUDIO_FUNCTION", "")
        if audio_function:
            lambda_client.invoke(
                FunctionName=audio_function,
                InvocationType="Event",
                Payload=json.dumps({
                    "consultation_id": consultation_id,
                    "created_at": created_at,
                    "language": language
                })
            )

        return {
            "status": "completed",
            "language": language
        }

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {str(e)}")
        update_consultation(
            event["consultation_id"],
            event.get("created_at", ""),
            {"status": "failed", "error_message": f"Content generation parse error: {str(e)}"}
        )
        raise

    except Exception as e:
        print(f"Error in generate_content: {str(e)}")
        if "consultation_id" in event:
            update_consultation(
                event["consultation_id"],
                event.get("created_at", ""),
                {"status": "failed", "error_message": str(e)}
            )
        raise
