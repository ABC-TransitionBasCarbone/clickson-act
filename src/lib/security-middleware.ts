import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../firebaseAdmin";
import { verifyAuthToken } from "./auth-middleware";

// Enhanced security middleware for API routes
export interface SecurityContext {
  uid: string;
  email?: string;
  role?: string;
  projectId?: string;
  teacherId?: string;
  isTeacher?: boolean;
}

// Project access validation
export async function validateProjectAccess(
  projectId: string,
  uid: string,
): Promise<{ hasAccess: boolean; isTeacher?: boolean; error?: string }> {
  try {
    // Check if user is a teacher for this project
    const projectDoc = await adminDb
      .collection("projects")
      .doc(projectId)
      .get();

    if (!projectDoc.exists) {
      return { hasAccess: false, error: "Project not found" };
    }

    const projectData = projectDoc.data();

    // Check if user is the teacher of this project
    if (projectData?.teacherId === uid) {
      return { hasAccess: true, isTeacher: true };
    }

    // Check if user is a student in this project
    const studentQuery = await adminDb
      .collection("projects")
      .doc(projectId)
      .collection("students")
      .where("studentId", "==", uid)
      .limit(1)
      .get();

    if (!studentQuery.empty) {
      return { hasAccess: true, isTeacher: false };
    }

    // Check if user is an admin
    const adminDoc = await adminDb.collection("admins").doc(uid).get();
    if (adminDoc.exists) {
      return { hasAccess: true, isTeacher: true };
    }

    return { hasAccess: false, error: "Access denied" };
  } catch (error) {
    console.error("Error validating project access:", error);
    return { hasAccess: false, error: "Access validation failed" };
  }
}

// Input sanitization
export function sanitizeInput(input: unknown): unknown {
  if (typeof input === "string") {
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (input && typeof input === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

// Enhanced authentication middleware with project access control
export function withProjectAuth(
  handler: (
    req: NextRequest,
    context: SecurityContext,
  ) => Promise<NextResponse>,
  requireTeacherAccess = false,
) {
  return async (
    req: NextRequest,
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    try {
      // Verify authentication token
      const authResult = await verifyAuthToken(req);
      if (!authResult.success) {
        return NextResponse.json(
          { error: authResult.error || "Authentication required" },
          { status: 401 },
        );
      }

      const uid = authResult.uid!;

      // Get user info
      const userRecord = await adminAuth.getUser(uid);

      // Extract project ID from route params
      let projectId: string | undefined;
      if (routeParams?.params) {
        const params = await routeParams.params;
        projectId = params.id;
      }

      // Validate project access if projectId is provided
      if (projectId) {
        const accessResult = await validateProjectAccess(projectId, uid);

        if (!accessResult.hasAccess) {
          return NextResponse.json(
            { error: accessResult.error || "Access denied" },
            { status: 403 },
          );
        }

        // Check if teacher access is required
        if (requireTeacherAccess && !accessResult.isTeacher) {
          return NextResponse.json(
            { error: "Teacher access required" },
            { status: 403 },
          );
        }
      }

      // Create security context
      const context: SecurityContext = {
        uid,
        email: userRecord.email,
        projectId,
        isTeacher: projectId
          ? await validateProjectAccess(projectId, uid).then((r) => r.isTeacher)
          : undefined,
      };

      return handler(req, context);
    } catch (error) {
      console.error("Security middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }
  };
}

// Rate limiting with IP-based tracking
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  maxRequests = 100,
  windowMs = 60000, // 1 minute
) {
  return async (req: NextRequest) => {
    const clientId =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < windowStart) {
        rateLimitMap.delete(key);
      }
    }

    const clientData = rateLimitMap.get(clientId) || {
      count: 0,
      resetTime: now + windowMs,
    };

    if (clientData.count >= maxRequests && clientData.resetTime > now) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        },
        { status: 429 },
      );
    }

    clientData.count++;
    rateLimitMap.set(clientId, clientData);

    return handler(req);
  };
}

// CSRF protection
export function withCSRFProtection(
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    // Skip CSRF for GET requests
    if (req.method === "GET") {
      return handler(req);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _csrfToken = req.headers.get("x-csrf-token");
    const origin = req.headers.get("origin");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _referer = req.headers.get("referer");

    // Validate origin/referer for same-origin requests
    if (
      origin &&
      !origin.includes(process.env.NEXT_PUBLIC_APP_URL || "localhost")
    ) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    return handler(req);
  };
}

// Input validation helpers
export function validateProjectId(projectId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(projectId) && projectId.length <= 50;
}

export function validateStudentName(name: string): boolean {
  return (
    name.trim().length >= 1 &&
    name.trim().length <= 100 &&
    /^[a-zA-Z0-9\s\-'\.]+$/.test(name.trim())
  );
}

export function validateActionIds(actionIds: string[]): boolean {
  return (
    Array.isArray(actionIds) &&
    actionIds.length > 0 &&
    actionIds.length <= 50 &&
    actionIds.every((id) => /^[a-zA-Z0-9_-]+$/.test(id))
  );
}

// Comprehensive security wrapper
export function withSecurity(
  handler: (
    req: NextRequest,
    context: SecurityContext,
  ) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    requireTeacherAccess?: boolean;
    rateLimit?: { maxRequests: number; windowMs: number };
    csrfProtection?: boolean;
  } = {},
) {
  let wrappedHandler = handler;

  // Apply CSRF protection
  if (options.csrfProtection !== false) {
    wrappedHandler = withCSRFProtection(
      wrappedHandler as (req: NextRequest) => Promise<NextResponse>,
    ) as typeof wrappedHandler;
  }

  // Apply rate limiting
  if (options.rateLimit) {
    wrappedHandler = withRateLimit(
      wrappedHandler as (req: NextRequest) => Promise<NextResponse>,
      options.rateLimit.maxRequests,
      options.rateLimit.windowMs,
    ) as typeof wrappedHandler;
  }

  // Apply authentication
  if (options.requireAuth !== false) {
    wrappedHandler = withProjectAuth(
      wrappedHandler,
      options.requireTeacherAccess,
    ) as unknown as typeof wrappedHandler;
  }

  return wrappedHandler;
}
