import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getLocationFromIP } from "./geoip";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { getInitialUserFields } from "./user";

// Connect directly via MongoClient for Better Auth
const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  plugins: [nextCookies()],
  database: mongodbAdapter(db),
  user: {
    additionalFields: {
      role: { type: "string", required: false },
      status: { type: "string", required: false },
      credits: { type: "number", required: false },
      storageUsedBytes: { type: "number", required: false },
      plan: { type: "string", required: false },
      planExpiresAt: { type: "date", required: false },
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14, // 14 days
    updateAge: 60 * 60 * 24, // Update DB once every 24 hours to prevent constant writes
    additionalFields: {
      location: { type: "string", required: false },
    }
  },
  databaseHooks: {
    // Intercept user creation to inject our Mongoose defaults natively!
    // This removes the need for a separate "hydration" step.
    user: {
      create: {
        before: async (user) => ({
          data: getInitialUserFields(user)
        })
      }
    },
    session: {
      create: {
        before: async (data) => ({
          data: {
            ...data,
            location: getLocationFromIP(data.ipAddress),
          }
        })
      }
    }
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
