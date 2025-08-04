import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

// Update emission category
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, description } = body;

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
