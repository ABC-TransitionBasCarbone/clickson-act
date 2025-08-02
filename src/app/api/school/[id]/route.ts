import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";

// Update school information
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { goal, deadlineYear } = body;

    // Validation
    if (!goal || !deadlineYear) {
      return NextResponse.json(
        { error: "Goal and deadline year are required" },
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

    // Update school document
    await adminDb
      .collection("schools")
      .doc(id)
      .update({
        goal: goalAmount,
        deadlineYear: String(deadlineYear),
        updatedAt: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      message: "School updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating school:", error);
    return NextResponse.json(
      { error: "Failed to update school. Please try again." },
      { status: 500 },
    );
  }
}
