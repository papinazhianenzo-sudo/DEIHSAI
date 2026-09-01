import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ewculylyulysbszyxqdbo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCj9.eyJpc3MiOiJzdXBhmFzZSIsInJ1ZiI6ImV3Y3VseWx1bHlZynN6exhxzGlnvIiwiCm9sZS16ImFub24iLCJpYXQiOjE3ODc4OTI3NzksImV4cCI6MjEwMzI'

export const supabase = createClient(supabaseUrl, supabaseKey)
