"""
Configuration module for Lambda functions.
Reads all settings from environment variables set by CloudFormation/SAM.
"""

import os

# AWS Region
AWS_REGION = os.environ.get("AWS_REGION", "ap-south-1")

# DynamoDB
CONSULTATIONS_TABLE = os.environ.get("CONSULTATIONS_TABLE", "Consultations")

# S3 Buckets
UPLOADS_BUCKET = os.environ.get("UPLOADS_BUCKET", "healthcare-uploads")
AUDIO_BUCKET = os.environ.get("AUDIO_BUCKET", "healthcare-audio")

# Amazon Bedrock
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")
BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")

# Amazon Transcribe
TRANSCRIBE_LANGUAGE_CODE = os.environ.get("TRANSCRIBE_LANGUAGE_CODE", "en-IN")

# Amazon Polly – Voice mapping for Indian languages
POLLY_VOICE_MAP = {
    "hindi": {"voice_id": "Aditi", "language_code": "hi-IN", "engine": "standard"},
    "tamil": {"voice_id": "Aditi", "language_code": "hi-IN", "engine": "standard"},
    "telugu": {"voice_id": "Aditi", "language_code": "hi-IN", "engine": "standard"},
    "bengali": {"voice_id": "Aditi", "language_code": "hi-IN", "engine": "standard"},
    "marathi": {"voice_id": "Aditi", "language_code": "hi-IN", "engine": "standard"},
    "gujarati": {"voice_id": "Aditi", "language_code": "hi-IN", "engine": "standard"},
}

# Pre-signed URL expiry (seconds)
PRESIGNED_URL_EXPIRY = int(os.environ.get("PRESIGNED_URL_EXPIRY", "3600"))

# Delivery settings
WHATSAPP_API_URL = os.environ.get("WHATSAPP_API_URL", "")
WHATSAPP_API_TOKEN = os.environ.get("WHATSAPP_API_TOKEN", "")
SMS_GATEWAY_URL = os.environ.get("SMS_GATEWAY_URL", "")
SMS_API_KEY = os.environ.get("SMS_API_KEY", "")

# Processing timeouts
MAX_PROCESSING_SECONDS = 60
DOCTOR_REVIEW_TIMEOUT_MINUTES = 5

# Supported languages
SUPPORTED_LANGUAGES = [
    "hindi", "tamil", "telugu", "bengali", "marathi", "gujarati"
]
