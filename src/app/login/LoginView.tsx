import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export type LoginViewProps = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogleLogin: () => void;
  error: string | null;
  fieldErrors?: any;
  loading: boolean;
};

export function LoginView({ onSubmit, onGoogleLogin, error, fieldErrors = {}, loading }: LoginViewProps) {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-base-content/70 mt-2">Log in to your account to continue</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-md">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className={fieldErrors.email ? "border-red-500" : ""} />
              {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className={fieldErrors.password ? "border-red-500" : ""} />
              {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
            </div>

            <Button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? "Logging In..." : "Log In"}
            </Button>
          </form>

          <div className="flex items-center gap-2 my-2 before:h-px before:flex-1 before:bg-base-content/10 after:h-px after:flex-1 after:bg-base-content/10">
            <span className="text-xs uppercase text-base-content/50">Or continue with</span>
          </div>

          <div className="flex flex-col gap-3">
            <Button type="button" className="btn-outline w-full" onClick={onGoogleLogin}>Google</Button>
          </div>

          <p className="text-center text-sm mt-4">
            Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
