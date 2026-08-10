"use client";
// Reason: Holds form state and handles client-side auth submission

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { LoginView } from "./LoginView";

export function LoginContainer() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Reset state
    setLoading(true);
    setError(null);
    setFieldErrors({});

    // 2. Client-side validation
    const newFieldErrors: any = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newFieldErrors.email = "Please enter a valid email address.";
    }
    if (password.length < 1) {
      newFieldErrors.password = "Password is required.";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    // 3. Call Better Auth client-side sign in
    const { error: signInError } = await signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || "Invalid email or password");
      setLoading(false);
      return;
    }

    // 4. Redirect on success
    router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    const options = {
      provider: "google" as const,
      callbackURL: "/dashboard",
    };
    await signIn.social(options);
  };

  return (
    <LoginView
      onSubmit={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      error={error}
      fieldErrors={fieldErrors}
      loading={loading}
    />
  );
}
