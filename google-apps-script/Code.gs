/**
 * MyMigo MVP — Google Apps Script Booking Webhook
 *
 * Setup:
 * 1. Create a new Google Sheet (e.g. "MyMigo Bookings").
 * 2. Open Extensions -> Apps Script.
 * 3. Paste this entire file into Code.gs.
 * 4. (Optional) Set APPS_SCRIPT_SECRET in Script Properties or below to match .env.
 * 5. Click Deploy -> New deployment -> Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL into GOOGLE_APPS_SCRIPT_URL in your server .env file.
 */

var SHEET_NAME = 'Bookings';
var HEADERS = [
  'Booking ID',
  'Date Submitted',
  'Customer Name',
  'Mobile Number',
  'WhatsApp Number',
  'Email',
  'City',
  'Store',
  'Requirement',
  'Preferred Date',
  'Preferred Time',
  'Additional Notes',
  'Booking Status'
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'Missing request body' });
    }

    var payload = JSON.parse(e.postData.contents);
    var configuredSecret = PropertiesService.getScriptProperties().getProperty('APPS_SCRIPT_SECRET') || '';

    if (configuredSecret && payload.secret !== configuredSecret) {
      return jsonResponse({ ok: false, error: 'Unauthorized request' });
    }

    var booking = payload.booking || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var row = [
      booking.bookingId || '',
      booking.dateSubmitted || '',
      booking.customerName || '',
      booking.mobileNumber || '',
      booking.whatsappNumber || '',
      booking.email || '',
      booking.city || '',
      booking.store || '',
      booking.requirement || '',
      booking.preferredDate || '',
      booking.preferredTime || '',
      booking.additionalNotes || '',
      booking.bookingStatus || 'New'
    ];

    var nextRow = sheet.getLastRow() + 1;
    var range = sheet.getRange(nextRow, 1, 1, row.length);
    // Format as plain text so phone numbers and dates preserve exact formatting
    range.setNumberFormat('@');
    range.setValues([row]);

    return jsonResponse({
      ok: true,
      bookingId: booking.bookingId || '',
      bookingStatus: booking.bookingStatus || 'New'
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
