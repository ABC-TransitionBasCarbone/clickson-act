import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../../firebaseAdmin";

export async function POST(req: NextRequest) {
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
    const body = await req.json();
    const { teacherId, action } = body; // action: 'approve' or 'reject'

    if (!teacherId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: teacherId and action" },
        { status: 400 },
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 },
      );
    }

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
        { error: "Only the referent teacher can approve/reject teachers" },
        { status: 403 },
      );
    }

    const pendingTeachers = schoolData.pendingTeachers || [];
    const pendingTeacher = pendingTeachers.find(
      (pt: { teacherId: string }) => pt.teacherId === teacherId,
    );

    if (!pendingTeacher) {
      return NextResponse.json(
        { error: "Pending teacher not found" },
        { status: 404 },
      );
    }

    if (action === "approve") {
      // Update the pending teacher's record to mark as approved
      await adminDb.collection("teachers").doc(teacherId).update({
        approved: true,
        approvedAt: new Date().toISOString(),
        approvedBy: userId,
      });

      // Remove from pending list
      const updatedPendingTeachers = pendingTeachers.filter(
        (pt: { teacherId: string }) => pt.teacherId !== teacherId,
      );

      await adminDb.collection("schools").doc(schoolId).update({
        pendingTeachers: updatedPendingTeachers,
      });

      return NextResponse.json({
        success: true,
        message: "Teacher approved successfully",
      });
    } else {
      // Reject - delete the teacher account
      // Remove from pending list first
      const updatedPendingTeachers = pendingTeachers.filter(
        (pt: { teacherId: string }) => pt.teacherId !== teacherId,
      );

      await adminDb.collection("schools").doc(schoolId).update({
        pendingTeachers: updatedPendingTeachers,
      });

      // Delete the teacher from Firestore
      await adminDb.collection("teachers").doc(teacherId).delete();

      // Delete from Firebase Auth
      try {
        await adminAuth.deleteUser(teacherId);
      } catch (error) {
        console.error("Error deleting user from Auth:", error);
        // Continue anyway - user was already removed from Firestore
      }

      return NextResponse.json({
        success: true,
        message: "Teacher rejected and account deleted",
      });
    }
  } catch (error: unknown) {
    console.error("Approve/reject teacher error:", error);
    return NextResponse.json(
      { error: "Failed to process teacher approval" },
      { status: 500 },
    );
  }
}


