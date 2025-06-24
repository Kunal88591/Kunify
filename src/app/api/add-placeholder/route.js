import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(req) {
  const body = await req.json();

  const { data, error } = await supabase.from('songs').insert([{ ...body, isPlaceholder: true }]);

  if (error) return NextResponse.json({ message: 'Failed to add song', error }, { status: 500 });
  return NextResponse.json({ message: 'Placeholder song added!', data });
}
