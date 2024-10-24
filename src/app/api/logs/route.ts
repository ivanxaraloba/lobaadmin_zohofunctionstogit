import { supabase } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

import { LOGS_TYPES_COLORS } from '@/utils/constants';

// id
// projectId
// function
// notes
// type
// created_at

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { data, error } = await supabase.from('logs').insert(body);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to process request' },
      { status: 500 },
    );
  }
}
