import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

// Add subcategory to emission category
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, description } = body;

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
