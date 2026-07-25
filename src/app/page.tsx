import type { Metadata } from "next";
import Link from "next/link";
import { Wand2, Layers, Sparkles, ArrowRight, Check } from "lucide-react";
import { MobileMenu } from "@/components/nav/mobile-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Generate AI characters with consistent faces, styles, and poses across every image. No more random outputs — just reliable, studio-quality results.",
  openGraph: {
    title: "Consistent AI — Character Studio",
    description:
      "Generate AI characters with consistent faces, styles, and poses across every image.",
  },
};

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Consistent AI
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              {!isLoggedIn ? (
                <>
                  <Link href="/login" className="btn btn-ghost">
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-primary">
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="btn btn-ghost">
                    Dashboard
                  </Link>
                  <form action={async () => {
                    "use server";
                    const { auth } = await import("@/lib/auth");
                    const { headers } = await import("next/headers");
                    const { redirect } = await import("next/navigation");
                    await auth.api.signOut({
                      headers: await headers()
                    });
                    redirect("/");
                  }}>
                    <button type="submit" className="btn btn-ghost btn-logout">Logout</button>
                  </form>
                </>
              )}
              <Link href="/dashboard/studio" className="btn btn-primary">
                Get Started
              </Link>
            </div>
            <MobileMenu isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-glow mx-auto max-w-7xl px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
        <Badge className="badge-neutral mb-4">
          AI-Powered Character Studio
        </Badge>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Consistent Characters.
          <br />
          <span className="text-primary">Every Time.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Generate AI characters with consistent faces, styles, and poses across
          every image. No more random outputs — just reliable, studio-quality
          results.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto sm:max-w-none">
          <Link href="/dashboard/studio" className="btn btn-primary btn-lg w-full sm:w-auto">
            Start Creating <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link href="/dashboard/batch" className="btn btn-outline btn-lg w-full sm:w-auto">
            Batch Generate <Layers className="ml-2 size-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-16 md:pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardBody className="pt-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Wand2 className="size-6 text-primary" />
              </div>
              <CardTitle className="mb-2">Character Studio</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload reference images and generate new poses, expressions, and
                styles while keeping your character perfectly consistent.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="pt-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Layers className="size-6 text-primary" />
              </div>
              <CardTitle className="mb-2">Batch Processing</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate hundreds of variants at once. Set parameters, apply
                prompts, and let AI do the heavy lifting in parallel.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="pt-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>
              <CardTitle className="mb-2">AI Precision</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fine-tune every detail with advanced controls for style
                reference, face consistency, composition, and color palette.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Features List */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-20">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Everything you need
              </h2>
              <ul className="space-y-4">
                {[
                  "Face-consistent character generation",
                  "Multi-pose and multi-style support",
                  "Batch generation with parallel processing",
                  "Style reference image matching",
                  "Advanced prompt engineering tools",
                  "Export in multiple formats",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card>
              <CardBody className="flex items-center justify-center h-full text-center">
                <p className="text-4xl font-bold text-primary mb-2">Ready?</p>
                <p className="text-muted-foreground mb-6">
                  Jump into the studio and create your first character.
                </p>
                <Link href="/dashboard/studio" className="btn btn-primary btn-lg w-full sm:w-auto mt-2">
                  Open Studio <ArrowRight className="ml-2 size-4" />
                </Link>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          Consistent AI &mdash; Character Studio
        </div>
      </footer>
    </div>
  );
}
