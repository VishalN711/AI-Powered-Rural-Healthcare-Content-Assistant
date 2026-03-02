"""
Generate Audio Lambda — Amazon Polly Handler
Converts translated text to speech using Amazon Polly,
uploads audio to S3, then updates consultation status to pending_review.
"""

import json
import os
import sys
import boto3

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.config import AUDIO_BUCKET, AWS_REGION, POLLY_VOICE_MAP
from shared.db_utils import get_consultation, update_consultation
from shared.s3_utils import upload_bytes, generate_presigned_download_url

polly = boto3.client("polly", region_name=AWS_REGION)


def handler(event, context):
    """
    Invoked asynchronously by generate_content.
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

        # Get consultation with translated content
        consultation = get_consultation(consultation_id)
        if not consultation:
            raise ValueError(f"Consultation {consultation_id} not found")

        # Get the text to convert to speech
        translated_summary = consultation.get("translated_summary", "")
        if not translated_summary:
            raise ValueError("No translated summary available for audio generation")

        # Truncate text if too long for Polly (max ~3000 chars for best quality)
        speech_text = translated_summary[:3000]

        # Get Polly voice settings for the language
        voice_config = POLLY_VOICE_MAP.get(language, POLLY_VOICE_MAP["hindi"])

        # Synthesize speech
        response = polly.synthesize_speech(
            Text=speech_text,
            OutputFormat="mp3",
            VoiceId=voice_config["voice_id"],
            LanguageCode=voice_config["language_code"],
            Engine=voice_config["engine"],
            TextType="text"
        )

        # Read audio stream
        audio_data = response["AudioStream"].read()

        # Upload to S3
        audio_key = f"audio/{consultation_id}/instructions.mp3"
        upload_bytes(audio_key, audio_data, "audio/mpeg", AUDIO_BUCKET)

        # Generate pre-signed download URL
        audio_url = generate_presigned_download_url(audio_key, AUDIO_BUCKET)

        # Update DynamoDB — mark as pending_review
        update_consultation(consultation_id, created_at, {
            "audio_s3_key": audio_key,
            "audio_s3_url": audio_url,
            "status": "pending_review"
        })

        return {
            "status": "completed",
            "audio_key": audio_key,
            "audio_size_bytes": len(audio_data)
        }

    except Exception as e:
        print(f"Error in generate_audio: {str(e)}")
        if "consultation_id" in event:
            update_consultation(
                event["consultation_id"],
                event.get("created_at", ""),
                {"status": "failed", "error_message": f"Audio generation failed: {str(e)}"}
            )
        raise
