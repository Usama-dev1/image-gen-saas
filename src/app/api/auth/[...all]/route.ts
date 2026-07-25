import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Better Auth automatically handles all auth routes (login, register, session) internally here
export const { GET, POST } = toNextJsHandler(auth);
