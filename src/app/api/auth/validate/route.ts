import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "../../../../lib/auth-middleware";

export async function POST(req: NextRequest) {
  try {
    const verification = await verifyAuthToken(req);

    if (verification.success && verification.uid) {
      return NextResponse.json(
        {
          valid: true,
          uid: verification.uid,
        },
        {
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
          },
        },
      );
    } else {
      return NextResponse.json(
        {
          valid: false,
          error: verification.error,
        },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );
    }
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Validation failed",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  }
}
