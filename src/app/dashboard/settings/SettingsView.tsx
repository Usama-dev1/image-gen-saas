"use client";

import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Shield, LogOut, Sun, Moon, Palette } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export type ActiveSession = {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  isCurrent: boolean;
  lastActive: string;
};

export type SettingsViewProps = {
  sessions: ActiveSession[];
};

export function SettingsView({ sessions }: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and security preferences.</p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="size-5 text-foreground" />
          <h2 className="text-xl font-semibold">Appearance</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Customize the appearance of the application.
        </p>

        <div className="flex gap-4">
          <Button
            type="button"
            className={mounted && theme === "light" ? "btn-primary flex-1 max-w-xs" : "btn-outline flex-1 max-w-xs"}
            onClick={() => setTheme("light")}
          >
            <Sun className="size-4 mr-2" />
            Light
          </Button>
          <Button
            type="button"
            className={mounted && theme === "dark" ? "btn-primary flex-1 max-w-xs" : "btn-outline flex-1 max-w-xs"}
            onClick={() => setTheme("dark")}
          >
            <Moon className="size-4 mr-2" />
            Dark
          </Button>
          <Button
            type="button"
            className={mounted && theme === "system" ? "btn-primary flex-1 max-w-xs" : "btn-outline flex-1 max-w-xs"}
            onClick={() => setTheme("system")}
          >
            <Monitor className="size-4 mr-2" />
            System
          </Button>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-5 text-foreground" />
          <h2 className="text-xl font-semibold">Active Sessions</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          These are the devices that are currently logged into your account. Revoke any sessions that you do not recognize.
        </p>

        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardBody className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {session.device === "iPhone" ? (
                      <Smartphone className="size-5 text-foreground" />
                    ) : (
                      <Monitor className="size-5 text-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">
                        {session.device} • {session.browser}
                      </p>
                      {session.isCurrent && (
                        <Badge className="badge-primary text-[10px]">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {session.ipAddress} • Last active {session.lastActive}
                    </p>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  className="btn-outline btn-sm text-destructive hover:bg-destructive/10 hover:border-destructive w-full md:w-auto"
                  disabled={session.isCurrent}
                >
                  <LogOut className="size-3.5 mr-1.5" />
                  Revoke
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
