
/**
 * googleSheetsClient.js
 *
 * Google Sheets authentication using Application Default Credentials.
 *
 * Local authentication:
 * gcloud auth application-default login
 * --impersonate-service-account=YOUR_SERVICE_ACCOUNT_EMAIL
 *
 * No downloaded service-account private key required.
 */

const { google } = require('googleapis');

const SPREADSHEETS_SCOPE =
  'https://www.googleapis.com/auth/spreadsheets';

const REQUEST_TIMEOUT_MS = 15000;

let _sheetsClient = null;

function getSpreadsheetId() {
  const id = process.env.GOOGLE_SHEET_ID;

  if (!id) {
    throw new Error('GOOGLE_SHEET_ID is not set');
  }

  return id;
}

function getSheetsClient() {
  if (_sheetsClient) {
    return _sheetsClient;
  }

  // Automatically reads Application Default Credentials.
  const auth = new google.auth.GoogleAuth({
    scopes: [SPREADSHEETS_SCOPE],
  });

  // Create and cache Google Sheets API client.
  _sheetsClient = google.sheets({
    version: 'v4',
    auth,
    timeout: REQUEST_TIMEOUT_MS,
  });

  return _sheetsClient;
}

module.exports = {
  getSheetsClient,
  getSpreadsheetId,
};
