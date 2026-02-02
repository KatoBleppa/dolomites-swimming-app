import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://vupcplusmldrifueqpyp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cGNwbHVzbWxkcmlmdWVxcHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjY0MjgsImV4cCI6MjA3MzgwMjQyOH0.cRSu_ulSlG2MfrlClyIyx6MCAfXBprO3sCZXmtjYNXU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})