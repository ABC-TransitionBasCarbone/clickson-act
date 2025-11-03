import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import {
  TranslatableCategory,
  EmissionCategory,
  getTranslatedCategory,
  getTranslatedSubcategory,
} from "@/types/EmissionCategory";
import { authenticatedFetch } from "@/lib/auth-utils";
import { useUser } from "@/context/UserContext";

// Interface for fallback data structure
interface FallbackEmissionItem {
  label: string;
  subcategories: FallbackSubcategory[];
}

interface FallbackSubcategory {
  subcategoryTitle: string;
  [key: string]: unknown;
}

// Function to map database category names to legacy category names
const mapToLegacyCategory = (categoryName: string): string => {
  const name = categoryName.toLowerCase().trim();
  // console.log(`Mapping category "${categoryName}" (normalized: "${name}") to legacy category`);

  if (
    name.includes("energy") ||
    name.includes("electricity") ||
    name.includes("power") ||
    name === "energy"
  ) {
    // console.log(`-> Mapped to "energy"`);
    return "energy";
  }
  if (
    name.includes("waste") ||
    name.includes("recycling") ||
    name.includes("trash") ||
    name === "waste"
  ) {
    // console.log(`-> Mapped to "waste"`);
    return "waste";
  }
  if (
    name.includes("transport") ||
    name.includes("travel") ||
    name.includes("vehicle") ||
    name === "transport"
  ) {
    // console.log(`-> Mapped to "transport"`);
    return "transport";
  }
  if (
    name.includes("nature") ||
    name.includes("green") ||
    name.includes("environment") ||
    name.includes("tree") ||
    name === "nature"
  ) {
    // console.log(`-> Mapped to "nature"`);
    return "nature";
  }
  // Default fallback - could be enhanced based on actual category names
  // console.log(`-> Using fallback mapping to "energy"`);
  return "energy"; // Default to energy as fallback
};

export interface ProcessedEmissionCategory {
  id: string;
  name: string;
  description: string;
  category: string; // Using id as category identifier
  legacyCategory?: string; // For mapping to existing actions (energy, waste, transport, nature)
  subcategories: {
    id: string;
    subcategoryTitle: string;
    name: string;
    description: string;
    value: string;
  }[];
  value: string;
  label: string; // For compatibility with existing EmissionType
}

