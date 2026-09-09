-- =============================================================================
-- SIH 2026 Healthcare Platform: Appointment Request & Status Sync Engine
-- Migration targeting existing Supabase PostgreSQL schema
-- =============================================================================

-- 1. Enable pgcrypto / uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- NOTE ON EXISTING TABLES:
-- The following tables already exist in your Supabase database:
--   • doctor_profiles  (id, name, specialization, experience_years, ...)
--   • patient_profiles (id, name, user_id, blood_group, ...)
--   • appointments     (id, doctor_id, patient_id, mode, scheduled_at, status, reason, ...)
-- =============================================================================

-- 2. Create the NEW appointment_requests Table
-- Links directly to the existing doctor_profiles and patient_profiles tables
CREATE TABLE IF NOT EXISTS appointment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('direct_teleconsultation', 'scheduled_teleconsultation')),
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  requested_time TEXT NOT NULL DEFAULT '10:00 AM',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'rescheduled')),
  proposed_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enhance the EXISTING appointments table to link back to appointment_requests
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_request_id UUID REFERENCES appointment_requests(id) ON DELETE SET NULL;

-- 4. Create indexes for fast rural querying
CREATE INDEX IF NOT EXISTS idx_appt_req_doctor ON appointment_requests(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_appt_req_patient ON appointment_requests(patient_id, status);

-- 5. Configure Row-Level Security (RLS)
-- Enables mobile client direct WebSocket subscription & insertion
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on appointment_requests" ON appointment_requests;
CREATE POLICY "Allow anon all on appointment_requests" 
ON appointment_requests FOR ALL TO anon, authenticated 
USING (true) WITH CHECK (true);

-- Ensure RLS on existing appointments allows reading/inserting for teleconsultations
DROP POLICY IF EXISTS "Allow anon teleconsult on appointments" ON appointments;
CREATE POLICY "Allow anon teleconsult on appointments" 
ON appointments FOR ALL TO anon, authenticated 
USING (true) WITH CHECK (true);

-- 6. Enable REPLICA IDENTITY FULL for Supabase Realtime WebSocket payload delivery
ALTER TABLE appointment_requests REPLICA IDENTITY FULL;
ALTER TABLE appointments REPLICA IDENTITY FULL;

-- 7. Add Tables to Supabase Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'appointment_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointment_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  END IF;
END $$;
