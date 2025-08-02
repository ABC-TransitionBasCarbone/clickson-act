import { NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

// Initialize default schools in the database
export async function POST() {
  try {
    const defaultSchools = [
      { name: "School A", goal: 40, deadlineYear: "2030" },
      { name: "School B", goal: 45, deadlineYear: "2030" },
      { name: "School C", goal: 35, deadlineYear: "2030" },
    ];

    const results = [];

    for (const schoolData of defaultSchools) {
      // Check if school already exists
      const existingSchool = await adminDb
        .collection("schools")
        .where("name", "==", schoolData.name)
        .limit(1)
        .get();

      if (existingSchool.empty) {
        // Create the school
        const schoolId = uuidv4();
        const newSchool = {
          id: schoolId,
          name: schoolData.name,
          goal: schoolData.goal,
          deadlineYear: schoolData.deadlineYear,
          createdAt: new Date().toISOString(),
        };

        await adminDb.collection("schools").doc(schoolId).set(newSchool);
        results.push({ created: true, school: newSchool });
      } else {
        results.push({ created: false, school: existingSchool.docs[0].data() });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Default schools initialized",
      results,
    });
  } catch (error: unknown) {
    console.error("Error initializing schools:", error);
    return NextResponse.json(
      { error: "Failed to initialize schools" },
      { status: 500 },
    );
  }
}