export const useEmissionCategories = () => {
  const [categories, setCategories] = useState<ProcessedEmissionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const { user } = useUser();

  useEffect(() => {
    const fetchEmissionCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        let response: Response;

        // Check if user has authentication (admin/teacher) or is a student
        if (user && user.token && !user.passcode) {
          // User is admin/teacher with token, try authenticated API
          try {
            response = await authenticatedFetch("/api/emission-categories");
          } catch (authError) {
            console.warn(
              "Authenticated API failed, falling back to static file:",
              authError,
            );
            // Fall back to static file
            const fallbackResponse = await fetch("/data/emissions.json");
            if (!fallbackResponse.ok) {
              throw new Error(
                "Failed to fetch emission categories from both API and static file",
              );
            }
            const fallbackData =
              (await fallbackResponse.json()) as FallbackEmissionItem[];
            setCategories(
              fallbackData.map((item: FallbackEmissionItem, index: number) => ({
                ...item,
                id: `fallback-${index}`,
                name: item.label,
                description: "",
                label: item.label,
                category: `fallback-${index}`,
                value: "",
                subcategories: item.subcategories.map(
                  (sub: FallbackSubcategory, subIndex: number) => ({
                    ...sub,
                    id: `fallback-sub-${index}-${subIndex}`,
                    name: sub.subcategoryTitle,
                    description: "",
                    value: "",
                  }),
                ),
              })),
            );
            return;
          }
        } else {
          // User is a student or not authenticated, try public API first
          console.info(
            "Fetching emission categories from public API for student/unauthenticated user",
          );
          try {
            const publicResponse = await fetch(
              `/api/emission-categories/public?locale=${locale}`,
            );
            if (publicResponse.ok) {
              const publicData = await publicResponse.json();
              if (
                publicData.success &&
                Array.isArray(publicData.categories) &&
                publicData.categories.length > 0
              ) {
                setCategories(publicData.categories);
                return;
              }
            }
          } catch (publicError) {
            console.warn(
              "Public API failed, falling back to static file:",
              publicError,
            );
          }

          // Fall back to static file
          console.info("Using static emission categories as fallback");
          const fallbackResponse = await fetch("/data/emissions.json");
          if (!fallbackResponse.ok) {
            throw new Error(
              "Failed to fetch emission categories from static file",
            );
          }
          const fallbackData =
            (await fallbackResponse.json()) as FallbackEmissionItem[];
          setCategories(
            fallbackData.map((item: FallbackEmissionItem, index: number) => ({
              ...item,
              id: `fallback-${index}`,
              name: item.label,
              description: "",
              label: item.label,
              category: `fallback-${index}`,
              value: "",
              subcategories: item.subcategories.map(
                (sub: FallbackSubcategory, subIndex: number) => ({
                  ...sub,
                  id: `fallback-sub-${index}-${subIndex}`,
                  name: sub.subcategoryTitle,
                  description: "",
                  value: "",
                }),
              ),
            })),
          );
          return;
        }

        if (!response.ok) {
          // If API fails, fall back to static file
          console.warn("API returned error, falling back to static file");
          const fallbackResponse = await fetch("/data/emissions.json");
          if (!fallbackResponse.ok) {
            throw new Error(
              "Failed to fetch emission categories from both API and static file",
            );
          }
        const fallbackData =
          (await fallbackResponse.json()) as FallbackEmissionItem[];
        setCategories(
          fallbackData.map((item: FallbackEmissionItem, index: number) => ({
            ...item,
            id: `fallback-${index}`,
            name: item.label,
            description: "",
            label: item.label,
            category: `fallback-${index}`,
            value: "",
            subcategories: item.subcategories.map(
              (sub: FallbackSubcategory, subIndex: number) => ({
                ...sub,
                id: `fallback-sub-${index}-${subIndex}`,
                name: sub.subcategoryTitle,
                description: "",
                value: "",
              }),
            ),
          })),
        );
        return;
      }

      const data = await response.json();

        if (!data.success || !Array.isArray(data.categories)) {
          throw new Error(
            "Invalid response format from emission categories API",
          );
        }

        // Process and translate categories
        const processedCategories: ProcessedEmissionCategory[] =
          data.categories.map(
            (category: TranslatableCategory | EmissionCategory) => {
              const translatedCategory = getTranslatedCategory(
                category,
                locale,
              );

              // Process subcategories
              const processedSubcategories = category.subcategories.map(
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
                  };
                },
              );

              return {
                id: category.id,
                name: translatedCategory.name,
                description: translatedCategory.description,
                category: category.id, // Use the database ID as category identifier
                legacyCategory: mapToLegacyCategory(translatedCategory.name),
                subcategories: processedSubcategories,
                value: "", // Initialize empty value for user input
                label: translatedCategory.name, // For compatibility with existing EmissionType
              };
            },
          );

        setCategories(processedCategories);
      } catch (err) {
        console.error("Error fetching emission categories:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch emission categories",
        );

        // Try to fall back to static file as last resort
        try {
          const fallbackResponse = await fetch("/data/emissions.json");
          if (fallbackResponse.ok) {
            const fallbackData =
              (await fallbackResponse.json()) as FallbackEmissionItem[];
            setCategories(
              fallbackData.map((item: FallbackEmissionItem, index: number) => ({
                ...item,
                id: `fallback-${index}`,
                name: item.label,
                description: "",
                label: item.label,
                category: `fallback-${index}`,
                value: "",
                subcategories: item.subcategories.map(
                  (sub: FallbackSubcategory, subIndex: number) => ({
                    ...sub,
                    id: `fallback-sub-${index}-${subIndex}`,
                    name: sub.subcategoryTitle,
                    description: "",
                    value: "",
                  }),
                ),
              })),
            );
            setError(null); // Clear error if fallback succeeds
          }
        } catch (fallbackError) {
          console.error("Fallback to static file also failed:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmissionCategories();
  }, [locale, user]);

  return {
    categories,
    loading,
    error,
    refetch: () => window.location.reload(),
  };
};
