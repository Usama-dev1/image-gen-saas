import { authGuard } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { BillingView } from "./BillingView";

export async function BillingContainer() {
  const userId = await authGuard();
  await connectDB();

  const user = await User.findById(userId).select("plan credits email").lean();

  const plan = user?.plan || "free";
  const credits = user?.credits || 0;

  return <BillingView plan={plan} credits={credits} />;
}
