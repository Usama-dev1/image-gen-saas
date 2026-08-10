import { UserLimits } from "@/models/User";

/**
 * Returns the default fields applied to every new user created via Better Auth.
 */
export function getInitialUserFields(user: any) {
  return {
    ...user,
    role: "user",
    status: "active",
    credits: 10, // Give brand new users 10 free credits to start
    storageUsedBytes: 0,
    plan: "free",
    // Define their default limits
    limits: {
      maxCredits: 100,
      maxGenerationsPerDay: 50,
      maxStorage: 1024 * 1024 * 500, // 500MB
    } as UserLimits,
  };
}
