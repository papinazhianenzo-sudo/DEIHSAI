import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabase.com/dashboard/project/ewculylulysbszyxqdho/settings/api-keys'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Y3VseWx1bHlzYnN6eXhxZGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4OTI3NzksImV4cCI6MjEwMzQ2ODc3OX0.CwPIzEAarnrdpgW7WwdKlJhfB971FchtEIvUlyE36TQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
