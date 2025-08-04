import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../../firebaseAdmin";
import { EmissionSubcategory } from "../../../../../../types/EmissionCategory";

// Update subcategory
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; subId: string } },
) {
  try {
    const { id, subId } = params;
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Subcategory name is required" },
        { status: 400 },
      );
    }

    // Get current category data
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

    const categoryData = categoryDoc.data() || {};
    const subcategories = categoryData.subcategories || [];

    // Find and update the subcategory
    const updatedSubcategories = subcategories.map(
      (sub: EmissionSubcategory) =>
        sub.id === subId
          ? {
              ...sub,
              name: name.trim(),
              description: description?.trim() || "",
              updatedAt: new Date().toISOString(),
            }
          : sub,
    );

    // Update category with updated subcategories
    await adminDb.collection("emissionCategories").doc(id).update({
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Subcategory updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to update subcategory. Please try again." },
      { status: 500 },
    );
  }
}

// Delete subcategory
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; subId: string } },
) {
  try {
    const { id, subId } = params;

    // Get current category data
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

    const categoryData = categoryDoc.data() || {};
    const subcategories = categoryData.subcategories || [];

    // Filter out the subcategory to delete
    const updatedSubcategories = subcategories.filter(
      (sub: EmissionSubcategory) => sub.id !== subId,
    );

    // Update category with filtered subcategories
    await adminDb.collection("emissionCategories").doc(id).update({
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory. Please try again." },
      { status: 500 },
    );
  }
}
