import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";
import {
  TranslatableCategory,
  getTranslatedCategory,
  getTranslatedSubcategory,
} from "../../../../types/EmissionCategory";

// Function to map database category names to legacy category names
const mapToLegacyCategory = (categoryName: string): string => {
  const name = categoryName.toLowerCase().trim();
  // console.log(`[PUBLIC API] Mapping category "${categoryName}" (normalized: "${name}") to legacy category`);

  if (
    name.includes("energy") ||
    name.includes("electricity") ||
    name.includes("power") ||
    name === "energy"
  ) {
    // console.log(`[PUBLIC API] -> Mapped to "energy"`);
    return "energy";
  }
  if (
    name.includes("waste") ||
    name.includes("recycling") ||
    name.includes("trash") ||
    name === "waste"
  ) {
    // console.log(`[PUBLIC API] -> Mapped to "waste"`);
    return "waste";
  }
  if (
    name.includes("transport") ||
    name.includes("travel") ||
    name.includes("vehicle") ||
    name === "transport"
  ) {
    // console.log(`[PUBLIC API] -> Mapped to "transport"`);
    return "transport";
  }
  if (
    name.includes("nature") ||
    name.includes("green") ||
    name.includes("environment") ||
    name.includes("tree") ||
    name === "nature"
  ) {
    // console.log(`[PUBLIC API] -> Mapped to "nature"`);
    return "nature";
  }
  // Default fallback - could be enhanced based on actual category names
  // console.log(`[PUBLIC API] -> Using fallback mapping to "energy"`);
  return "energy"; // Default to energy as fallback
};

// Public endpoint to get emission categories for students
// This endpoint doesn't require authentication and returns translated categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    const categoriesSnapshot = await adminDb
      .collection("emissionCategories")
      .get();

    if (categoriesSnapshot.empty) {
      // No categories in database, return empty array
      return NextResponse.json({
        success: true,
        categories: [],
        message: "No emission categories found in database",
      });
    }

    // Process and translate categories for the requested locale
    const categories = categoriesSnapshot.docs.map((doc) => {
      const categoryData = {
        id: doc.id,
        ...doc.data(),
      } as TranslatableCategory;
      const translatedCategory = getTranslatedCategory(categoryData, locale);

      // Process subcategories
      const processedSubcategories = categoryData.subcategories.map(
        (subcategory) => {
          const translatedSubcategory = getTranslatedSubcategory(
            subcategory,
            locale,
          );

          return {
            id: subcategory.id,
            subcategoryTitle: translatedSubcategory.name,
            name: translatedSubcategory.name,
            description: translatedSubcategory.description,
            value: "", // Initialize empty value for user input
            SubcategoryTotalPercentage: subcategory.SubcategoryTotalPercentage,
          };
        },
      );

      return {
        id: categoryData.id,
        name: translatedCategory.name,
        description: translatedCategory.description,
        category: categoryData.id, // Use the database ID as category identifier
        legacyCategory: mapToLegacyCategory(translatedCategory.name),
        totalPercentage: categoryData.totalPercentage,
        subcategories: processedSubcategories,
        value: "", // Initialize empty value for user input
        label: translatedCategory.name, // For compatibility with existing EmissionType
      };
    });

    return NextResponse.json({
      success: true,
      categories: categories,
    });
  } catch (error: unknown) {
    console.error("Error fetching public emission categories:", error);
    return NextResponse.json(
      {
        success: false,
        categories: [],
        error: "Failed to fetch emission categories. Please try again.",
      },
      { status: 500 },
    );
  }
}
