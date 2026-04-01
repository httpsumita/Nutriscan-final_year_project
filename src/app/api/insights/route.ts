import { NextResponse } from 'next/server'

export async function GET() {
  // Placeholder insights: in production run aggregation queries across DailyLog and Scans
  const insights = {
    weekly: [{ title: 'Reduce added sugars', reason: 'Frequent consumption linked to insulin load.' }],
    monthly: []
  }
  return NextResponse.json({ ok: true, insights })
}
