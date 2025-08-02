import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

// Create a new school
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, goal, deadlineYear } = body;

    // Enhanced validation
    if (!name || !goal || !deadlineYear) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Sanitize and validate inputs
    const sanitizedName = name.trim();

    if (sanitizedName.length < 1 || sanitizedName.length > 200) {
      return NextResponse.json(
        { error: "School name must be between 1 and 200 characters" },
        { status: 400 },
      );
    }

    const goalAmount = parseFloat(goal) || 0;
    if (goalAmount < 0 || goalAmount > 100) {
      return NextResponse.json(
        { error: "Goal reduction amount must be between 0 and 100" },
        { status: 400 },
      );
    }

    // Validate deadline year
    const currentYear = new Date().getFullYear();
    const deadlineYearNum = parseInt(deadlineYear);
    if (deadlineYearNum < currentYear || deadlineYearNum > currentYear + 50) {
      return NextResponse.json(
        {
          error:
            "Deadline year must be between current year and 50 years from now",
        },
        { status: 400 },
      );
    }

    // Generate unique school ID
    const schoolId = uuidv4();

    // Create school document
    const schoolData = {
      id: schoolId,
      name: sanitizedName,
      goal: goalAmount,
      deadlineYear: deadlineYear,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("schools").doc(schoolId).set(schoolData);

    return NextResponse.json({
      success: true,
      school: schoolData,
    });
  } catch (error: unknown) {
    console.error("School creation error:", error);
    return NextResponse.json(
      { error: "Failed to create school. Please try again." },
      { status: 500 },
    );
  }
}
