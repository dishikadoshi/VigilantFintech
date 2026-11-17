# Google Sheets + Vercel Setup Guide — Vigilant Fintech

This project stores one thing: **contact-form enquiries**, in a single
tab (`Enquiries`) of one Google Sheet. There is no admin portal, no login
and no other data tab.

---

## 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → create a new blank sheet.
2. Rename it, e.g. **"Vigilant Fintech Enquiries"**.
3. Copy the **Sheet ID** from the URL — the string between `/d/` and `/edit`.
   You'll paste it into `GOOGLE_SHEET_ID`.

You do **not** need to create the tab or type headers by hand —
`npm run setup:sheets` (step 4) creates the `Enquiries` tab and its header row.

---

## 2. Create a Google Cloud Service Account

1. [console.cloud.google.com](https://console.cloud.google.com) → create/pick a project.
2. Enable **Google Sheets API**.
3. **APIs & Services → Credentials → Create Credentials → Service account** → name it → **Done**.
4. Open the service account → **Keys → Add Key → Create new key → JSON**. Keep the file private.

   If Google says **"Service account key creation is disabled"**, an org policy
   is blocking it. In Cloud Shell:
   ```
   cat > policy.yaml << EOF2
   name: projects/YOUR_PROJECT_ID/policies/iam.managed.disableServiceAccountKeyCreation
   spec:
     rules:
     - enforce: false
   EOF2
   gcloud org-policies set-policy policy.yaml
   ```
   Wait ~30 seconds, then retry.

5. From the JSON file you need `client_email` and `private_key`.

---

## 3. Share the Sheet with the Service Account

Open the sheet → **Share** → paste the `client_email` → **Editor** →
uncheck "Notify people" → **Share**. Without this every request fails
with a permissions error.

---

## 4. Configure `backend/.env` and create the tab

```env
STORAGE_PROVIDER=sheets

GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz

ADMIN_EMAIL=you@yourcompany.com   # where new-enquiry notification emails go
```

`GOOGLE_PRIVATE_KEY` must be on one line, in double quotes, keeping the
`\n` sequences exactly as in the JSON file. SMTP and CORS variables are
listed in `backend/.env.example`.

```bash
cd backend
npm install
npm run setup:sheets   # creates the Enquiries tab + header row (safe to re-run)
npm test               # checks Sheets access and the Enquiries tab
npm run dev            # backend on localhost:4000
```

Frontend (separate terminal): `cd frontend && npm install && npm start`.

For local development without Google credentials, set `STORAGE_PROVIDER=mock`
(enquiries are kept in memory and lost on restart).

---

## 5. Deploy to Vercel

The repo's `vercel.json` defines two services (`frontend` and `backend`)
and routes `/api/*` to the backend. Make sure the `root` values in it match
your actual folder names.

Backend environment variables:
```
STORAGE_PROVIDER=sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SHEET_ID=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_SECURE=...
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM_NAME=...
EMAIL_FROM_ADDRESS=...
ADMIN_EMAIL=...
ALLOWED_ORIGINS=https://your-frontend-domain
```
Frontend environment variable:
```
REACT_APP_API_URL=https://your-backend-domain   # bare origin, no /api
```
Run `npm run setup:sheets` once from your machine; Vercel doesn't need it.
After deploy, check `ALLOWED_ORIGINS` matches your real frontend domain —
CORS silently blocks every request otherwise.

---

## The `Enquiries` tab

| Column        | Filled by                                              |
|---------------|--------------------------------------------------------|
| ID            | Auto — `EQ-SITE-001`, `EQ-SITE-002`, …                 |
| FIRST NAME / LAST NAME / COMPANY / EMAIL ID / COUNTRY CODE / CONTACT NO. / REASON / MESSAGE | Contact form |
| STATUS        | `new` on submission (edit by hand in the sheet if you like) |
| SOURCE        | `website_form`                                          |
| ADMIN NOTES   | Left empty — free for your own notes                    |
| CREATED AT / UPDATED AT | Auto, US format e.g. `07/26/2026, 09:12:03 AM EDT` |
| SMS           | `YES` / `NO` — whether the SMS-consent box was ticked   |

## Email notifications

| Event                  | Visitor gets                 | Company (`ADMIN_EMAIL`) gets |
|------------------------|------------------------------|------------------------------|
| Contact form submitted | "We received your enquiry"   | Full enquiry details         |

Emails are sent in the background after the sheet write, so the form
responds quickly (`waitUntil()` from `@vercel/functions` keeps them alive
on Vercel — see `backend/src/utils/backgroundTask.js`). All sheet access
goes through `backend/src/services/sheetsDb.js`.
