import { Metadata } from "next";
import { BillingContainer } from "./BillingContainer";

export function generateMetadata(): Metadata {
  return {
    title: "Billing & Plan | Consistent AI",
    description: "Manage your subscription, buy credits, and view billing history.",
  };
}

export default function BillingPage() {
  return <BillingContainer />;
}
