/**
 * Witness Circle — ephemeral serverless rooms, polling + short TTL
 * No Socket.io (v2.1 upgrade). In-memory store, resets on cold start.
 * GET  /api/witness?roomId=  — poll for messages (max 20, TTL 5min)
 * POST /api/witness          — post anonymous witness message
 */
import { NextRequest, NextResponse } from "next/server";
import { runCrisisFSM, isSafeMode } from "@/lib/crisisFSM";

interface WitnessMessage {
  id:        string;
  content:   string;
  createdAt: number;
  type:      "witness" | "blessing";
}

// In-memory store — ephemeral by design, TTL 5 minutes
const rooms = new Map<string, WitnessMessage[]>();
const TTL_MS = 5 * 60 * 1000;

function cleanExpired(msgs: WitnessMessage[]): WitnessMessage[] {
  const cutoff = Date.now() - TTL_MS;
  return msgs.filter(m => m.createdAt > cutoff);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = (searchParams.get("roomId") || "global").slice(0, 32);
  const since  = parseInt(searchParams.get("since") || "0");

  const raw  = rooms.get(roomId) || [];
  const msgs = cleanExpired(raw).filter(m => m.createdAt > since).slice(-20);
  rooms.set(roomId, cleanExpired(raw));

  return NextResponse.json({ messages: msgs, ts: Date.now() });
}

export async function POST(req: NextRequest) {
  try {
    const { roomId = "global", content, type = "witness" } = await req.json();

    if (!content || content.length < 2 || content.length > 200) {
      return NextResponse.json({ error: "Content 2–200 chars" }, { status: 400 });
    }

    // Crisis gate
    const fsm = runCrisisFSM(content);
    if (isSafeMode(fsm)) {
      return NextResponse.json({ crisis: true, resources: fsm.resources });
    }

    const safeRoomId = String(roomId).slice(0, 32);
    const msg: WitnessMessage = {
      id:        Math.random().toString(36).slice(2),
      content:   content.slice(0, 200),
      createdAt: Date.now(),
      type:      type === "blessing" ? "blessing" : "witness",
    };

    const existing = cleanExpired(rooms.get(safeRoomId) || []);
    existing.push(msg);
    rooms.set(safeRoomId, existing.slice(-50)); // max 50 per room

    return NextResponse.json({ message: msg });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
