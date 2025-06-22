import { createClient } from '@supabase/supabase-js';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables');
}

// Configure client options
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'X-Application-Name': 'Music App',
    },
  },
};

// Create and export the Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  options
);

// Optional: Add realtime subscription types
export const getRealtimeChannel = (channelName) => {
  return supabase.channel(channelName)
    .on('broadcast', { event: '*' }, (payload) => {
      console.log('Received broadcast:', payload);
    });
};

// Helper function for error handling
export const handleSupabaseError = (error, context = 'operation') => {
  console.error(`Supabase ${context} error:`, error);
  throw new Error(`Failed to complete ${context}: ${error.message}`);
};

// TypeScript users can add interface definitions here