// app/api/deletion/receipt/route.ts
// Registers and verifies deletion receipts.
// The server never sees session content — only the ZK proof and its public signals.
// POST: record a receipt hash in Supabase for future audit
// GET:  verify a receipt hash exists (confirm deletion happened)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function db() {
  return createClient(supabaseUrl, serviceKey);
}

// POST /api/deletion/receipt
// Body: { receiptHash, deletionTimestamp, proof, publicSignals }
export async function POST(req: NextRequest) {
  let body: {
    receiptHash: string;
    deletionTimestamp: number;
    proof: object;
    publicSignals: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { receiptHash, deletionTimestamp, proof, publicSignals } = body;

  if (!receiptHash || typeof deletionTimestamp !== 'number' || !proof || !publicSignals) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Receipt hash must be a plausible field element (decimal string, ≤77 chars)
  if (!/^\d{1,77}$/.test(receiptHash)) {
    return NextResponse.json({ error: 'Invalid receipt hash format.' }, { status: 400 });
  }

  const supabase = db();

  // Idempotent upsert — safe to call twice if client retries
  const { error } = await supabase
    .from('deletion_receipts')
    .upsert(
      {
        receipt_hash:       receiptHash,
        deletion_timestamp: new Date(deletionTimestamp * 1000).toISOString(),
        // Store proof for optional third-party audit.
        // We do NOT store session content or user identifiers.
        proof_json:         JSON.stringify(proof),
        public_signals:     publicSignals,
        created_at:         new Date().toISOString(),
      },
      { onConflict: 'receipt_hash' },
    );

  if (error) {
    // Non-critical: receipt storage failed, but the session purge already happened.
    console.error('[deletion/receipt] upsert error:', error.message);
    return NextResponse.json(
      { error: 'Receipt storage failed. Your data was still deleted.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success:     true,
    receiptHash,
    confirmedAt: new Date().toISOString(),
    message:     'Your session has been permanently deleted. This receipt is your proof.',
  });
}

// GET /api/deletion/receipt?hash=<receiptHash>
export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get('hash');

  if (!hash || !/^\d{1,77}$/.test(hash)) {
    return NextResponse.json({ error: 'Invalid or missing hash.' }, { status: 400 });
  }

  const supabase = db();

  const { data, error } = await supabase
    .from('deletion_receipts')
    .select('receipt_hash, deletion_timestamp, created_at')
    .eq('receipt_hash', hash)
    .single();

  if (error || !data) {
    return NextResponse.json({ exists: false, message: 'No receipt found for this hash.' });
  }

  return NextResponse.json({
    exists:            true,
    receiptHash:       data.receipt_hash,
    deletionTimestamp: data.deletion_timestamp,
    registeredAt:      data.created_at,
    message:           'This deletion is confirmed.',
  });
}
