import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../../firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // Get the authorization token from headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);

    // Verify the token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    const userId = decodedToken.uid;

    // Get the teacher's school
    const teacherDoc = await adminDb.collection("teachers").doc(userId).get();
    if (!teacherDoc.exists) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 },
      );
    }

    const teacherData = teacherDoc.data();
    const schoolId = teacherData?.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: "Teacher not associated with a school" },
        { status: 400 },
      );
    }

    // Get the school data
    const schoolDoc = await adminDb.collection("schools").doc(schoolId).get();
    if (!schoolDoc.exists) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 },
      );
    }

    const schoolData = schoolDoc.data();

    // Check if user is the referent teacher
    if (schoolData?.referentTeacherId !== userId) {
      return NextResponse.json(
        { error: "Only the referent teacher can view pending approvals" },
        { status: 403 },
      );
    }

    const pendingTeachers = schoolData.pendingTeachers || [];

    return NextResponse.json({
      success: true,
      pendingTeachers,
      schoolId,
      schoolName: schoolData.name,
    });
  } catch (error: unknown) {
    console.error("Get pending teachers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending teachers" },
      { status: 500 },
    );
  }
}


