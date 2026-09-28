-- ============================================================================
-- ROADGUARD PRODUCTION DATABASE SCHEMA & SECURITY POLICIES
-- Hackathon: Drive Safe Hackathon
-- System: Civic Road-Safety Hazard Reporting, Prioritization & Tracking
-- Database: PostgreSQL 15+ (Supabase)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('citizen', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE hazard_type AS ENUM (
    'pothole',
    'broken_traffic_signal',
    'poor_street_lighting',
    'unsafe_pedestrian_crossing',
    'road_damage',
    'waterlogging',
    'obstruction',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE severity_level AS ENUM ('minor', 'moderate', 'severe', 'catastrophic');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE traffic_exposure_level AS ENUM ('low', 'medium', 'high', 'arterial');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE vulnerability_zone AS ENUM ('standard', 'transit_hub', 'hospital_zone', 'school_zone');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('submitted', 'under_review', 'in_progress', 'resolved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- 3.1 User Profiles Table (Synchronized with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'citizen' NOT NULL,
  phone TEXT,
  department TEXT, -- Only for municipal admin staff (e.g., 'Municipal Road Maintenance Team')
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3.2 Sequence for Human-Readable Civic Report Codes (e.g., RG-2026-1001)
CREATE SEQUENCE IF NOT EXISTS report_code_seq START WITH 1001;

-- 3.3 Road Hazard Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hazard_type hazard_type NOT NULL,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90.0 AND 90.0),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180.0 AND 180.0),
  description TEXT NOT NULL CHECK (char_length(description) >= 10),
  severity severity_level NOT NULL,
  traffic_exposure traffic_exposure_level NOT NULL DEFAULT 'medium',
  vulnerability_level vulnerability_zone NOT NULL DEFAULT 'standard',
  
  -- Priority Engine Deterministic Calculation Outputs
  priority_score NUMERIC(5, 2) NOT NULL CHECK (priority_score BETWEEN 0.0 AND 100.0),
  priority_level priority_level NOT NULL,
  priority_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Lifecycle Status
  status report_status NOT NULL DEFAULT 'submitted',
  
  -- Media & Assistive AI Metadata
  image_url TEXT,
  ai_suggestion JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  resolved_at TIMESTAMPTZ
);

-- 3.4 Audit Trail & Status Timeline Table
CREATE TABLE IF NOT EXISTS public.report_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  previous_status report_status,
  new_status report_status NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- 4. INDICES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON public.reports(priority_level, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_reports_hazard ON public.reports(hazard_type);
CREATE INDEX IF NOT EXISTS idx_reports_geo ON public.reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_code ON public.reports(report_code);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_report_updates_report_id ON public.report_updates(report_id, created_at ASC);

-- ============================================================================
-- 5. TRIGGERS & FUNCTIONS
-- ============================================================================

-- 5.1 Updated_At Auto-Refresh Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.reports;
CREATE TRIGGER trg_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.2 Atomic Sequential Report Code Generator (RG-YYYY-XXXX)
CREATE OR REPLACE FUNCTION generate_report_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.report_code IS NULL OR NEW.report_code = '' THEN
    NEW.report_code := 'RG-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('report_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_report_code ON public.reports;
CREATE TRIGGER trg_generate_report_code
BEFORE INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION generate_report_code();

-- 5.3 Automated Initial Report History Entry
-- When a report is inserted, this trigger logs the initial intake record
-- into report_updates with SECURITY DEFINER so that normal citizens do not need
-- direct INSERT permission on the administrative audit trail table.
CREATE OR REPLACE FUNCTION trg_initial_report_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.report_updates (
    report_id,
    admin_id,
    previous_status,
    new_status,
    comment,
    created_at
  ) VALUES (
    NEW.id,
    NULL,
    NULL,
    'submitted',
    'Hazard report registered in municipal triage intake. Priority calculated as ' || UPPER(NEW.priority_level::TEXT) || ' (' || NEW.priority_score || '/100).',
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_after_report_insert_history ON public.reports;
CREATE TRIGGER trg_after_report_insert_history
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION trg_initial_report_history();

-- 5.4 Automatic User Profile Sync on Supabase Auth Signup
-- Users cannot self-assign role = 'admin'. Every new registration is securely given 'citizen'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen Reporter'),
    'citizen', -- Strictly enforced default role
    NEW.raw_user_meta_data->>'phone',
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 6.1 Profiles Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Public read access to profile names" ON public.profiles;
CREATE POLICY "Public read access to profile names"
ON public.profiles FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Users can update own profile except role" ON public.profiles;
CREATE POLICY "Users can update own profile except role"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Prevents self-escalation to admin
);

-- ----------------------------------------------------------------------------
-- 6.2 Reports Policies
-- ----------------------------------------------------------------------------
-- Public transparency: Any citizen or public visitor can view road hazards on the map & tracking page
DROP POLICY IF EXISTS "Reports are publicly viewable" ON public.reports;
CREATE POLICY "Reports are publicly viewable"
ON public.reports FOR SELECT
TO public
USING (true);

-- Authenticated citizens can submit new hazard reports
DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
CREATE POLICY "Authenticated users can create reports"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);

