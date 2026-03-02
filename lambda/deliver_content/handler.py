"""
Deliver Content Lambda — WhatsApp/SMS Delivery Handler
Delivers approved content to patients via WhatsApp Business API
or SMS gateway, with retry logic.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.config import (
    WHATSAPP_API_URL, WHATSAPP_API_TOKEN,
    SMS_GATEWAY_URL, SMS_API_KEY
)
from shared.db_utils import get_consultation, update_consultation
from shared.s3_utils import generate_presigned_download_url


MAX_RETRIES = 3
RETRY_BASE_DELAY = 2  # seconds


def send_whatsapp_message(phone, message, media_url=None):
    """Send a message via WhatsApp Business API."""
    if not WHATSAPP_API_URL:
        print("WhatsApp API URL not configured — simulating delivery")
        return {"status": "simulated", "message_id": "sim-wa-001"}

    if media_url:
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "audio",
            "audio": {"link": media_url}
        }
    else:
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "text",
            "text": {"body": message}
        }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        WHATSAPP_API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {WHATSAPP_API_TOKEN}"
        }
    )

    response = urllib.request.urlopen(req)
    return json.loads(response.read().decode("utf-8"))


def send_sms(phone, message):
    """Send a message via SMS gateway."""
    if not SMS_GATEWAY_URL:
        print("SMS Gateway URL not configured — simulating delivery")
        return {"status": "simulated", "message_id": "sim-sms-001"}

    payload = {
        "to": phone,
        "message": message,
        "api_key": SMS_API_KEY
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        SMS_GATEWAY_URL,
        data=data,
        headers={"Content-Type": "application/json"}
    )

    response = urllib.request.urlopen(req)
    return json.loads(response.read().decode("utf-8"))


def deliver_with_retry(deliver_fn, *args):
    """Execute delivery function with exponential backoff retry."""
    last_error = Exception("All delivery attempts failed")
    for attempt in range(MAX_RETRIES):
        try:
            result = deliver_fn(*args)
            return result
        except Exception as e:
            last_error = e
            delay = RETRY_BASE_DELAY * (2 ** attempt)
            print(f"Delivery attempt {attempt + 1} failed: {str(e)}. Retrying in {delay}s...")
            time.sleep(delay)

    raise last_error


def handler(event, context):
    """
    Invoked asynchronously after doctor approval.
    Event: {
        "consultation_id": "uuid",
        "created_at": "iso-timestamp"
    }
    """
    try:
        consultation_id = event["consultation_id"]
        created_at = event["created_at"]

        # Get approved consultation
        consultation = get_consultation(consultation_id)
        if not consultation:
            raise ValueError(f"Consultation {consultation_id} not found")

        phone = consultation.get("patient_phone", "")
        whatsapp_message = consultation.get("whatsapp_message", "")
        translated_summary = consultation.get("translated_summary", "")
        audio_s3_key = consultation.get("audio_s3_key", "")

        # Generate fresh audio download URL
        audio_url = ""
        if audio_s3_key:
            audio_url = generate_presigned_download_url(audio_s3_key)

        # Determine delivery channel — try WhatsApp first, fall back to SMS
        delivery_results = []

        # Message to send
        message_text = whatsapp_message or translated_summary
        if not message_text:
            raise ValueError("No content available for delivery")

        try:
            # Try WhatsApp delivery
            # Message 1: Text summary with dosage info
            result = deliver_with_retry(send_whatsapp_message, phone, message_text)
            delivery_results.append({"channel": "whatsapp", "type": "text", "result": result})

            # Message 2: Audio file (if available)
            if audio_url:
                result = deliver_with_retry(send_whatsapp_message, phone, None, audio_url)
                delivery_results.append({"channel": "whatsapp", "type": "audio", "result": result})

        except Exception as wa_error:
            print(f"WhatsApp delivery failed: {str(wa_error)}. Falling back to SMS.")

            # Fallback to SMS
            sms_message = translated_summary[:160] if translated_summary else message_text[:160]
            if audio_url:
                sms_message = f"{sms_message[:120]}\n\nAudio: {audio_url}"

            result = deliver_with_retry(send_sms, phone, sms_message)
            delivery_results.append({"channel": "sms", "type": "text", "result": result})

        # Update consultation as delivered
        now = datetime.now(timezone.utc).isoformat()
        update_consultation(consultation_id, created_at, {
            "status": "delivered",
            "delivered_at": now,
            "delivery_results": json.dumps(delivery_results)
        })

        return {
            "status": "delivered",
            "consultation_id": consultation_id,
            "delivery_count": len(delivery_results)
        }

    except Exception as e:
        print(f"Error in deliver_content: {str(e)}")
        if "consultation_id" in event:
            update_consultation(
                event["consultation_id"],
                event.get("created_at", ""),
                {"status": "delivery_failed", "error_message": str(e)}
            )
        raise
