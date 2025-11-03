import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../../firebaseAdmin";
import {
  validateName,
  validateNumber,
  validateYear,
  sanitizeString,
} from "../../../../lib/validation";

// Get school information
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get school document
    const schoolDoc = await adminDb.collection("schools").doc(id).get();

    if (!schoolDoc.exists) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const schoolData = schoolDoc.data();

    return NextResponse.json({
      id: schoolDoc.id,
      ...schoolData,
    });
  } catch (error: unknown) {
    console.error("Error fetching school:", error);
    return NextResponse.json(
      { error: "Failed to fetch school. Please try again." },
      { status: 500 },
    );
  }
}

// Update school information
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify authentication (admin or teacher)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    const { id } = await params;

    // Check if user is admin
    const adminDoc = await adminDb
      .collection("admins")
      .doc(decodedToken.uid)
      .get();
    const isAdmin = adminDoc.exists;

    // Check if user is a teacher associated with this school
    const teacherDoc = await adminDb
      .collection("teachers")
      .doc(decodedToken.uid)
      .get();
    const isTeacher = teacherDoc.exists;
    
    if (!isAdmin && !isTeacher) {
      return NextResponse.json(
        { error: "Forbidden - Admin or teacher access required" },
        { status: 403 },
      );
    }

    // If teacher, verify they belong to this school
    if (isTeacher && !isAdmin) {
      const teacherData = teacherDoc.data();
      if (teacherData?.schoolId !== id) {
        return NextResponse.json(
          { error: "Forbidden - You can only update your own school" },
          { status: 403 },
        );
      }
    }
    const body = await req.json();
    const { goal, deadlineYear, name, referentTeacherId } = body;

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
      referentTeacherId?: string | null;
    } = {
      goal: goalAmount,
      deadlineYear: String(deadlineYear),
      updatedAt: new Date().toISOString(),
    };

    // Add name to update if provided
    if (sanitizedName) {
      updateData.name = sanitizedName;
    }

    // Add referentTeacherId if provided (admin only)
    if (isAdmin && referentTeacherId !== undefined) {
      updateData.referentTeacherId = referentTeacherId || null;
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
  { params }: { params: Promise<{ id: string }> },
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

    const { id } = await params;

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
