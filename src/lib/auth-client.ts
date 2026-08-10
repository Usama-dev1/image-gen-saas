import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

// Export simple helpers so components don't need to dive into authClient object
export const { signIn, signUp, signOut, useSession } = authClient;
