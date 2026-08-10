import { Metadata } from "next";
import { SettingsContainer } from "./SettingsContainer";

export function generateMetadata(): Metadata {
  return {
    title: "Settings | Consistent AI",
    description: "Manage your account settings and active sessions.",
  };
}

export default function SettingsPage() {
  return <SettingsContainer />;
}
