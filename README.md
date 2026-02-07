# Formly AI

AI-native form and assessment platform with segmentation and weighted insights.

## Features

- **AI Question Generation** - Describe what you need and AI generates structured question sets
- **CSV Import** - Upload questions from CSV files
- **Segmented Audiences** - Assign questions to specific respondent groups
- **Weighted Scoring** - Apply question and segment weights for meaningful scores
- **Insights Dashboard** - View response analytics with outlier detection
- **Export** - Download responses as CSV or summary reports as JSON

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Postgres, Auth, Storage)
- **AI**: OpenAI GPT-4o-mini for question generation
- **Hosting**: Vercel

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Formly-AI
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Enable Email Auth with magic links in Authentication settings

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase URL, anon key, and OpenAI API key.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    api/                    # API routes
      insights/             # Export endpoints
      questions/            # AI generation + CSV import
      responses/            # Response submission
    auth/                   # Login + callback
    dashboard/              # Protected dashboard
      forms/                # Form CRUD + management
        [formId]/
          questions/        # Question management
          segments/         # Segment management
          respondents/      # Respondent management
          insights/         # Analytics dashboard
    respond/[formId]/       # Public response form
  components/
    layout/                 # Dashboard shell
    ui/                     # Reusable UI components
  lib/
    supabase/               # Supabase client configs
    weights.ts              # Weighting engine
  types/
    database.ts             # TypeScript types
supabase/
  schema.sql                # Database schema
```

## Database Schema

- `organisations` - Multi-tenant orgs
- `users` - Users linked to orgs
- `forms` - Forms with draft/published/closed status
- `questions` - Likert, multiple choice, short text
- `segments` - Audience segments with weights
- `respondents` - Form respondents
- `responses` - Collected answers
- `response_flags` - Outlier detection flags
