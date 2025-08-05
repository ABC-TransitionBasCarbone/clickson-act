import { NextRequest, NextResponse } from "next/server";
import { TranslatableAction } from "@/types/TranslatableAction";
import { adminAuth, adminDb } from "@/firebaseAdmin";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
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
    if (!userData || userData.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied - Admin role required" },
        { status: 403 },
      );
    }

    const { id } = params;
    const updateData = await req.json();

    // Check if admin action template exists
    const actionDoc = await adminDb
      .collection("admin-action-templates")
      .doc(id)
      .get();
    if (!actionDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Action template not found" },
        { status: 404 },
      );
    }

    const currentAction = actionDoc.data() as TranslatableAction;

    // Update the action template
    const updatedAction = {
      ...currentAction,
      ...updateData,
      id, // Ensure ID doesn't change
      date: currentAction.date, // Preserve original date
    };

    // Save to Firestore
    await adminDb
      .collection("admin-action-templates")
      .doc(id)
      .update(updatedAction);

    return NextResponse.json({ success: true, action: updatedAction });
  } catch (error) {
    console.error("Error updating action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update action" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
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
    if (!userData || userData.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied - Admin role required" },
        { status: 403 },
      );
    }

    const { id } = params;

    // Check if admin action template exists
    const actionDoc = await adminDb
      .collection("admin-action-templates")
      .doc(id)
      .get();
    if (!actionDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Action template not found" },
        { status: 404 },
      );
    }

    // Delete from Firestore
    await adminDb.collection("admin-action-templates").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete action" },
      { status: 500 },
    );
  }
}
