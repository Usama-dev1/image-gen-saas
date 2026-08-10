import {
  UserPlus,
  Sparkles,
  Coins,
  Download,
  MoreHorizontal,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type Generation = {
  id: string;
  src: string;
  label?: string;
  desc?: string;
  featured?: boolean;
  wide?: boolean;
};

export type DashboardViewProps = {
  credits: number;
  recentGenerations: Generation[];
};

export function DashboardView({ credits, recentGenerations }: DashboardViewProps) {
  return (
    <div className="px-4 md:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
      {/* Welcome */}
      <section>
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tighter">
          Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Recent activity and quick actions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link href="/dashboard/characters" className="block h-full">
            <Card className="card-interactive group h-full">
              <CardBody className="p-6">
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <UserPlus className="size-5 text-foreground group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Create Character</h3>
                <p className="text-sm text-muted-foreground">
                  Train a new consistent identity
                </p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/dashboard/batch" className="block h-full">
            <Card className="card-interactive group h-full">
              <CardBody className="p-6">
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <Sparkles className="size-5 text-foreground group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Batch Generate</h3>
                <p className="text-sm text-muted-foreground">
                  Create multiple poses at once
                </p>
              </CardBody>
            </Card>
          </Link>

          <Card>
            <CardBody className="p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Credits Remaining
                </span>
                <Coins className="size-4 text-foreground" />
              </div>
              <div className="text-3xl font-semibold text-foreground">
                {credits.toLocaleString()}
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-foreground/20 h-full rounded-full transition-all"
                  style={{ width: "75%" }}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Recent Generations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Generations</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[150px] md:auto-rows-[200px]">
          {/* Featured large item */}
          {recentGenerations.length > 0 && (
            <div className="col-span-2 row-span-2 rounded-xl overflow-hidden relative group border border-border/50">
              {recentGenerations[0].src ? (
                <Image src={recentGenerations[0].src} alt={recentGenerations[0].desc || "Recent generation"} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                {recentGenerations[0].label && (
                  <Badge className="badge-neutral w-fit mb-1 text-[10px] uppercase">
                    {recentGenerations[0].label}
                  </Badge>
                )}
                <p className="text-white text-sm line-clamp-2">
                  {recentGenerations[0].desc}
                </p>
                <div className="flex gap-2 mt-3 relative z-10">
                  <a
                    href={recentGenerations[0].src}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-icon size-8 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white"
                  >
                    <Download className="size-3.5" />
                  </a>
                  <Link href="/dashboard/generations" className="btn btn-ghost btn-icon size-8 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white flex items-center justify-center">
                    <MoreHorizontal className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Standard items */}
          {recentGenerations.slice(1).map((gen, i) => (
            <div
              key={gen.id || i}
              className={`rounded-xl overflow-hidden relative group border border-border/50 ${
                gen.wide ? "col-span-2" : ""
              }`}
            >
              {gen.src ? (
                <Image src={gen.src} alt={gen.desc || "Recent generation"} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${["from-neutral-700 to-neutral-800", "from-neutral-600 to-neutral-900", "from-neutral-800 to-neutral-700"][i % 3]}`}
                />
              )}
              <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur rounded-md px-2 py-1 flex items-center gap-1">
                <Wand2 className="size-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
