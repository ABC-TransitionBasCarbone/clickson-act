import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "../../../../lib/auth-middleware";

export async function POST(req: NextRequest) {
  try {
    const verification = await verifyAuthToken(req);

    if (verification.success && verification.uid) {
      return NextResponse.json({
        valid: true,
        uid: verification.uid,
      });
    } else {
      return NextResponse.json(
        {
          valid: false,
          error: verification.error,
        },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Validation failed",
      },
      { status: 500 },
    );
  }
}
