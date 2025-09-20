import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import {
  validateName,
  validateDescription,
  sanitizeString,
} from "../../../lib/validation";
import { TranslatableCategory } from "../../../types/EmissionCategory";
import { locales } from "../../../i18n/config";

// Get all emission categories
export async function GET(req: NextRequest) {
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

    const categoriesSnapshot = await adminDb
      .collection("emissionCategories")
      .get();

    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      categories: categories,
    });
  } catch (error: unknown) {
    console.error("Error fetching emission categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch emission categories. Please try again." },
      { status: 500 },
    );
  }
}

// Create a new emission category
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { translations } = body;

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

    const categoryId = uuidv4();
    const categoryData: TranslatableCategory = {
      id: categoryId,
      subcategories: [],
      createdAt: new Date().toISOString(),
      translations: sanitizedTranslations,
    };

    await adminDb
      .collection("emissionCategories")
      .doc(categoryId)
      .set(categoryData);

    return NextResponse.json({
      success: true,
      category: categoryData,
    });
  } catch (error: unknown) {
    console.error("Error creating emission category:", error);
    return NextResponse.json(
      { error: "Failed to create emission category. Please try again." },
      { status: 500 },
    );
  }
}
