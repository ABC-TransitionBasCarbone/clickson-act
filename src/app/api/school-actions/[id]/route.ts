import { NextRequest, NextResponse } from "next/server";
import { SchoolAction } from "@/types/SchoolAction";
import { adminAuth, adminDb } from "@/firebaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user exists
    let userData = null;
    const teacherDoc = await adminDb
      .collection("teachers")
      .doc(decodedToken.uid)
      .get();
    if (teacherDoc.exists) {
      userData = teacherDoc.data();
    } else {
      const adminDoc = await adminDb
        .collection("admins")
        .doc(decodedToken.uid)
        .get();
      if (adminDoc.exists) {
        userData = adminDoc.data();
      }
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 403 },
      );
    }

    const { id } = params;

    // Get school action
    const actionDoc = await adminDb.collection("school-actions").doc(id).get();
    if (!actionDoc.exists) {
      return NextResponse.json(
        { success: false, error: "School action not found" },
        { status: 404 },
      );
    }

    const action = actionDoc.data() as SchoolAction;

    // Check if user has access to this school's actions
    if (
      userData.role !== "admin" &&
      action.schoolId !== (userData.schoolId || decodedToken.uid)
    ) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, action: { id, ...action } });
  } catch (error) {
    console.error("Error fetching school action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch school action" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user exists
    let userData = null;
    const teacherDoc = await adminDb
      .collection("teachers")
      .doc(decodedToken.uid)
      .get();
    if (teacherDoc.exists) {
      userData = teacherDoc.data();
    } else {
      const adminDoc = await adminDb
        .collection("admins")
        .doc(decodedToken.uid)
        .get();
      if (adminDoc.exists) {
        userData = adminDoc.data();
      }
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 403 },
      );
    }

    const { id } = params;
    const updateData = await req.json();

    // Check if school action exists
    const actionDoc = await adminDb.collection("school-actions").doc(id).get();
    if (!actionDoc.exists) {
      return NextResponse.json(
        { success: false, error: "School action not found" },
        { status: 404 },
      );
    }

    const currentAction = actionDoc.data() as SchoolAction;

    // Check if user has access to this school's actions
    if (
      userData.role !== "admin" &&
      currentAction.schoolId !== (userData.schoolId || decodedToken.uid)
    ) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Update the school action
    const updatedAction = {
      ...currentAction,
      ...updateData,
      id, // Ensure ID doesn't change
      adminActionId: currentAction.adminActionId, // Preserve template reference
      schoolId: currentAction.schoolId, // Preserve school ID
      dateAssigned: currentAction.dateAssigned, // Preserve original assignment date
    };

    // Update completion date if status changed to completed
    if (
      updateData.status === "Completed" &&
      currentAction.status !== "Completed"
    ) {
      updatedAction.dateCompleted = new Date().toISOString();
    }

    // Save to Firestore
    await adminDb.collection("school-actions").doc(id).update(updatedAction);

    return NextResponse.json({ success: true, action: updatedAction });
  } catch (error) {
    console.error("Error updating school action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update school action" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user exists and has admin role (only admins can delete school actions)
    let userData = null;
    const teacherDoc = await adminDb
      .collection("teachers")
      .doc(decodedToken.uid)
      .get();
    if (teacherDoc.exists) {
      userData = teacherDoc.data();
    } else {
      const adminDoc = await adminDb
        .collection("admins")
        .doc(decodedToken.uid)
        .get();
      if (adminDoc.exists) {
        userData = adminDoc.data();
      }
    }

    if (!userData || userData.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied - Admin role required" },
        { status: 403 },
      );
    }

    const { id } = params;

    // Check if school action exists
    const actionDoc = await adminDb.collection("school-actions").doc(id).get();
    if (!actionDoc.exists) {
      return NextResponse.json(
        { success: false, error: "School action not found" },
        { status: 404 },
      );
    }

    // Delete from Firestore
    await adminDb.collection("school-actions").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting school action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete school action" },
      { status: 500 },
    );
  }
}
