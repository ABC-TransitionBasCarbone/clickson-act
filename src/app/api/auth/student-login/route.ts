import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import { withRateLimit } from "../../../../lib/auth-middleware";

async function studentLoginHandler(req: NextRequest) {
  try {
    const { passcode, name } = await req.json();

    // Input validation
    if (!passcode || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedPasscode = passcode.trim();

    if (sanitizedName.length < 1 || sanitizedName.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 1 and 100 characters" },
        { status: 400 },
      );
    }

    if (sanitizedPasscode.length < 1) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 400 });
    }

    // Find project with this passcode
    const projectDoc = await adminDb
      .collection("projects")
      .doc(sanitizedPasscode)
      .get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 404 });
    }
    // Register student under this project
    const studentId = uuidv4();
    await adminDb
      .collection("projects")
      .doc(sanitizedPasscode)
      .collection("students")
      .doc(studentId)
      .set({
        id: studentId,
        name: sanitizedName,
        joinedAt: new Date().toISOString(),
      });
    return NextResponse.json({
      studentId,
      name: sanitizedName,
      projectId: sanitizedPasscode,
    });
  } catch (error: unknown) {
    console.error("Student login error:", error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}

// Export with rate limiting (10 attempts per minute)
export const POST = withRateLimit(studentLoginHandler, 10, 60000);
