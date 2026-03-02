# Rural Healthcare Content Assistant

🏥 **AI-Powered Multilingual Medical Instructions for Rural India**

A serverless AWS-native system that processes doctor inputs (voice recordings & prescription images) and generates patient-friendly, multilingual healthcare instructions delivered via WhatsApp or SMS within 60 seconds.

## Problem

65% of India's rural population struggles to understand medical instructions provided in English or handwritten form. This system bridges that communication gap by:

- Converting voice recordings → text (Amazon Transcribe)
- Converting prescription images → text (Amazon Textract)
- Extracting medications, dosages & precautions (Amazon Bedrock / Claude 3 Sonnet)
- Generating patient-friendly content in 6+ Indian languages (Bedrock)
- Creating audio instructions (Amazon Polly)
- Delivering via WhatsApp / SMS

## Architecture

```
Doctor Input (Voice/Image)
        │
        ▼
  ┌─────────────┐     ┌──────────────┐
  │ API Gateway  │────▶│ Process Input │ (Lambda - Orchestrator)
  └─────────────┘     └──────┬───────┘
                             │
                  ┌──────────┴──────────┐
                  ▼                     ▼
          ┌──────────────┐    ┌──────────────┐
          │ Voice→Text   │    │ Image→Text   │
          │ (Transcribe) │    │ (Textract)   │
          └──────┬───────┘    └──────┬───────┘
                 └──────────┬────────┘
                            ▼
                  ┌──────────────────┐
                  │ Extract Medical  │ (Bedrock Claude 3)
                  │ Information      │
                  └────────┬─────────┘
                           ▼
                  ┌──────────────────┐
                  │ Generate Content │ (Bedrock Claude 3)
                  │ (Multilingual)   │
                  └────────┬─────────┘
                           ▼
                  ┌──────────────────┐
                  │ Generate Audio   │ (Amazon Polly)
                  └────────┬─────────┘
                           ▼
                  ┌──────────────────┐
                  │ Doctor Review    │ ← Doctor approves/edits
                  └────────┬─────────┘
                           ▼
                  ┌──────────────────┐
                  │ Deliver Content  │ → WhatsApp / SMS
                  └──────────────────┘
```

## AWS Services Used

| Service | Purpose |
|---------|---------|
| **API Gateway** | REST API exposure |
| **Lambda** (Python 3.12) | All backend processing (9 functions) |
| **DynamoDB** | Consultation records storage |
| **S3** | Prescription images & generated audio |
| **Bedrock** (Claude 3 Sonnet) | Medical extraction & multilingual generation |
| **Textract** | OCR for prescription images |
| **Transcribe** | Speech-to-text for voice recordings |
| **Polly** | Text-to-speech audio generation |
| **IAM** | Least-privilege access control |
| **CloudWatch** | Monitoring, logging & alarms |

## Supported Languages

🇮🇳 Hindi (हिन्दी) · Tamil (தமிழ்) · Telugu (తెలుగు) · Bengali (বাংলা) · Marathi (मराठी) · Gujarati (ગુજરાતી)

## Project Structure

```
├── infrastructure/          # AWS SAM/CloudFormation
│   ├── template.yaml        # All AWS resources
│   └── samconfig.toml       # Deployment config
├── lambda/                  # Lambda functions (Python)
│   ├── process_input/       # Orchestrator
│   ├── voice_to_text/       # Amazon Transcribe
│   ├── image_to_text/       # Amazon Textract
│   ├── extract_medical_info/# Bedrock NLP extraction
│   ├── generate_content/    # Bedrock multilingual generation
│   ├── generate_audio/      # Amazon Polly TTS
│   ├── doctor_review/       # Review workflow
│   ├── deliver_content/     # WhatsApp/SMS delivery
│   ├── consultation_status/ # Status queries
│   └── shared/              # Shared utilities
├── frontend/                # React + Vite dashboard
│   └── src/
│       ├── api/             # API Gateway client
│       ├── components/      # Reusable UI components
│       └── pages/           # Page views
├── design.md                # System architecture
└── requirements.md          # Requirements document
```

## Quick Start

### Frontend (Development)
```bash
cd frontend
npm install
npm run dev
```

### Backend (AWS Deployment)
```bash
# Prerequisites: AWS CLI, SAM CLI configured
cd infrastructure
sam build
sam deploy --guided
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/consultations` | Submit new consultation |
| `GET` | `/consultations/{id}` | Get consultation details |
| `GET` | `/consultations?doctor_id=` | List by doctor |
| `GET` | `/consultations/{id}/review` | Get for review |
| `PUT` | `/consultations/{id}/review` | Update content |
| `POST` | `/consultations/{id}/approve` | Approve & deliver |

## Output Format (JSON)

```json
{
  "consultation_id": "uuid",
  "original_text": "...",
  "extracted_medications": [...],
  "dosage_schedule": { "morning": [], "afternoon": [], "evening": [], "night": [] },
  "precautions": [...],
  "translated_summary": "...",
  "audio_file_s3_url": "...",
  "language_used": "hindi",
  "timestamp": "ISO-8601"
}
```

## License

MIT
