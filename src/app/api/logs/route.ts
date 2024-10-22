import { supabase } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const response = await supabase.from('logs').insert(body);
  return response;
}
