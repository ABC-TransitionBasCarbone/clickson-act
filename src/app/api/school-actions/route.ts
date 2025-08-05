import { NextRequest, NextResponse } from "next/server";
import { SchoolAction } from "@/types/SchoolAction";
import { adminAuth, adminDb } from "@/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    // Get school ID from query params
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");

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

    // Check if user exists in teachers or admins collection
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

    // Build query based on user role and school ID
    let query = adminDb.collection("school-actions");

    // If specific school ID requested
    if (schoolId) {
      query = query.where("schoolId", "==", schoolId);
    } else if (userData.role !== "admin") {
      // Non-admin users can only see their school's actions
      query = query.where(
        "schoolId",
        "==",
        userData.schoolId || decodedToken.uid,
      );
    }

    // Fetch school actions from Firestore
    const actionsSnapshot = await query.get();
    const actions = actionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SchoolAction[];

    return NextResponse.json({ success: true, actions });
  } catch (error) {
    console.error("Error fetching school actions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch school actions" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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

    // Check if user exists in teachers or admins collection
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

    const actionData = await req.json();

    // Validate required fields
    if (!actionData.adminActionId || !actionData.schoolId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields (adminActionId, schoolId)",
        },
        { status: 400 },
      );
    }

    // Verify that the admin action template exists
    const adminActionDoc = await adminDb
      .collection("admin-action-templates")
      .doc(actionData.adminActionId)
      .get();

    if (!adminActionDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Admin action template not found" },
        { status: 404 },
      );
    }

    const actionId = uuidv4();
    const newSchoolAction: SchoolAction = {
      id: actionId,
      adminActionId: actionData.adminActionId,
      schoolId: actionData.schoolId,
      manager: actionData.manager || "",
      keyContacts: actionData.keyContacts || "",
      calendar: actionData.calendar || "",
      indicators: actionData.indicators || "",
      monitoring: actionData.monitoring || "",
      performance: actionData.performance || "",
      status: actionData.status || "Available",
      assignedTo: actionData.assignedTo || "",
      selected: actionData.selected || false,
      dateAssigned: new Date().toISOString(),
      dateCompleted: actionData.dateCompleted || undefined,
      notes: actionData.notes || "",
    };

    // Save school action to Firestore
    await adminDb
      .collection("school-actions")
      .doc(actionId)
      .set(newSchoolAction);

    return NextResponse.json({ success: true, action: newSchoolAction });
  } catch (error) {
    console.error("Error creating school action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create school action" },
      { status: 500 },
    );
  }
}
