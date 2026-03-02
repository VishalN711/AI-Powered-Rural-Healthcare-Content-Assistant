/**
 * API Client for Rural Healthcare Content Assistant
 * Communicates with AWS API Gateway endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-api-id.execute-api.ap-south-1.amazonaws.com/dev';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data;
}

/**
 * Submit a new consultation with file data (base64).
 */
export async function submitConsultation({
  inputType,
  language,
  patientPhone,
  patientName,
  doctorId,
  doctorName,
  fileData,
  fileContentType,
}) {
  return apiRequest('/consultations', {
    method: 'POST',
    body: JSON.stringify({
      input_type: inputType,
      language,
      patient_phone: patientPhone,
      patient_name: patientName,
      doctor_id: doctorId,
      doctor_name: doctorName,
      file_data: fileData,
      file_content_type: fileContentType,
    }),
  });
}

/**
 * Get consultation details by ID.
 */
export async function getConsultation(consultationId) {
  return apiRequest(`/consultations/${consultationId}`);
}

/**
 * List consultations for a doctor.
 */
export async function listConsultations(doctorId, limit = 20) {
  return apiRequest(`/consultations?doctor_id=${doctorId}&limit=${limit}`);
}

/**
 * Get consultation for review.
 */
export async function getReview(consultationId) {
  return apiRequest(`/consultations/${consultationId}/review`);
}

/**
 * Update consultation (doctor corrections).
 */
export async function updateReview(consultationId, updates) {
  return apiRequest(`/consultations/${consultationId}/review`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Approve consultation for delivery.
 */
export async function approveConsultation(consultationId, notes = '') {
  return apiRequest(`/consultations/${consultationId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

/**
 * Upload file to S3 via pre-signed URL.
 */
export async function uploadToPresignedUrl(url, file, contentType) {
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': contentType,
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return true;
}
