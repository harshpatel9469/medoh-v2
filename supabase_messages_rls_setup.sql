-- SQL commands to run in Supabase SQL Editor to fix messages table RLS policies

-- 1. Enable RLS on messages table (if not already enabled)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow doctors to insert their own messages
CREATE POLICY "Doctors can insert their own messages" ON messages
FOR INSERT WITH CHECK (auth.uid() IN (
  SELECT user_id FROM doctors WHERE id = doctor_id
));

-- 3. Create policy to allow doctors to view their own messages
CREATE POLICY "Doctors can view their own messages" ON messages
FOR SELECT USING (auth.uid() IN (
  SELECT user_id FROM doctors WHERE id = doctor_id
));

-- 4. Optional: Allow admins to view all messages
CREATE POLICY "Admins can view all messages" ON messages
FOR SELECT USING (
  auth.jwt() ->> 'email' = 'mpyne@medohhealth.com' OR
  (auth.jwt() -> 'app_metadata' ->> 'userrole') = 'ADMIN'
);

-- 5. Optional: Allow admins to insert messages for any doctor
CREATE POLICY "Admins can insert messages for any doctor" ON messages
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email' = 'mpyne@medohhealth.com' OR
  (auth.jwt() -> 'app_metadata' ->> 'userrole') = 'ADMIN'
);

-- 6. Verify messages table structure (run this to check your table)
-- Expected columns: id (UUID), doctor_id (INT), sent_at (TIMESTAMP), recipient (VARCHAR), message (TEXT)
-- If the table doesn't exist or has wrong columns, create it:

-- DROP TABLE IF EXISTS messages; -- Uncomment if you need to recreate the table

-- CREATE TABLE messages (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   doctor_id INTEGER NOT NULL,
--   sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   recipient VARCHAR(20) NOT NULL,
--   message TEXT NOT NULL,
--   FOREIGN KEY (doctor_id) REFERENCES doctors(id)
-- ); 