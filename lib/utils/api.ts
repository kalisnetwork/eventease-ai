import { NextResponse } from 'next/server'

export function jsonError(message: string, status = 400, code = 'BAD_REQUEST') {
  return NextResponse.json({ error: { code, message } }, { status })
}

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status })
}
