import { createClient } from '@supabase/supabase-js';


if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables');
}


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


export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  options
);


export const getRealtimeChannel = (channelName) => {
  return supabase.channel(channelName)
    .on('broadcast', { event: '*' }, (payload) => {
      console.log('Received broadcast:', payload);
    });
};


export const handleSupabaseError = (error, context = 'operation') => {
  console.error(`Supabase ${context} error:`, error);
  throw new Error(`Failed to complete ${context}: ${error.message}`);
};

