import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

// Export simple helpers so components don't need to dive into authClient object
export const { signIn, signUp, signOut, useSession } = authClient;
