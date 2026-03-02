"""
Voice-to-Text Lambda — Amazon Transcribe Handler
Converts voice recordings to text using Amazon Transcribe,
then triggers medical info extraction.
"""

import json
import os
import sys
import time
import boto3

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.config import UPLOADS_BUCKET, AWS_REGION
from shared.db_utils import get_consultation, update_consultation
from shared.response_utils import success_response, error_response

transcribe = boto3.client("transcribe", region_name=AWS_REGION)
lambda_client = boto3.client("lambda", region_name=AWS_REGION)


def handler(event, context):
    """
    Invoked asynchronously by process_input Lambda.
    Event: {
        "consultation_id": "uuid",
        "created_at": "iso-timestamp",
        "s3_key": "inputs/uuid/voice.webm",
        "language": "hindi"
    }
    """
    try:
        consultation_id = event["consultation_id"]
        created_at = event["created_at"]
        s3_key = event["s3_key"]
        language = event.get("language", "hindi")

        # Map language to Transcribe language code
        language_map = {
            "hindi": "hi-IN",
            "english": "en-IN",
            "tamil": "ta-IN",
            "telugu": "te-IN",
            "bengali": "bn-IN",
            "marathi": "mr-IN",
            "gujarati": "gu-IN"
        }

        transcribe_lang = language_map.get(language, "en-IN")
        job_name = f"healthcare-{consultation_id}"
        media_uri = f"s3://{UPLOADS_BUCKET}/{s3_key}"

        # Start transcription job
        transcribe.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={"MediaFileUri": media_uri},
            MediaFormat=s3_key.split(".")[-1],
            LanguageCode=transcribe_lang,
            OutputBucketName=UPLOADS_BUCKET,
            OutputKey=f"transcripts/{consultation_id}/output.json",
            Settings={
                "ShowSpeakerLabels": False,
                "ChannelIdentification": False
            }
        )

        # Poll for completion (max ~25 seconds to stay within 60s budget)
        max_wait = 25
        waited = 0
        poll_interval = 2

        while waited < max_wait:
            time.sleep(poll_interval)
            waited += poll_interval

            result = transcribe.get_transcription_job(
                TranscriptionJobName=job_name
            )
            status = result["TranscriptionJob"]["TranscriptionJobStatus"]

            if status == "COMPLETED":
                # Get the transcript text
                transcript_uri = result["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]

                # Read transcript from S3
                s3_client = boto3.client("s3", region_name=AWS_REGION)
                transcript_key = f"transcripts/{consultation_id}/output.json"
                obj = s3_client.get_object(Bucket=UPLOADS_BUCKET, Key=transcript_key)
                transcript_data = json.loads(obj["Body"].read().decode("utf-8"))

                transcribed_text = transcript_data["results"]["transcripts"][0]["transcript"]

                # Update DynamoDB with transcribed text
                update_consultation(consultation_id, created_at, {
                    "original_text": transcribed_text,
                    "status": "text_extracted"
                })

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

                return {"status": "completed", "text": transcribed_text}

            elif status == "FAILED":
                reason = result["TranscriptionJob"].get("FailureReason", "Unknown")
                update_consultation(consultation_id, created_at, {
                    "status": "failed",
                    "error_message": f"Transcription failed: {reason}"
                })
                return {"status": "failed", "error": reason}

        # If we timed out waiting, the job is still running
        update_consultation(consultation_id, created_at, {
            "status": "transcribing"
        })
        return {"status": "pending", "message": "Transcription still in progress"}

    except Exception as e:
        print(f"Error in voice_to_text: {str(e)}")
        if "consultation_id" in event:
            update_consultation(
                event["consultation_id"],
                event.get("created_at", ""),
                {"status": "failed", "error_message": str(e)}
            )
        raise
