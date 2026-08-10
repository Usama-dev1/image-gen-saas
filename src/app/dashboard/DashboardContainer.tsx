import { DashboardView, Generation as GenerationType } from "./DashboardView";
import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { Generation } from "@/models/Generation";

export async function DashboardContainer() {
  const userId = await authGuard();
  await connectDB();

  // 1. Fetch user to get credits
  const userDoc = await User.findById(userId).select("credits").lean();
  const credits = userDoc?.credits || 0;

  // 2. Fetch recent successful generations
  const rawGenerations = await Generation.find({
    userId,
    isDeleted: false,
    status: "succeeded",
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();
    
  // 3. Map to frontend type
  const recentGenerations: GenerationType[] = rawGenerations.map((gen: any, index: number) => ({
    id: gen._id?.toString() || String(index),
    src: gen.outputUrl || "",
    label: index === 0 ? "Latest Generation" : undefined,
    desc: gen.prompt,
    featured: index === 0,
    wide: index === 3, // keep the 4th item wide for layout aesthetics as in mock
  }));

  return <DashboardView credits={credits} recentGenerations={recentGenerations} />;
}
