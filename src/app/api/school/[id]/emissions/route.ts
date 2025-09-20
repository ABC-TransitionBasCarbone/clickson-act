import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../firebaseAdmin";
import {
  SchoolEmissionCategory,
  SchoolEmissionSubcategory,
} from "../../../../../types/School";

// Get school emission data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: schoolId } = await params;

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    // Get school document
    const schoolDoc = await adminDb.collection("schools").doc(schoolId).get();

    if (!schoolDoc.exists) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const schoolData = schoolDoc.data();

    return NextResponse.json({
      success: true,
      school: {
        id: schoolDoc.id,
        ...schoolData,
      },
      emissionCategories: schoolData?.emissionCategories || [],
    });
  } catch (error) {
    console.error("Error fetching school emission data:", error);
    return NextResponse.json(
      { error: "Failed to fetch school emission data" },
      { status: 500 },
    );
  }
}

// Update school emission data (for teachers)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: schoolId } = await params;
    const body = await req.json();
    const { emissionCategories } = body;

    // Validate input
    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 },
      );
    }

    if (!emissionCategories || !Array.isArray(emissionCategories)) {
      return NextResponse.json(
        { error: "Emission categories data is required" },
        { status: 400 },
      );
    }

    // Validate emission categories structure
    const validatedCategories: SchoolEmissionCategory[] = [];

    for (const category of emissionCategories) {
      if (!category.categoryId || !category.categoryName) {
        return NextResponse.json(
          {
            error:
              "Invalid category data structure - missing categoryId or categoryName",
          },
          { status: 400 },
        );
      }

      // Handle backward compatibility: support both 'amount' and 'value' fields
      const categoryAmount =
        category.amount !== undefined ? category.amount : category.value || 0;

      if (typeof categoryAmount !== "number") {
        return NextResponse.json(
          {
            error: "Invalid category data structure - amount must be a number",
          },
          { status: 400 },
        );
      }

      const validatedSubcategories: SchoolEmissionSubcategory[] = [];

      if (category.subcategories && Array.isArray(category.subcategories)) {
        for (const subcategory of category.subcategories) {
          if (!subcategory.subcategoryId || !subcategory.subcategoryName) {
            return NextResponse.json(
              {
                error:
                  "Invalid subcategory data structure - missing subcategoryId or subcategoryName",
              },
              { status: 400 },
            );
          }

          // Handle backward compatibility: support both 'amount' and 'value' fields
          const subcategoryAmount =
            subcategory.amount !== undefined
              ? subcategory.amount
              : subcategory.value || 0;

          if (typeof subcategoryAmount !== "number") {
            return NextResponse.json(
              {
                error:
                  "Invalid subcategory data structure - amount must be a number",
              },
              { status: 400 },
            );
          }

          validatedSubcategories.push({
            subcategoryId: subcategory.subcategoryId,
            subcategoryName: subcategory.subcategoryName,
            amount: subcategoryAmount,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      validatedCategories.push({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        amount: categoryAmount,
        subcategories: validatedSubcategories,
        updatedAt: new Date().toISOString(),
      });
    }

    // Update school document
    await adminDb.collection("schools").doc(schoolId).update({
      emissionCategories: validatedCategories,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "School emission data updated successfully",
      emissionCategories: validatedCategories,
    });
  } catch (error) {
    console.error("Error updating school emission data:", error);
    return NextResponse.json(
      { error: "Failed to update school emission data" },
      { status: 500 },
    );
  }
}
