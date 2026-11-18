// Booking Service — Submits booking requests securely to the backend API
// Never fakes a successful Google Sheets submission.

import { PUBLIC_CONFIG } from '../config.js';

export async function submitBookingRequest(payload) {
  const response = await fetch(PUBLIC_CONFIG.bookingApiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data || data.ok !== true) {
    const error = new Error(
      (data && data.error) ||
        'Could not submit booking request to Google Sheets. Please try again later.'
    );
    error.code = (data && data.code) || 'BOOKING_SUBMISSION_FAILED';
    error.configured = data ? data.configured : undefined;
    error.status = response.status;
    throw error;
  }

  return data;
}
