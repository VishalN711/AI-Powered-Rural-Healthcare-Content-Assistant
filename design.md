# Design Document: Rural Healthcare Content Assistant

## Overview

The Rural Healthcare Content Assistant is an AI-powered system designed to bridge the healthcare communication gap between doctors and rural patients in India. The system addresses the critical challenge that 65% of India's rural population faces in understanding medical instructions, which are typically given in English or as handwritten notes.

The system accepts two types of input from doctors:
1. **Voice recordings** - Doctors can verbally record consultation instructions
2. **Prescription images** - Photos of handwritten or printed prescriptions

The system then processes this input and generates patient-friendly content in the patient's native language (Hindi or other regional languages), including:
- Text summary of the treatment plan
- Bullet-list dosage chart organized by time of day
- Audio instructions explaining key treatment steps

All content is delivered via WhatsApp or SMS within 60 seconds, ensuring patients receive clear, understandable medical instructions they can reference on their mobile devices.

Key features:
- Supports 6+ Indian regional languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati)
- Processes voice and image inputs using speech recognition and OCR
- Extracts medications, dosages, and instructions using medical NLP
- Generates multilingual content with culturally appropriate terminology
- Delivers via WhatsApp Business API or SMS gateway
- Includes doctor review workflow for accuracy verification
- Maintains medical accuracy and data privacy compliance

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────────────────┐      │
│  │ Doctor Mobile│    │ Doctor Web   │    │ Clinic Management       │      │
│  │     App      │    │   Portal     │    │      System             │      │
│  └──────┬───────┘    └──────┬───────┘    └───────────┬─────────────┘      │
└─────────┼────────────────────┼────────────────────────┼────────────────────┘
          │                    │                        │
          └────────────────────┼────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Load Balancer / API Gateway                                          │ │
│  │  • Authentication Service (JWT)                                       │ │
│  │  • Rate Limiter (100 req/min)                                        │ │
│  └───────────────────────────┬───────────────────────────────────────────┘ │
└────────────────────────────────┼───────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INPUT PROCESSING SERVICES                                 │
│  ┌──────────────────────┐         ┌──────────────────────┐                 │
│  │  Speech Recognition  │         │    OCR Service       │                 │
│  │  (Voice → Text)      │         │  (Image → Text)      │                 │
│  └──────────┬───────────┘         └──────────┬───────────┘                 │
│             └────────────┬──────────────────┘                               │
│                          ▼                                                   │
│              ┌───────────────────────┐                                      │
│              │   Input Validator     │                                      │
│              └───────────┬───────────┘                                      │
└──────────────────────────┼──────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CORE PROCESSING SERVICES                                  │
│                                                                              │
│  ┌──────────────────────┐                                                   │
│  │ Medical NLP Extractor│ ◄──────────┐                                     │
│  │ (Extract Medications)│            │                                     │
│  └──────────┬───────────┘            │                                     │
│             ▼                         │ (if corrections)                    │
│  ┌──────────────────────┐            │                                     │
│  │  Content Validator   │            │                                     │
│  │ (Check Safety/Dosage)│            │                                     │
│  └──────────┬───────────┘            │                                     │
│             ▼                         │                                     │
│  ┌──────────────────────┐            │                                     │
│  │ Translation Service  │            │                                     │
│  │ (English → Regional) │            │                                     │
│  └──────────┬───────────┘            │                                     │
│             ▼                         │                                     │
│  ┌──────────────────────┐            │                                     │
│  │  Content Formatter   │            │                                     │
│  │ (Summary + Chart)    │            │                                     │
│  └──────────┬───────────┘            │                                     │
│             ▼                         │                                     │
│  ┌──────────────────────┐            │                                     │
│  │  Audio Generator     │            │                                     │
│  │  (Text-to-Speech)    │            │                                     │
│  └──────────┬───────────┘            │                                     │
└─────────────┼────────────────────────┼─────────────────────────────────────┘
              ▼                         │
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                                    │
│  ┌──────────────────────┐                                                   │
│  │ Doctor Review Service│                                                   │
│  │ (Approve/Correct)    │───────────────┘                                  │
│  └──────────┬───────────┘                                                   │
│             ▼ (approved)                                                     │
│  ┌──────────────────────┐                                                   │
│  │ Delivery Orchestrator│                                                   │
│  │ (Route & Retry)      │                                                   │
│  └──────────┬───────────┘                                                   │
│             ▼                                                                │
│  ┌──────────────────────┐                                                   │
│  │ Notification Service │                                                   │
│  └──────────┬───────────┘                                                   │
└─────────────┼────────────────────────────────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL INTEGRATIONS                                    │
│  ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐              │
│  │ WhatsApp Business│  │ SMS Gateway  │  │ Cloud Storage   │              │
│  │      API         │  │  (Twilio)    │  │     (S3)        │              │
│  └──────────────────┘  └──────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                         │
│  ┌──────────────────┐  ┌──────────────┐  ┌─────────────────────────┐      │
│  │   PostgreSQL     │  │ Redis Cache  │  │ Medical Knowledge Base  │      │
│  │ (Patient Data,   │  │ (Translation │  │ (Drug Info,             │      │
│  │  Consultations)  │  │  & Sessions) │  │  Interactions)          │      │
│  └──────────────────┘  └──────────────┘  └─────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      MONITORING & ANALYTICS                                  │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────┐               │
│  │   Logging    │  │ Metrics Dashboard│  │  Alert System  │               │
│  │   Service    │  │ (Performance)    │  │  (Failures)    │               │
│  └──────────────┘  └──────────────────┘  └────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Doctor Input** → Doctor submits voice recording or prescription image via mobile app/web portal
2. **Authentication** → API Gateway validates doctor credentials and applies rate limiting
3. **Input Processing** → Speech Recognition or OCR converts input to text
4. **Medical Extraction** → NLP extracts medications, dosages, timing, and instructions
5. **Validation** → System checks for drug interactions and dosage safety
6. **Translation** → Content translated to patient's preferred regional language
7. **Formatting** → System generates text summary and dosage chart
8. **Audio Generation** → Text-to-speech creates audio instructions
9. **Doctor Review** → Doctor approves or corrects the generated content
10. **Delivery** → Content sent to patient via WhatsApp or SMS
11. **Confirmation** → Doctor receives delivery confirmation

