"""
DynamoDB utility functions for managing consultation records.
"""

import boto3
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key
from .config import CONSULTATIONS_TABLE, AWS_REGION

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table(CONSULTATIONS_TABLE)


def create_consultation(consultation_id, data):
    """Create a new consultation record in DynamoDB."""
    now = datetime.now(timezone.utc).isoformat()
    item = {
        "consultation_id": consultation_id,
        "created_at": now,
        "updated_at": now,
        "status": "processing",
        **data
    }
    table.put_item(Item=item)
    return item


def get_consultation(consultation_id):
    """Get a consultation record by ID."""
    response = table.query(
        KeyConditionExpression=Key("consultation_id").eq(consultation_id),
        ScanIndexForward=False,
        Limit=1
    )
    items = response.get("Items", [])
    return items[0] if items else None


def update_consultation(consultation_id, created_at, updates):
    """Update specific fields in a consultation record."""
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    update_expr_parts = []
    expr_attr_names = {}
    expr_attr_values = {}

    for i, (key, value) in enumerate(updates.items()):
        alias = f"#k{i}"
        val_alias = f":v{i}"
        update_expr_parts.append(f"{alias} = {val_alias}")
        expr_attr_names[alias] = key
        expr_attr_values[val_alias] = value

    update_expression = "SET " + ", ".join(update_expr_parts)

    table.update_item(
        Key={
            "consultation_id": consultation_id,
            "created_at": created_at
        },
        UpdateExpression=update_expression,
        ExpressionAttributeNames=expr_attr_names,
        ExpressionAttributeValues=expr_attr_values
    )


def query_by_doctor(doctor_id, limit=20):
    """Query consultations by doctor ID using GSI."""
    response = table.query(
        IndexName="doctor_id-index",
        KeyConditionExpression=Key("doctor_id").eq(doctor_id),
        ScanIndexForward=False,
        Limit=limit
    )
    return response.get("Items", [])
