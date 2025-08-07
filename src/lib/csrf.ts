import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// Generate a random CSRF token
export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex");
}

// Validate CSRF token
export function validateCSRFToken(
  token: string,
  sessionToken: string,
): boolean {
  if (!token || !sessionToken) {
    return false;
  }
  return token === sessionToken;
}

// CSRF middleware for API routes
export function withCSRFProtection(
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    // Skip CSRF check for GET requests
    if (req.method === "GET") {
      return handler(req);
    }

    const csrfToken = req.headers.get("X-CSRF-Token");
    const sessionToken = req.headers.get("X-Session-Token"); // You'd get this from your session

    if (!validateCSRFToken(csrfToken || "", sessionToken || "")) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 },
      );
    }

    return handler(req);
  };
}

// Helper to get CSRF token for forms
export function getCSRFToken(): string {
  // In a real app, you'd get this from your session
  return generateCSRFToken();
}
