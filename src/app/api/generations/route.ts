import { NextResponse } from "next/server";
import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { Generation } from "@/models/Generation";

export async function GET(req: Request) {
  try {
    const userId = await authGuard();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    
    // Max 50
    const safeLimit = Math.min(limit, 50);

    const query: any = {
      userId,
      isDeleted: false,
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const generations = await Generation.find(query)
      .sort({ _id: -1 }) // Equivalent to createdAt desc for ObjectIds
      .limit(safeLimit)
      .lean();

    let nextCursor = null;
    if (generations.length === safeLimit) {
      nextCursor = generations[generations.length - 1]._id.toString();
    }

    return NextResponse.json({
      generations,
      nextCursor,
    });
  } catch (error) {
    console.error("[generations-get] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
