import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Shared helper to validate incoming request bodies against a Zod schema.
 * Automatically handles JSON parsing errors and Zod validation errors,
 * returning a structured 400 response on failure.
 */
export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data?: T; errorResponse?: NextResponse }> {
  let body: any;

  try {
    body = await req.json();
  } catch (error) {
    return {
      errorResponse: NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    return {
      errorResponse: NextResponse.json(
        {
          error: "Validation failed",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
    };
  }

  return { data: result.data };
}
