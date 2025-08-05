import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

// Add subcategory to emission category
export async function POST(
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
    const { name, description, SubcategoryTotalPercentage } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Subcategory name is required" },
        { status: 400 },
      );
    }

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

    const subcategoryId = uuidv4();
    const subcategoryData = {
      id: subcategoryId,
      name: name.trim(),
      description: description?.trim() || "",
      SubcategoryTotalPercentage: SubcategoryTotalPercentage
        ? parseFloat(SubcategoryTotalPercentage)
        : undefined,
      createdAt: new Date().toISOString(),
    };

    // Get current category data
    const categoryData = categoryDoc.data() || {};
    const updatedSubcategories = [
      ...(categoryData.subcategories || []),
      subcategoryData,
    ];

    // Update category with new subcategory
    await adminDb.collection("emissionCategories").doc(id).update({
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      subcategory: subcategoryData,
    });
  } catch (error: unknown) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to create subcategory. Please try again." },
      { status: 500 },
    );
  }
}
