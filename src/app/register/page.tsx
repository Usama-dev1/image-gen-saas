import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { RegisterContainer } from "./RegisterContainer"

export function generateMetadata(): Metadata {
  return {
    title: "Sign Up | AI Image Generator",
    description: "Create a new account to start generating AI images.",
  }
}

export default async function RegisterPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main>
      <RegisterContainer />
    </main>
  )
}
