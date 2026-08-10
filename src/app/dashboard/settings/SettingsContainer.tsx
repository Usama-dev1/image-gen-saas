import { SettingsView, ActiveSession } from "./SettingsView";

export function SettingsContainer() {
  // Mock data fetching for active sessions
  const mockSessions: ActiveSession[] = [
    {
      id: "sess_1",
      device: "Windows",
      browser: "Chrome",
      ipAddress: "192.168.1.1",
      isCurrent: true,
      lastActive: "Just now",
    },
    {
      id: "sess_2",
      device: "iPhone",
      browser: "Safari",
      ipAddress: "10.0.0.5",
      isCurrent: false,
      lastActive: "2 hours ago",
    },
  ];

  return <SettingsView sessions={mockSessions} />;
}