-- Public/anonymous submissions: If an unauthenticated citizen reports a hazard
DROP POLICY IF EXISTS "Anonymous users can create reports with null user_id" ON public.reports;
CREATE POLICY "Anonymous users can create reports with null user_id"
ON public.reports FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
);

-- Only verified municipal admins can update hazard status, resolution, and priority
DROP POLICY IF EXISTS "Only admins can update reports" ON public.reports;
CREATE POLICY "Only admins can update reports"
ON public.reports FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ----------------------------------------------------------------------------
-- 6.3 Report Updates Policies (Audit Trail)
-- ----------------------------------------------------------------------------
-- Public transparency: Citizens can track status history of any report
DROP POLICY IF EXISTS "Report updates are publicly viewable" ON public.report_updates;
CREATE POLICY "Report updates are publicly viewable"
ON public.report_updates FOR SELECT
TO public
USING (true);

-- Only verified municipal admins can insert administrative status transitions
-- (Note: Initial submission history is inserted by the SECURITY DEFINER trigger above)
DROP POLICY IF EXISTS "Only admins can insert status updates" ON public.report_updates;
CREATE POLICY "Only admins can insert status updates"
ON public.report_updates FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- 7. STORAGE BUCKET & STORAGE RLS POLICIES
-- ============================================================================

-- Ensure storage bucket 'hazard-evidence' exists and is publicly readable
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hazard-evidence',
  'hazard-evidence',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Object Policies
DROP POLICY IF EXISTS "Public can view hazard photos" ON storage.objects;
CREATE POLICY "Public can view hazard photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hazard-evidence');

DROP POLICY IF EXISTS "Authenticated users can upload hazard photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload hazard photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hazard-evidence' AND
  (LOWER(storage.extension(name)) = 'jpg' OR LOWER(storage.extension(name)) = 'jpeg' OR LOWER(storage.extension(name)) = 'png' OR LOWER(storage.extension(name)) = 'webp')
);

DROP POLICY IF EXISTS "Anonymous users can upload hazard photos" ON storage.objects;
CREATE POLICY "Anonymous users can upload hazard photos"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'hazard-evidence' AND
  (LOWER(storage.extension(name)) = 'jpg' OR LOWER(storage.extension(name)) = 'jpeg' OR LOWER(storage.extension(name)) = 'png' OR LOWER(storage.extension(name)) = 'webp')
);

-- ============================================================================
-- 8. INITIAL DEMO ADMIN SEED HELPER (FOR HACKATHON EVALUATORS)
-- To elevate a test user to admin after they register in Supabase Auth,
-- run this SQL snippet in the Supabase SQL editor:
--
-- UPDATE public.profiles
-- SET role = 'admin', department = 'Municipal Road Maintenance Team'
-- WHERE id = '<YOUR_USER_UUID>';
-- ============================================================================
