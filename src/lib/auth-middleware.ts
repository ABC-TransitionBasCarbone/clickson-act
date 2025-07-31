import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../firebaseAdmin";

export async function verifyAuthToken(
  req: NextRequest,
): Promise<{ success: boolean; uid?: string; error?: string }> {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: "Missing or invalid authorization header",
      };
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return { success: false, error: "Missing token" };
    }

    // Verify the Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return { success: false, error: "Invalid token" };
    }

    return { success: true, uid: decodedToken.uid };
  } catch (error) {
    console.error("Token verification error:", error);
    return { success: false, error: "Token verification failed" };
  }
}

export function createAuthenticatedHandler(
  handler: (req: NextRequest, uid: string) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    const authResult = await verifyAuthToken(req);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || "Authentication required" },
        { status: 401 },
      );
    }

    return handler(req, authResult.uid!);
  };
}

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  maxRequests = 10,
  windowMs = 60000,
) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (req: NextRequest) => {
    const clientId =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key);
      }
    }

    const clientRequests = requests.get(clientId) || {
      count: 0,
      resetTime: now + windowMs,
    };

    if (clientRequests.count >= maxRequests && clientRequests.resetTime > now) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }

    clientRequests.count++;
    requests.set(clientId, clientRequests);

    return handler(req);
  };
}
