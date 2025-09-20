import { useState, useEffect } from "react";
import { School, SchoolEmissionCategory } from "@/types/School";
import {
  TranslatableCategory,
  getTranslatedCategory,
  getTranslatedSubcategory,
} from "@/types/EmissionCategory";

export interface ProcessedSchoolEmissionCategory {
  id: string;
  category: string; // categoryId from school data
  name: string;
  description?: string;
  amount: number; // Teacher-set emission amount in kgCO2e
  percentage: number; // Calculated percentage of total emissions
  subcategories: {
    id: string;
    name: string;
    description?: string;
    amount: number; // Teacher-set emission amount in kgCO2e
    percentage: number; // Calculated percentage of category emissions
  }[];
  legacyCategory?: string;
  updatedAt: string;
}

export function useSchoolEmissionData(
  projectId: string,
  locale: string = "en",
) {
  const [categories, setCategories] = useState<
    ProcessedSchoolEmissionCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    const fetchSchoolEmissionData = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, get the project to find the school ID
        const projectResponse = await fetch(`/api/project/${projectId}`);
        if (!projectResponse.ok) {
          throw new Error("Failed to fetch project data");
        }

        const projectData = await projectResponse.json();
        const schoolId = projectData.project?.schoolId;

        if (!schoolId) {
          throw new Error("No school associated with this project");
        }

        // Get school emission data
        const schoolResponse = await fetch(`/api/school/${schoolId}/emissions`);
        if (!schoolResponse.ok) {
          throw new Error("Failed to fetch school emission data");
        }

        const schoolData = await schoolResponse.json();
        setSchool(schoolData.school);

        const schoolEmissionCategories = schoolData.emissionCategories || [];

        // If no school-specific data, fall back to global categories (for backward compatibility)
        if (schoolEmissionCategories.length === 0) {
          console.warn(
            "No school-specific emission data found, falling back to global categories",
          );

          // Fetch global categories as fallback
          const globalResponse = await fetch(
            "/api/emission-categories/public?locale=" + locale,
          );
          if (globalResponse.ok) {
            const globalData = await globalResponse.json();
            const processedGlobal = globalData.categories.map(
              (cat: TranslatableCategory) => {
                const translatedCategory = getTranslatedCategory(cat, locale);
                return {
                  id: cat.id,
                  category: cat.id,
                  name: translatedCategory.name,
                  description: translatedCategory.description,
                  amount: 0, // No teacher-set amounts
                  percentage: 0,
                  subcategories: cat.subcategories.map((sub) => {
                    const translatedSub = getTranslatedSubcategory(sub, locale);
                    return {
                      id: sub.id,
                      name: translatedSub.name,
                      description: translatedSub.description,
                      amount: 0, // No teacher-set amounts
                      percentage: 0,
                    };
                  }),
                  legacyCategory: translatedCategory.name
                    .toLowerCase()
                    .replace(/\s+/g, ""),
                  updatedAt: cat.updatedAt || cat.createdAt,
                };
              },
            );
            setCategories(processedGlobal);
          }
          return;
        }

        // Process school emission categories with global category data for translations
        const globalResponse = await fetch(
          "/api/emission-categories/public?locale=" + locale,
        );
        let globalCategories: TranslatableCategory[] = [];

        if (globalResponse.ok) {
          const globalData = await globalResponse.json();
          // The public API returns already-translated data
          globalCategories = globalData.categories;
          console.log(
            "Loaded global categories for translation:",
            globalCategories.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              subcategoriesCount: cat.subcategories?.length || 0,
              subcategoryNames:
                cat.subcategories?.map((sub: any) => sub.name) || [],
            })),
          );
        }

        // Calculate total emissions for percentage calculations (handle backward compatibility)
        const totalEmissions = schoolEmissionCategories.reduce(
          (total, cat) =>
            total +
            (cat.amount !== undefined ? cat.amount : (cat as any).value || 0),
          0,
        );

        const processedCategories: ProcessedSchoolEmissionCategory[] =
          schoolEmissionCategories.map((schoolCat: SchoolEmissionCategory) => {
            // Handle backward compatibility for amount/value
            const categoryAmount =
              schoolCat.amount !== undefined
                ? schoolCat.amount
                : (schoolCat as any).value || 0;

            // Find matching global category for translations
            const globalCategory = globalCategories.find(
              (gc: any) => gc.id === schoolCat.categoryId,
            );
            // Since globalCategories is already translated, use it directly
            const translatedCategory = globalCategory
              ? {
                  name: globalCategory.name,
                  description: globalCategory.description,
                }
              : { name: schoolCat.categoryName, description: "" };

            // Calculate category percentage
            const categoryPercentage =
              totalEmissions > 0 ? (categoryAmount / totalEmissions) * 100 : 0;

            return {
              id: schoolCat.categoryId,
              category: schoolCat.categoryId,
              name: translatedCategory.name,
              description: translatedCategory.description,
              amount: categoryAmount,
              percentage: categoryPercentage,
              subcategories: schoolCat.subcategories.map((schoolSub) => {
                // Handle backward compatibility for amount/value
                const subcategoryAmount =
                  schoolSub.amount !== undefined
                    ? schoolSub.amount
                    : (schoolSub as any).value || 0;

                // Find matching global subcategory for additional data
                const globalSub = globalCategory?.subcategories?.find(
                  (gs: any) => gs.id === schoolSub.subcategoryId,
                );

                // Since globalCategories is already translated, use it directly
                const translatedSub = globalSub
                  ? { name: globalSub.name, description: globalSub.description }
                  : { name: schoolSub.subcategoryName, description: "" };

                // Calculate subcategory percentage
                const subcategoryPercentage =
                  categoryAmount > 0
                    ? (subcategoryAmount / categoryAmount) * 100
                    : 0;

                console.log(
                  `Processing subcategory ${schoolSub.subcategoryId}:`,
                  {
                    globalSub: !!globalSub,
                    translatedName: translatedSub.name,
                    fallbackName: schoolSub.subcategoryName,
                    finalName: translatedSub.name || schoolSub.subcategoryName,
                  },
                );

                return {
                  id: schoolSub.subcategoryId,
                  name: translatedSub.name || schoolSub.subcategoryName,
                  description: translatedSub.description || "",
                  amount: subcategoryAmount,
                  percentage: subcategoryPercentage,
                };
              }),
              legacyCategory: translatedCategory.name
                .toLowerCase()
                .replace(/\s+/g, ""),
              updatedAt: schoolCat.updatedAt,
            };
          });

        setCategories(processedCategories);
      } catch (err) {
        console.error("Error fetching school emission data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load school emission data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolEmissionData();
  }, [projectId, locale]);

  return {
    categories,
    loading,
    error,
    school,
    refetch: () => {
      setLoading(true);
      setError(null);
      // The useEffect will re-run due to dependency changes
    },
  };
}
