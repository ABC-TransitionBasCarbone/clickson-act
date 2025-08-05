import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../../firebaseAdmin";

// Update emission category
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

    // Check if user exists in teachers or admins collection with admin role
    let userData = null;

    // First check teachers collection
    const teacherDoc = await adminDb
      .collection("teachers")
      .doc(decodedToken.uid)
      .get();
    if (teacherDoc.exists) {
      userData = teacherDoc.data();
    } else {
      // Check admins collection
      const adminDoc = await adminDb
        .collection("admins")
        .doc(decodedToken.uid)
        .get();
      if (adminDoc.exists) {
        userData = adminDoc.data();
      }
    }

    // Check if user exists and has admin role
    if (
      !userData ||
      (userData.role !== "admin" && userData.role !== "teacher")
    ) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = params;
    const body = await req.json();
    const { name, description, totalPercentage } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    await adminDb
      .collection("emissionCategories")
      .doc(id)
      .update({
        name: name.trim(),
        description: description?.trim() || "",
        totalPercentage: totalPercentage
          ? parseFloat(totalPercentage)
          : undefined,
        updatedAt: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      message: "Emission category updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating emission category:", error);
    return NextResponse.json(
      { error: "Failed to update emission category. Please try again." },
      { status: 500 },
    );
  }
}

// Delete emission category
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

    // Check if user exists in teachers or admins collection with admin role
    let userData = null;

    // First check teachers collection
    const teacherDoc = await adminDb
      .collection("teachers")
      .doc(decodedToken.uid)
      .get();
    if (teacherDoc.exists) {
      userData = teacherDoc.data();
    } else {
      // Check admins collection
      const adminDoc = await adminDb
        .collection("admins")
        .doc(decodedToken.uid)
        .get();
      if (adminDoc.exists) {
        userData = adminDoc.data();
      }
    }

    // Check if user exists and has admin role
    if (
      !userData ||
      (userData.role !== "admin" && userData.role !== "teacher")
    ) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = params;

    // Check if category exists
    const categoryDoc = await adminDb
      .collection("emissionCategories")
      .doc(id)
      .get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { error: "Emission category not found" },
        { status: 404 },
      );
    }

    // Delete category document
    await adminDb.collection("emissionCategories").doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "Emission category deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting emission category:", error);
    return NextResponse.json(
      { error: "Failed to delete emission category. Please try again." },
      { status: 500 },
    );
  }
}
