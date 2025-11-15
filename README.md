# We Hire - Hiring Management Platform

A modern, full-featured hiring management platform built with Next.js that streamlines the recruitment process for both recruiters and job seekers.

## Live Demo

**URL:** [https://we-hire-henna.vercel.app](https://we-hire-henna.vercel.app)

**Demo Video:**

[![We Hire Demo Video Thumbnail](https://img.youtube.com/vi/zh1WXhSG9Ss/default.jpg)](https://www.youtube.com/watch?v=zh1WXhSG9Ss)

### Demo Accounts

| Role                   | Email            | Password |
| ---------------------- | ---------------- | -------- |
| Admin (Recruiter)      | admin@wehire.com | heleh    |
| Applicant (Job Seeker) | irfan@wehire.com | heleh    |

## Features

### For Admins (Recruiters)

- Create, edit, and delete job postings
- Manage candidates for each job position
- Custom configuration for each job post
- View and manage applications
- Role-based access control

### For Applicants (Job Seekers)

- See available jobs
- Apply to job positions
- Take profile picture using gesture capture (pose 1, 2, 3)
- Personal profile management

### General Features

- Secure user authentication with role-based access
- Fully responsive design for all devices
- Advanced filtering, search, and pagination
- Optimized data fetching with caching via React Query
- Automated cron job to update job statuses (active → inactive when expired)
- Comprehensive form validation with Zod
- Modern UI with Tailwind CSS and shadcn/ui components
- hand gesture detection using MediaPipe

## Tech Stack

### Frontend

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Form Management:** React Hook Form
- **Validation:** Zod
- **Data Fetching:** TanStack React Query
- **Tables:** TanStack React Table
- **Date Utilities:** date-fns
- **Gesture Detection:** @mediapipe/hands

### Backend

- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **API:** Next.js API Routes
- **Automation:** Cron Job for job status updates

## Project Structure

```
we-hire/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── admin/               # Admin dashboard pages
│   │   ├── api/                # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── candidates/    # Candidate CRUD operations
│   │   │   └── jobs/          # Job CRUD operations
│   │   ├── apply-job/         # Job application pages
│   │   │   └── [slug]/        # Dynamic job application form
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/        # Login page
│   │   │   └── register/     # Registration page
│   │   └── jobs/              # Public job listing page
│   ├── components/            # Components UI
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   └── utils/            # Helper functions
│   ├── schemas/              # Zod validation schemas
│   ├── types/                # TypeScript type definitions
│   └── middleware.ts         # Next.js middleware for auth
└── public/                   # Static assets
    └── images/              # Image files

```

## Getting Started

### Prerequisites

- Node.js 20+ installed
- pnpm package manager
- Supabase account (for database and authentication)

### Database Setup

This project uses Supabase as the backend. Follow these steps to set up your database:

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Create custom types** - Run these SQL commands first in Supabase SQL Editor:

   ```sql
   -- Create custom enum types
   CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');
   CREATE TYPE public.job_type AS ENUM ('full-time', 'part-time', 'contract', 'internship');
   CREATE TYPE public.job_status AS ENUM ('active', 'inactive', 'closed');
   CREATE TYPE public.work_arrangement AS ENUM ('onsite', 'remote', 'hybrid');
   CREATE TYPE public.user_role AS ENUM ('admin', 'applicant');
   ```

3. **Create the update trigger function** - Run this SQL command:

   ```sql
   -- Function to automatically update updated_at timestamp
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

4. **Create database tables** - Run these SQL commands in order:

   ```sql
   -- Users table
   CREATE TABLE public.users (
     id uuid NOT NULL DEFAULT gen_random_uuid(),
     auth_id uuid NOT NULL DEFAULT auth.uid(),
     full_name text NOT NULL,
     email text NOT NULL,
     role public.user_role NOT NULL DEFAULT 'applicant'::user_role,
     created_at timestamp with time zone NULL DEFAULT now(),
     updated_at timestamp with time zone NULL DEFAULT now(),
     CONSTRAINT users_pkey PRIMARY KEY (id),
     CONSTRAINT users_email_key UNIQUE (email),
     CONSTRAINT users_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users (id) ON DELETE CASCADE
   ) TABLESPACE pg_default;

   CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   -- Jobs table
   CREATE TABLE public.jobs (
     id uuid NOT NULL DEFAULT gen_random_uuid(),
     slug text NOT NULL,
     title text NOT NULL,
     type public.job_type NOT NULL,
     description text NULL,
     status public.job_status NOT NULL DEFAULT 'active'::job_status,
     salary_range jsonb NULL,
     config jsonb NOT NULL,
     started_at date NULL,
     ended_at date NULL,
     auth_id uuid NOT NULL DEFAULT auth.uid(),
     created_at timestamp with time zone NULL DEFAULT now(),
     updated_at timestamp with time zone NULL DEFAULT now(),
     company text NOT NULL,
     location text NOT NULL,
     work_arrangement public.work_arrangement NOT NULL,
     CONSTRAINT jobs_pkey PRIMARY KEY (id),
     CONSTRAINT jobs_slug_key UNIQUE (slug),
     CONSTRAINT jobs_auth_id_fkey1 FOREIGN KEY (auth_id) REFERENCES auth.users (id) ON DELETE CASCADE
   ) TABLESPACE pg_default;

   CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   -- Candidates table
   CREATE TABLE public.candidates (
     id uuid NOT NULL DEFAULT gen_random_uuid(),
     job_id uuid NOT NULL,
     full_name character varying(255) NOT NULL,
     profile_picture text NULL,
     email character varying(255) NOT NULL,
     phone character varying(50) NULL,
     gender public.gender_type NULL,
     linkedin_link text NULL,
     domicile character varying(255) NULL,
     date_of_birth date NULL,
     created_at timestamp with time zone NULL DEFAULT now(),
     updated_at timestamp with time zone NULL DEFAULT now(),
     auth_id uuid NOT NULL DEFAULT auth.uid(),
     CONSTRAINT candidates_pkey PRIMARY KEY (id),
     CONSTRAINT candidates_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
   ) TABLESPACE pg_default;

   CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

5. **Configure Row Level Security (RLS)** - Enable RLS policies based on user roles to secure your data

6. **Set up Supabase Storage** - Create bucket `images` for file uploads (profile pictures)

7. **Set up Supabase Cron Job** - Configure a daily cron job to automatically update job statuses from active to inactive when `ended_at` date is expired

   ```sql
   SELECT cron.schedule(
      'deactivate-expired-jobs',
      '0 0 * * *',
      $$
         UPDATE public.jobs
         SET status = 'inactive'
         WHERE ended_at IS NOT NULL
            AND ended_at < current_date
            AND status IS DISTINCT FROM 'inactive';
      $$
   );
   ```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/irfan-za/we-hire.git
   cd we-hire
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Authentication Flow

The application uses Supabase Auth with custom role-based access control:

- Users register with their email and password
- Roles are assigned (applicant)
- Middleware protects routes based on user roles
- Sessions are managed securely via Supabase

## 📄 License

This project is licensed under the MIT License.
