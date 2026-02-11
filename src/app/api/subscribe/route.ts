import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Use service_role key to bypass RLS if needed, or just standard insert
  // Since we set RLS to "Anyone can insert", standard client works fine.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from('subscribers').insert({ email });

  if (error) {
    // Handle duplicate emails gracefully
    if (error.code === '23505') {
      return NextResponse.json({ message: 'You are already subscribed!' });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Subscribed successfully!' });
}
