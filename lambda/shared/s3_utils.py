"""
S3 utility functions for file upload/download and pre-signed URL generation.
"""

import boto3
import base64
from .config import UPLOADS_BUCKET, AUDIO_BUCKET, AWS_REGION, PRESIGNED_URL_EXPIRY

s3_client = boto3.client("s3", region_name=AWS_REGION)


def generate_presigned_upload_url(key, content_type, bucket=UPLOADS_BUCKET):
    """Generate a pre-signed URL for uploading a file to S3."""
    url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": bucket,
            "Key": key,
            "ContentType": content_type
        },
        ExpiresIn=PRESIGNED_URL_EXPIRY
    )
    return url


def generate_presigned_download_url(key, bucket=AUDIO_BUCKET):
    """Generate a pre-signed URL for downloading a file from S3."""
    url = s3_client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": bucket,
            "Key": key
        },
        ExpiresIn=PRESIGNED_URL_EXPIRY
    )
    return url


def upload_base64_file(key, base64_data, content_type, bucket=UPLOADS_BUCKET):
    """Upload a base64-encoded file to S3."""
    file_bytes = base64.b64decode(base64_data)
    s3_client.put_object(
        Bucket=bucket,
        Key=key,
        Body=file_bytes,
        ContentType=content_type
    )
    return f"s3://{bucket}/{key}"


def download_file_bytes(key, bucket=UPLOADS_BUCKET):
    """Download a file from S3 and return its bytes."""
    response = s3_client.get_object(Bucket=bucket, Key=key)
    return response["Body"].read()


def upload_bytes(key, data, content_type, bucket=AUDIO_BUCKET):
    """Upload raw bytes to S3."""
    s3_client.put_object(
        Bucket=bucket,
        Key=key,
        Body=data,
        ContentType=content_type
    )
    return f"s3://{bucket}/{key}"
