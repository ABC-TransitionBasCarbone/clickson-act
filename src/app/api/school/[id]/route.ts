import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../../firebaseAdmin";
import {
  validateName,
  validateNumber,
  validateYear,
  sanitizeString,
} from "../../../../lib/validation";

// Update school information
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user exists in admin collection
    const adminDoc = await adminDb
      .collection("admins")
      .doc(decodedToken.uid)
      .get();
    if (!adminDoc.exists) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = params;
    const body = await req.json();
    const { goal, deadlineYear, name } = body;

    // Validation
    if (!goal || !deadlineYear) {
      return NextResponse.json(
        { error: "Goal and deadline year are required" },
        { status: 400 },
      );
    }

    // Validate name if provided
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        return NextResponse.json(
          { error: nameValidation.error },
          { status: 400 },
        );
      }
    }

    const goalAmount = parseFloat(goal) || 0;
    const goalValidation = validateNumber(goalAmount, 0, 100);
    if (!goalValidation.isValid) {
      return NextResponse.json(
        { error: goalValidation.error },
        { status: 400 },
      );
    }

    // Validate deadline year
    const yearValidation = validateYear(deadlineYear);
    if (!yearValidation.isValid) {
      return NextResponse.json(
        { error: yearValidation.error },
        { status: 400 },
      );
    }

    // Sanitize inputs
    const sanitizedName = name ? sanitizeString(name) : undefined;

    // Update school document
    const updateData: {
      goal: number;
      deadlineYear: string;
      updatedAt: string;
      name?: string;
    } = {
      goal: goalAmount,
      deadlineYear: String(deadlineYear),
      updatedAt: new Date().toISOString(),
    };

    // Add name to update if provided
    if (sanitizedName) {
      updateData.name = sanitizedName;
    }

    await adminDb.collection("schools").doc(id).update(updateData);

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

// Delete school
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user exists in admin collection
    const adminDoc = await adminDb
      .collection("admins")
      .doc(decodedToken.uid)
      .get();
    if (!adminDoc.exists) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = params;

    // Check if school exists
    const schoolDoc = await adminDb.collection("schools").doc(id).get();
    if (!schoolDoc.exists) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // Delete school document
    await adminDb.collection("schools").doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "School deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting school:", error);
    return NextResponse.json(
      { error: "Failed to delete school. Please try again." },
      { status: 500 },
    );
  }
}
