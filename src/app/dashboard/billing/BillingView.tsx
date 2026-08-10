"use client";

import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Coins, CreditCard, Zap } from "lucide-react";

export type BillingViewProps = {
  plan: string;
  credits: number;
};

export function BillingView({ plan, credits }: BillingViewProps) {
  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-5xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Billing & Plan</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and credit balance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="size-5 text-muted-foreground" />
              <CardTitle className="m-0">Current Plan</CardTitle>
            </div>
            <div className="text-3xl font-bold uppercase tracking-wider text-foreground mb-4">
              {plan}
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              You are currently on the free plan. Upgrade to unlock more features and monthly credits.
            </p>
            <Button className="btn-secondary w-full">Manage Subscription</Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="size-5 text-muted-foreground" />
              <CardTitle className="m-0">Available Credits</CardTitle>
            </div>
            <div className="text-4xl font-bold text-emerald-500 mb-4">
              {credits.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Credits are used to generate images. Standard models cost 1 credit, premium models cost more.
            </p>
            <Button className="btn-primary w-full">Buy More Credits</Button>
          </CardBody>
        </Card>
      </div>

      <section className="pt-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Upgrade your plan</h2>
          <p className="text-muted-foreground mt-2">Choose the plan that fits your needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Pro Plan */}
          <Card className="relative overflow-hidden border-border/50">
            <div className="absolute top-0 inset-x-0 h-1 bg-neutral-500" />
            <CardBody className="p-8">
              <h3 className="text-xl font-bold">Pro</h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                $10
                <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-8 space-y-4">
                {["1,000 monthly credits", "Access to all standard models", "Up to 5 saved characters", "Standard support"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="btn-outline w-full mt-8">Upgrade to Pro</Button>
            </CardBody>
          </Card>

          {/* Max Plan */}
          <Card className="relative overflow-hidden border-primary">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Most Popular
            </div>
            <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
            <CardBody className="p-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Max <Zap className="size-4 text-primary fill-primary" />
              </h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                $25
                <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-8 space-y-4">
                {["3,000 monthly credits", "Access to PRO models (Flux, SD3)", "Unlimited saved characters", "Priority support"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="btn-primary w-full mt-8">Upgrade to Max</Button>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
