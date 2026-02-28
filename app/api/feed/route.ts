/**
 * GET /api/feed
 * Returns miracle posts ranked by: score = (upvotes*0.6) + (aiResonance*0.4)
 * aiResonance capped at 0.6 — prevents algorithmic divinity
 * Blurred items returned with content replaced if user not premium
 * SafeMode: blur disabled, full access (ethics > revenue)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page      = parseInt(searchParams.get("page") || "1");
    const limit     = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const filter    = searchParams.get("filter") || "all"; // all | miracles
    const safeMode  = searchParams.get("safeMode") === "true";
    const isPremium = searchParams.get("premium") === "true";

    const skip = (page - 1) * limit;

    const posts = await prisma.miraclePost.findMany({
      where:   {},
      orderBy: { rankScore: "desc" },
      skip,
      take:    limit,
      select: {
        id:          true,
        createdAt:   true,
        content:     true,
        upvotes:     true,
        heartCount:  true,
        viewCount:   true,
        aiResonance: true,
        rankScore:   true,
        isFeatured:  true,
        isBlurred:   true,
      },
    });

    const processed = posts.map(p => {
      // SafeMode bypass: ethics > revenue — full access always
      const shouldBlur = p.isBlurred && !isPremium && !safeMode;
      return {
        id:         p.id,
        createdAt:  p.createdAt,
        content:    shouldBlur ? null : p.content,
        blurred:    shouldBlur,
        upvotes:    p.upvotes,
        heartCount: p.heartCount,
        viewCount:  p.viewCount,
        isFeatured: p.isFeatured,
        rankScore:  p.rankScore,
      };
    });

    return NextResponse.json({ posts: processed, page, limit });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Upvote / heart a miracle
  try {
    const { postId, action } = await req.json(); // action: "upvote" | "heart"
    if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

    const post = await prisma.miraclePost.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const upvotes    = action === "upvote" ? post.upvotes + 1 : post.upvotes;
    const heartCount = action === "heart"  ? post.heartCount + 1 : post.heartCount;
    // Recalculate rank — aiResonance capped at 0.6
    const aiResonance = Math.min(0.6, post.aiResonance);
    const rankScore   = upvotes * 0.6 + aiResonance * 0.4;

    const updated = await prisma.miraclePost.update({
      where: { id: postId },
      data:  { upvotes, heartCount, rankScore },
      select: { id: true, upvotes: true, heartCount: true, rankScore: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
