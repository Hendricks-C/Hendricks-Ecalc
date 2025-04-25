# Hendricks-Ecalc
This repository contains the codebase for the E-Waste Impact Tracker, a system designed to help the Hendricks Foundation efficiently manage donated laptops, track their refurbishment, and calculate their environmental and financial impact.

## Prerequisites

Before running the app, you’ll need to set up accounts and configurations for the following services:

### [Resend](https://resend.com)

1. Create a Resend account.
2. Add and verify your [domain](https://resend.com/docs/dashboard/domains/introduction) for sending emails.
3. Generate your [API key](https://resend.com/docs/dashboard/api-keys/introduction) from the Resend dashboard.

### [Supabase](https://supabase.com)

1. Create a Supabase project.
2. Note the supabase URL and anon key.

### [Cloudflare Captcha (Turnstile)](https://www.cloudflare.com/application-services/products/turnstile/)

1. Sign in to Cloudflare and go to the Turnstile dashboard.
2. Create a new Turnstile site key.
3. Add your domain and note down the site key.

### [Google Cloud](https://cloud.google.com)

1. Create a new project in the Google Cloud Console.
2. Enable APIs (e.g., Gmail API if you're using OAuth or Vision API if applicable).
3. Create a service account and download the credentials JSON file.
