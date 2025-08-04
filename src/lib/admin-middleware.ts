import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../firebaseAdmin";

interface AuthenticatedRequest extends NextRequest {
  user: {
    uid: string;
    email: string;
    role: string;
  };
}

export async function withAdminAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Unauthorized - No token provided" },
          { status: 401 },
        );
      }

      const token = authHeader.substring(7);

      // Verify the token
      const decodedToken = await adminAuth.verifyIdToken(token);

      // Check if user exists in admin collection
      const adminDoc = await adminDb
        .collection("admins")
        .doc(decodedToken.uid)
        .get();
      if (!adminDoc.exists) {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 },
        );
      }

      // Add user info to request
      (req as NextRequest & { user: typeof decodedToken }).user = decodedToken;

      return handler(req as AuthenticatedRequest);
    } catch (error) {
      console.error("Admin auth error:", error);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }
  };
}

// Rate limiting for admin endpoints
export function withAdminRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  maxRequests: number = 10,
  windowMs: number = 60000,
) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return async (req: NextRequest) => {
    const clientId = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    const clientData = requestCounts.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    } else if (clientData.count >= maxRequests) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    } else {
      clientData.count++;
    }

    return handler(req);
  };
}
