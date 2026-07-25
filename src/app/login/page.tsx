import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { LoginContainer } from "./LoginContainer"

export function generateMetadata(): Metadata {
  return {
    title: "Log In | AI Image Generator",
    description: "Log in to your account to start generating amazing images with AI.",
  }
}

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main>
      <LoginContainer />
    </main>
  )
}
