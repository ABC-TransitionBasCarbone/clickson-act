import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";

// Link teacher to school
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teacherId, schoolId } = body;

    if (!teacherId || !schoolId) {
      return NextResponse.json(
        { error: "Teacher ID and School ID are required" },
        { status: 400 },
      );
    }

    // Find teacher document
    const teacherDoc = await adminDb
      .collection("teachers")
      .where("name", "==", teacherId)
      .limit(1)
      .get();

    if (teacherDoc.empty) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Update teacher with schoolId
    await teacherDoc.docs[0].ref.update({
      schoolId: schoolId,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Teacher linked to school successfully",
    });
  } catch (error: unknown) {
    console.error("Error linking teacher to school:", error);
    return NextResponse.json(
      { error: "Failed to link teacher to school. Please try again." },
      { status: 500 },
    );
  }
}
