import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { PHASES } from '@/lib/data'

const STORAGE_KEY = 'agent-governance-tasks'

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export async function GET() {
  try {
    const redis = getRedis()
    if (!redis) return NextResponse.json(PHASES)
    const saved = await redis.get(STORAGE_KEY)
    if (saved) return NextResponse.json(saved)
    return NextResponse.json(PHASES)
  } catch {
    return NextResponse.json(PHASES)
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis()
    if (!redis) return NextResponse.json({ success: false, error: 'Redis not configured' }, { status: 500 })
    const body = await request.json()
    await redis.set(STORAGE_KEY, body)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Storage unavailable' }, { status: 500 })
  }
}
