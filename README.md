# Hendricks-Ecalc
This repository contains the codebase for the E-Waste Impact Tracker, a system designed to help the Hendricks Foundation efficiently manage donated laptops, track their refurbishment, and calculate their environmental and financial impact.

## Prerequisites

Before running the app, you’ll need to set up accounts and configurations for the following services:

### [Resend](https://resend.com)

1. Create a Resend account.
2. Add and verify your [domain](https://resend.com/docs/dashboard/domains/introduction) for sending emails.
3. Generate your [API key](https://resend.com/docs/dashboard/api-keys/introduction) from the Resend dashboard.

### [Supabase](https://supabase.com)

1. Click on new project then create a Supabase project.
2. Then note down the supabase URL and anon key.
3. Then also go to project settings, Data API and get your service role key as well.

### [Cloudflare Captcha (Turnstile)](https://www.cloudflare.com/application-services/products/turnstile/)

1. Sign in to Cloudflare and go to the Turnstile dashboard.
2. Create a new Turnstile site key.
3. Add your domain and note down the site key.

### [Google Cloud](https://cloud.google.com)

1. Create a new project in the Google Cloud Console.
2. Enable APIs (e.g., Gmail API if you're using OAuth or Vision API if applicable).
3. Create a service account and download the credentials JSON file.

## Frontend

To set up and run the frontend locally:

### Installation

You will need to go into the frontend directory then install all the dependencies for the project.

```bash
cd frontend
npm install
```

### Environment Variables

Then you will need to define your environment variables. Using what you noted down earlier from the prerequisites.

```bash
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
VITE_TURNSTILE_SITE_KEY=""
```

### Development Server

Then you can start your devlopment server!

```bash
npm run dev
```

## Backend

To set up and run the Backend locally:

### Installation

You will need to go into the backend directory then install all the dependencies for the project.

```bash
cd backend
npm install
```

### Environment Variables

Then you will need to define your environment variables. Using what you noted down earlier from the prerequisites. For the GOOGLE_SERVICE_ACCOUNT_JSON copy and past everything in the json key you downloaded and past it making sure its one line.

```bash
SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
RESEND_API_KEY=""
GOOGLE_SERVICE_ACCOUNT_JSON=""
```

### Development Server

Then you can start your devlopment server!

```bash
npm run dev
```


