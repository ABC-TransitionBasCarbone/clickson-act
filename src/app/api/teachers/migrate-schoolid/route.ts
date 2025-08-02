import { NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";

// Migrate existing teachers to have proper schoolId references
export async function POST() {
  try {
    // Get all teachers without schoolId but with school name
    const teachersQuery = await adminDb
      .collection("teachers")
      .where("schoolId", "==", null)
      .get();

    const results = [];

    for (const teacherDoc of teachersQuery.docs) {
      const teacherData = teacherDoc.data();
      if (teacherData.school) {
        // Find the school by name
        const schoolQuery = await adminDb
          .collection("schools")
          .where("name", "==", teacherData.school)
          .limit(1)
          .get();

        if (!schoolQuery.empty) {
          const schoolId = schoolQuery.docs[0].id;

          // Update teacher with schoolId
          await teacherDoc.ref.update({
            schoolId: schoolId,
            updatedAt: new Date().toISOString(),
          });

          results.push({
            teacherId: teacherDoc.id,
            teacherName: teacherData.name,
            schoolName: teacherData.school,
            schoolId: schoolId,
            status: "updated",
          });
        } else {
          results.push({
            teacherId: teacherDoc.id,
            teacherName: teacherData.name,
            schoolName: teacherData.school,
            status: "school_not_found",
          });
        }
      } else {
        results.push({
          teacherId: teacherDoc.id,
          teacherName: teacherData.name,
          status: "no_school_name",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} teachers`,
      results,
    });
  } catch (error: unknown) {
    console.error("Error migrating teachers:", error);
    return NextResponse.json(
      { error: "Failed to migrate teachers" },
      { status: 500 },
    );
  }
}
