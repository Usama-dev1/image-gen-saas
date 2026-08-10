import { auth } from "../src/lib/auth";

async function main() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "demo@example.com",
        password: "Password123!",
        name: "Demo User",
      },
    });
    console.log("SUCCESS: User created!", res);
  } catch (error: any) {
    console.log("INFO: User creation result/status:", error?.message || error);
  }
  process.exit(0);
}

main();
