import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  "https://wzfygdjnsdgisofarvek.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZnlnZGpuc2RnaXNvZmFydmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMjQ5NDQsImV4cCI6MjAzMTgwMDk0NH0.CClLvu7itgozewzp32cAmQaEXS7X8iRQ_VX3F9CAyxc"
);