### Architecture Components

**Client Layer**: Multiple entry points for doctors to submit consultations
- Mobile app for on-the-go voice recordings
- Web portal for image uploads and bulk processing
- API integration for existing clinic management systems

**API Gateway**: Centralized entry point with security and traffic management
- Load balancing across service instances
- JWT-based authentication and authorization
- Rate limiting to prevent abuse

**Input Processing Services**: Specialized microservices for different input types
- Speech Recognition: Converts voice recordings to text (supports Hindi/English)
- OCR Service: Extracts text from prescription images (handwritten and printed)
- Input Validator: Checks file formats, sizes, and quality before processing

**Core Processing Services**: Business logic for medical content transformation
- Medical NLP Extractor: Identifies medications, dosages, timing, and instructions
- Content Validator: Checks dosages, flags interactions, ensures completeness
- Translation Service: Converts content to target regional language
- Content Formatter: Generates SMS-friendly summaries and dosage charts
- Audio Generator: Produces spoken instructions using text-to-speech

**Business Logic Layer**: Orchestration and workflow management
- Doctor Review Service: Manages approval workflow with 5-minute timeout
- Delivery Orchestrator: Routes to WhatsApp/SMS with retry logic
- Notification Service: Sends delivery confirmations to doctors

**External Integrations**: Third-party services for delivery
- WhatsApp Business API for rich media messages
- SMS Gateway for text-only fallback
- Cloud Storage for audio files and prescription images

**Data Layer**: Persistent storage and caching
- PostgreSQL: Patient profiles, consultations, prescriptions, delivery logs
- Redis: Translation cache, session management, rate limiting
- Medical Knowledge Base: Drug information, interactions, dosage guidelines

**Monitoring & Analytics**: Observability and operational intelligence
- Logging Service: Centralized logs for debugging and audit
- Metrics Dashboard: Processing times, accuracy rates, delivery success
- Alert System: Notifications for failures, high error rates, or safety issues

### Technology Stack

- **Cloud Platform**: AWS or Google Cloud Platform
- **Speech Recognition**: Google Cloud Speech-to-Text API
- **OCR**: Google Cloud Vision API
- **NLP Models**: IndicBERT, BioBERT, custom medical entity extraction models
- **Translation**: Google Cloud Translation API with medical terminology layer
- **Text-to-Speech**: Google Cloud TTS (supports 6+ Indian languages)
- **Message Delivery**: Twilio WhatsApp Business API, AWS SNS/Twilio SMS
- **Backend**: Python with FastAPI
- **Task Queue**: Redis + Celery for asynchronous processing
- **Database**: PostgreSQL for structured data, S3 for file storage
- **Caching**: Redis
