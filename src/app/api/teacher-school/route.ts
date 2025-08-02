import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../firebaseAdmin";

// Get teacher's school information
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 },
      );
    }

    // Get teacher document to find their schoolId
    const teacherDoc = await adminDb
      .collection("teachers")
      .where("name", "==", teacherId)
      .limit(1)
      .get();

    if (teacherDoc.empty) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const teacherData = teacherDoc.docs[0].data();

    let schoolData = null;

    // Get school document if teacher has a schoolId
    if (teacherData.schoolId) {
      const schoolDoc = await adminDb
        .collection("schools")
        .doc(teacherData.schoolId)
        .get();

      if (schoolDoc.exists) {
        schoolData = {
          id: schoolDoc.id,
          ...schoolDoc.data(),
        };
      }
    }

    return NextResponse.json({
      success: true,
      teacher: teacherData,
      school: schoolData,
    });
  } catch (error: unknown) {
    console.error("Error fetching teacher school:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher school. Please try again." },
      { status: 500 },
    );
  }
}
