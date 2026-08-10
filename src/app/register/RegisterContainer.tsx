"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp, signIn } from "@/lib/auth-client"
import { RegisterView } from "./RegisterView"
export function RegisterContainer() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setLoading(true);
    setError(null);
    setFieldErrors({});

    const newFieldErrors: any = {};
    if (name.length < 2) {
      newFieldErrors.name = "Name must be at least 2 characters.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newFieldErrors.email = "Please enter a valid email address.";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
      newFieldErrors.password = "Password must be at least 8 chars with an uppercase, lowercase, number, and special character.";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp.email({
      name,
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message || "Failed to register");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard"
    });
  };

  return <RegisterView onSubmit={handleRegister} onGoogleLogin={handleGoogleLogin} error={error} fieldErrors={fieldErrors} loading={loading} />
}
