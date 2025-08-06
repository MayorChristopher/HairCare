import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, connection: 'working' })
  } catch (err) {
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
  }
}
