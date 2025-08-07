import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/firebaseAdmin";

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

    // Check if user has admin role
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

    // Get collection counts and information
    const collections = {
      "admin-action-templates": 0,
      "school-actions": 0,
      emissionCategories: 0,
      teachers: 0,
      admins: 0,
      actions: 0, // Legacy collection
    };

    // Count documents in each collection
    for (const collectionName of Object.keys(collections)) {
      try {
        const snapshot = await adminDb.collection(collectionName).get();
        collections[collectionName as keyof typeof collections] = snapshot.size;
      } catch {
        // Collection might not exist
        collections[collectionName as keyof typeof collections] = 0;
      }
    }

    // Get sample documents from main collections
    const sampleData: { [key: string]: Record<string, unknown>[] } = {};

    // Sample admin action templates
    const adminActionsSnapshot = await adminDb
      .collection("admin-action-templates")
      .limit(3)
      .get();
    sampleData["admin-action-templates"] = adminActionsSnapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      }),
    );

    // Sample school actions
    const schoolActionsSnapshot = await adminDb
      .collection("school-actions")
      .limit(3)
      .get();
    sampleData["school-actions"] = schoolActionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sample categories
    const categoriesSnapshot = await adminDb
      .collection("emissionCategories")
      .limit(3)
      .get();
    sampleData["emissionCategories"] = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Check for legacy actions
    const legacyActionsSnapshot = await adminDb
      .collection("actions")
      .limit(3)
      .get();
    sampleData["legacy-actions"] = legacyActionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      database: {
        collections,
        sampleData,
        structure: {
          "admin-action-templates":
            "Admin-defined action templates with translations",
          "school-actions": "School-specific action implementations",
          emissionCategories: "Emission categories and subcategories",
          teachers: "Teacher/School user accounts",
          admins: "Admin user accounts",
          actions:
            "Legacy actions (should be migrated to admin-action-templates)",
        },
        recommendations: {
          migration:
            collections.actions > 0
              ? "You have legacy actions that should be migrated to admin-action-templates"
              : "No legacy data migration needed",
          organization:
            "Database is now organized with clear separation between templates and implementations",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching database info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch database information" },
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

    // Check if user has admin role
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

    const { action } = await req.json();

    if (action === "migrate-legacy-actions") {
      // Migrate legacy actions to new structure
      const legacySnapshot = await adminDb.collection("actions").get();
      const batch = adminDb.batch();
      let migratedCount = 0;

      legacySnapshot.docs.forEach((doc) => {
        const legacyData = doc.data();
        const newRef = adminDb.collection("admin-action-templates").doc(doc.id);
        batch.set(newRef, legacyData);
        migratedCount++;
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        message: `Migrated ${migratedCount} legacy actions to admin-action-templates`,
        migratedCount,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error performing database operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform database operation" },
      { status: 500 },
    );
  }
}
