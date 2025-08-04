import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import {
  validateName,
  validateDescription,
  sanitizeString,
} from "../../../lib/validation";

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

    // Check if user exists in admin collection
    const adminDoc = await adminDb
      .collection("admins")
      .doc(decodedToken.uid)
      .get();
    if (!adminDoc.exists) {
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

    // Check if user exists in admin collection
    const adminDoc = await adminDb
      .collection("admins")
      .doc(decodedToken.uid)
      .get();
    if (!adminDoc.exists) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { name, description } = body;

    // Validate input
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 },
      );
    }

    const descriptionValidation = validateDescription(description || "");
    if (!descriptionValidation.isValid) {
      return NextResponse.json(
        { error: descriptionValidation.error },
        { status: 400 },
      );
    }

    // Sanitize input
    const sanitizedName = sanitizeString(name);
    const sanitizedDescription = description ? sanitizeString(description) : "";

    const categoryId = uuidv4();
    const categoryData = {
      id: categoryId,
      name: sanitizedName,
      description: sanitizedDescription,
      subcategories: [],
      createdAt: new Date().toISOString(),
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
