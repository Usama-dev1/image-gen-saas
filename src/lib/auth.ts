import { betterAuth } from "better-auth";
import { getLocationFromIP } from "./geoip";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Connect directly via MongoClient for Better Auth
const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user" },
      credits: { type: "number", defaultValue: 0 },
      plan: { type: "string", defaultValue: "free" },
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
