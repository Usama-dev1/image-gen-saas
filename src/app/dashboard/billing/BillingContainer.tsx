import { BillingView } from "./BillingView";

export function BillingContainer() {
  // Mock data fetching for billing details
  const mockPlan = "free";
  const mockCredits = 1240;

  return <BillingView plan={mockPlan} credits={mockCredits} />;
}
