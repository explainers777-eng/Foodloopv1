# FoodLoop Hackathon Submission Guide

This file is written for STEMINATE Hacks 2026 submission prep.

## Hard Requirements

- Public GitHub repository
- 2-5 minute project demo video
- Written project explanation on Devpost
- Project must be original and created during the hackathon time frame
- Entry must be in English
- Team members must be listed on Devpost
- Team size: solo or up to 4 people
- Deadline: June 14, 2026 at 8:45am EDT, which is June 14, 2026 at 6:15pm IST

## Devpost Summary

FoodLoop is an AI-assisted food rescue platform that helps donors turn surplus food into safe, claimable listings for nearby charities. Donors upload a food photo, and Gemini screens for visible spoilage risk, auto-fills listing details, and blocks unclear or unsafe-looking donations before charities see them.

## Inspiration

Perfectly usable food is wasted every day because donors do not have a fast, trusted way to share it with charities. At the same time, charities need quick pickup information and confidence that a donation is worth checking. FoodLoop was built to reduce friction on both sides.

## What It Does

- Lets donors post surplus food with a photo-first workflow
- Uses Gemini to detect visible food condition and spoilage risk
- Auto-fills food name, quantity, category, preparation age estimate, description, freshness notes, and confidence
- Blocks unclear or unsafe-looking food uploads
- Lets charities browse available listings
- Includes charity verification before claiming
- Generates unique pickup codes for reserved food
- Shows impact metrics such as meals rescued and CO2 savings

Important framing: FoodLoop is not a medical or official food safety certification tool. The AI is a visual screening layer that flags obvious risk and improves listing quality.

## How We Built It

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Gemini API for image analysis and listing auto-fill
- Supabase-ready schema and client helpers
- Local storage fallback for demo reliability

## Challenges

- Gemini responses can vary, so the API route normalizes and safely parses AI output before the UI uses it
- Food safety cannot be fully verified from a photo, so the product clearly treats AI as risk screening rather than certification
- The donor flow needs to be fast, but still safe enough to prevent bad listings

## Judging Criteria Mapping

Innovation and Creativity: Photo-first AI listing generation and spoilage risk screening for food rescue.

Impact and Relevance: Targets food waste and charity food access, a real-world social problem with broad local impact.

Technical Implementation: Full-stack Next.js app with image upload, API route, AI parsing, listing workflows, verification, claims, and impact dashboards.

Use of AI / Technology: AI meaningfully improves speed, safety screening, and listing quality instead of being a decorative chatbot.

Feasibility and Scalability: Donors and charities already use similar marketplace workflows; FoodLoop can scale city-by-city with verification and pickup partners.

Presentation and Communication: Demo should show the donor upload, AI auto-fill, unsafe-food blocking, charity browse, claim code, and impact dashboard.

Design and UX: Retro visual style, animated analysis state, simple posting flow, clear status badges, and browseable cards.

## 2-5 Minute Demo Video Outline

1. Problem, 20 seconds:
   "Restaurants, homes, and events often have surplus food, but charities need fast, trustworthy pickup details. FoodLoop reduces food waste by making donation listings safer and faster."

2. Donor flow, 60-90 seconds:
   Open `/post`, upload a food photo, show the animated Gemini scan, and point out auto-filled name, quantity, category, description, freshness notes, and confidence.

3. Safety moment, 30 seconds:
   Explain that AI blocks unclear or spoiled-looking food. Say clearly that it is visual risk screening, not official certification.

4. Charity flow, 45-60 seconds:
   Open `/browse`, show listings, claim food, and show pickup code.

5. Donor management and impact, 30-45 seconds:
   Open `/listings` and `/impact`, show reserved listings, pickup completion, meals saved, and CO2 reduction.

6. Closing, 15 seconds:
   "FoodLoop makes food donation faster for donors, clearer for charities, and safer through AI-assisted screening."

## Devpost Project Description

FoodLoop is a food rescue platform that helps donors post surplus food and helps charities claim it quickly. The core feature is an AI-assisted upload flow: donors add a food photo, Gemini screens the image for visible spoilage risk, auto-generates the listing details, and blocks unclear or unsafe-looking donations. Charities can browse available food, reserve listings, and receive unique pickup codes. The app also includes verification and impact dashboards to show meals saved and estimated CO2 reduction.

## What To Submit

- Devpost project title: FoodLoop
- Tagline: AI-assisted surplus food rescue for safer, faster charity pickups
- Live link: add your Vercel URL
- GitHub link: add your public repo URL
- Video link: add YouTube, Loom, or Google Drive link
- Built with: Next.js, React, TypeScript, Tailwind CSS, Gemini API, Supabase

## Final Checklist

- App deployed on Vercel
- `GEMINI_API_KEY` added to Vercel environment variables
- `NEXT_PUBLIC_SUPABASE_URL` added to Vercel if using Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Vercel if using Supabase
- Public GitHub repo created
- README includes setup instructions
- Devpost written explanation filled in
- 2-5 minute demo video uploaded
- Video shows one successful upload and one blocked unsafe/unclear example
- Project submitted before June 14, 2026 at 8:45am EDT / 6:15pm IST

## Honest Judge Risk

Do not claim the AI proves food is safe. Say it screens for visible risk and helps prevent obviously bad listings. This makes the project sound responsible and will hold up better with judges who understand AI limitations.
