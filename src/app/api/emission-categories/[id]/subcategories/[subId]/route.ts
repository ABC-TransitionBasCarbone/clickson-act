import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../../../../firebaseAdmin";
import {
  EmissionSubcategory,
  TranslatableSubcategory,
} from "../../../../../../types/EmissionCategory";
import { locales } from "../../../../../../i18n/config";
import {
  validateName,
  validateDescription,
  sanitizeString,
} from "../../../../../../lib/validation";

// Update subcategory
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; subId: string } },
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

    const { id, subId } = params;
    const body = await req.json();
    const { translations, SubcategoryTotalPercentage } = body;

    // Validate required fields
    const defaultLocale = locales[0]; // Use first locale as default
    const hasRequiredTranslation =
      translations &&
      Object.keys(translations).length > 0 &&
      translations[defaultLocale]?.name;

    if (!hasRequiredTranslation) {
      return NextResponse.json(
        {
          error:
            "Missing required translations (at least one translation with name is required)",
        },
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

    // Validate and sanitize all translations
    const sanitizedTranslations: {
      [locale: string]: { name: string; description: string };
    } = {};
    for (const [locale, translation] of Object.entries(translations)) {
      const trans = translation as { name: string; description: string };

      // Validate name
      const nameValidation = validateName(trans.name);
      if (!nameValidation.isValid) {
        return NextResponse.json(
          { error: `${locale.toUpperCase()} name: ${nameValidation.error}` },
          { status: 400 },
        );
      }

      // Validate description
      const descriptionValidation = validateDescription(
        trans.description || "",
      );
      if (!descriptionValidation.isValid) {
        return NextResponse.json(
          {
            error: `${locale.toUpperCase()} description: ${descriptionValidation.error}`,
          },
          { status: 400 },
        );
      }

      // Sanitize input
      sanitizedTranslations[locale] = {
        name: sanitizeString(trans.name),
        description: trans.description ? sanitizeString(trans.description) : "",
      };
    }

    const categoryData = categoryDoc.data() || {};
    const subcategories = categoryData.subcategories || [];

    // Find and update the subcategory
    const updatedSubcategories = subcategories.map(
      (sub: EmissionSubcategory | TranslatableSubcategory) =>
        sub.id === subId
          ? {
              ...sub,
              translations: sanitizedTranslations,
              SubcategoryTotalPercentage: SubcategoryTotalPercentage
                ? parseFloat(SubcategoryTotalPercentage)
                : undefined,
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
