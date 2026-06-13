# FoodLoop

FoodLoop is a production-style food rescue platform built with Next.js, React, TypeScript, Tailwind CSS, and Supabase-ready data modeling.

## Features

- Startup-quality responsive landing page with dark mode
- Modern retro UI with chunky windows, grid background, and bold shadows
- Browse food cards with empty states, filters, status, freshness, and claim workflow
- Charity verification gate before anyone can claim food
- AI-assisted post food form that screens uploaded food photos for visible spoilage risk
- Gemini-powered auto-fill for food name, quantity, category, description, freshness notes, and confidence
- Post food form that saves listings locally and to Supabase when configured
- My Listings dashboard with donor updates, claimant details, unique pickup codes, and completion action
- Impact dashboard with charts for meals saved, food rescued, CO₂ reduction, and pickups
- Supabase schema for users, listings, claims, pickup schedules, impact metrics, and badges

## Getting Started

```bash
npm install
npm run dev
```

Optional Supabase environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wswwxgpxbhdmiirjsgax.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Optional Gemini environment variables for food photo analysis:

```bash
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-flash-latest
```

Apply the database schema from `public/supabase/schema.sql` in the Supabase SQL editor.

Do not put `service_role` or `sb_secret` keys in `.env.local` for a browser app. Rotate any secret
key that was shared publicly.

## Hackathon Submission

See `HACKATHON_SUBMISSION.md` for Devpost copy, a 2-5 minute demo video outline, judging criteria mapping, and the final submission checklist.

## Claim Flow

1. Donor posts food from `/post`.
2. Charity verifies from `/verify`. Once verified, a "Browse Food Listings" button appears.
3. Verified charity clicks the button and claims food from `/browse`.
4. FoodLoop reserves the listing and creates a unique pickup code.
5. Donor sees the claimant and code in `/listings`.
6. Donor marks the listing as picked up after the code matches.
