import { NextRequest, NextResponse } from "next/server";
import { TranslatableAction } from "@/types/TranslatableAction";
import { adminAuth, adminDb } from "@/firebaseAdmin";
import { locales } from "@/i18n/config";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
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

    // Fetch admin action templates from Firestore
    const actionsSnapshot = await adminDb
      .collection("admin-action-templates")
      .get();
    const actions = actionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TranslatableAction[];

    return NextResponse.json({ success: true, actions });
  } catch (error) {
    console.error("Error fetching actions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch actions" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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

    const actionData = await req.json();

    // Validate required fields
    const defaultLocale = locales[0]; // Use first locale as default
    const hasRequiredTranslation =
      actionData.translations &&
      Object.keys(actionData.translations).length > 0 &&
      actionData.translations[defaultLocale]?.title;

    if (!actionData.category || !actionData.type || !hasRequiredTranslation) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields (category, type, and at least one translation with title)",
        },
        { status: 400 },
      );
    }

    // Validate type
    if (!["Fixed", "Dynamic"].includes(actionData.type)) {
      return NextResponse.json(
        { success: false, error: "Type must be either 'Fixed' or 'Dynamic'" },
        { status: 400 },
      );
    }

    const actionId = uuidv4();
    const newAction: TranslatableAction = {
      id: actionId,
      category: actionData.category,
      type: actionData.type,
      reduction: actionData.reduction || 0,
      effort: actionData.effort || "Medium",
      date: new Date().toISOString(),
      // Optional extended fields
      subcategory: actionData.subcategory || "",
      timeline: actionData.timeline || "",
      // Note: status, assignedTo, selected are now part of SchoolAction, not admin actions
      translations: actionData.translations,
    };

    // Save admin action template to Firestore
    await adminDb
      .collection("admin-action-templates")
      .doc(actionId)
      .set(newAction);

    return NextResponse.json({ success: true, action: newAction });
  } catch (error) {
    console.error("Error creating action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create action" },
      { status: 500 },
    );
  }
}
