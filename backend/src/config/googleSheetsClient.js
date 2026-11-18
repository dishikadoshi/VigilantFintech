
/**
 * Google Sheets authentication for local development and Vercel production.
 *
 * Local development:
 * Google Application Default Credentials (ADC).
 *
 * Vercel production:
 * Vercel OIDC -> Google Workload Identity Federation
 * -> short-lived service account credentials.
 *
 * No downloaded service-account private key is required.
 */

const { google } = require('googleapis');
const { ExternalAccountClient } = require('google-auth-library');
const { getVercelOidcToken } = require('@vercel/oidc');

const SPREADSHEETS_SCOPE =
  'https://www.googleapis.com/auth/spreadsheets';

const REQUEST_TIMEOUT_MS = 15000;

let sheetsClient = null;

function requiredEnv(name) {
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return String(value).trim();
}

function getSpreadsheetId() {
  return requiredEnv('GOOGLE_SHEET_ID');
}

/**
 * Vercel production authentication using Google WIF.
 */
function createVercelWifAuth() {
  const projectNumber = requiredEnv('GCP_PROJECT_NUMBER');

  const poolId = requiredEnv(
    'GCP_WORKLOAD_IDENTITY_POOL_ID'
  );

  const providerId = requiredEnv(
    'GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID'
  );

  const serviceAccountEmail =
    process.env.GCP_SERVICE_ACCOUNT_EMAIL ||
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  if (!serviceAccountEmail) {
    throw new Error(
      'Missing GCP_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_EMAIL.'
    );
  }

  const providerAudience =
    `//iam.googleapis.com/projects/${projectNumber}` +
    `/locations/global/workloadIdentityPools/${poolId}` +
    `/providers/${providerId}`;

  const auth = ExternalAccountClient.fromJSON({
    type: 'external_account',

    audience: providerAudience,

    subject_token_type:
      'urn:ietf:params:oauth:token-type:jwt',

    token_url:
      'https://sts.googleapis.com/v1/token',

    service_account_impersonation_url:
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,

    subject_token_supplier: {
      // Vercel OIDC token is retrieved lazily during an API request.
      // Do not request it during module initialization.
      getSubjectToken: () => getVercelOidcToken(),
    },
  });

  if (!auth) {
    throw new Error(
      'Google ExternalAccountClient could not be initialized.'
    );
  }

  auth.scopes = [SPREADSHEETS_SCOPE];

  return auth;
}

/**
 * Local development authentication using ADC.
 */
function createLocalAdcAuth() {
  return new google.auth.GoogleAuth({
    scopes: [SPREADSHEETS_SCOPE],
  });
}

/**
 * Creates and caches the Google Sheets API client.
 */
function getSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  const runningOnVercel =
    process.env.VERCEL === '1' ||
    Boolean(process.env.VERCEL_ENV);

  const wifEnabled =
    process.env.GCP_WIF_ENABLED === 'true';

  let auth;

  if (runningOnVercel || wifEnabled) {
    auth = createVercelWifAuth();
  } else {
    auth = createLocalAdcAuth();
  }

  sheetsClient = google.sheets({
    version: 'v4',
    auth,
    timeout: REQUEST_TIMEOUT_MS,
  });

  return sheetsClient;
}

module.exports = {
  getSheetsClient,
  getSpreadsheetId,
};
