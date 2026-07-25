import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET() {
  console.log("[api/test-db] called GET");

  try {
    // 1. Attempt to connect to the database
    await connectDB();
    
    return NextResponse.json({ message: "Successfully connected to MongoDB!" }, { status: 200 });
  } catch (error: any) {
    console.error("[api/test-db] Failed to connect:", error);
    return NextResponse.json({ error: "Failed to connect to the database" }, { status: 500 });
  }
}
