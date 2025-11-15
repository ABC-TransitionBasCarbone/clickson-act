import React, { useState, useEffect } from "react";
import { School, SchoolEmissionCategory } from "@/types/School";
import { useToast } from "@/context/ToastContext";
import { useTranslations } from "next-intl";

interface EmissionDataManagerProps {
  school: School;
  onUpdate: (updatedSchool: School) => void;
}

// Interface for the translated data from public API
interface TranslatedCategory {
  id: string;
  name: string;
  description: string;
  subcategories: TranslatedSubcategory[];
}

interface TranslatedSubcategory {
  id: string;
  name: string;
  description: string;
  subcategoryTitle: string;
}

const EmissionDataManager: React.FC<EmissionDataManagerProps> = ({
  school,
  onUpdate,
}) => {
  const { showToast } = useToast();
  const t = useTranslations("EmissionDataManager");
  const [schoolCategories, setSchoolCategories] = useState<
    SchoolEmissionCategory[]
  >(school.emissionCategories || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Store raw input strings to preserve commas during typing
  const [rawInputs, setRawInputs] = useState<{
    categories: Record<string, string>;
    subcategories: Record<string, string>;
  }>({ categories: {}, subcategories: {} });

  // Load global categories for reference and update subcategory names
  useEffect(() => {
    const fetchGlobalCategories = async () => {
      try {
        const response = await fetch(
          "/api/emission-categories/public?locale=en",
        );
        if (response.ok) {
          const data = await response.json();

          // Always update subcategory names from latest translations
          if (
            school.emissionCategories &&
            school.emissionCategories.length > 0
          ) {
            // Update existing school categories with fresh subcategory names
            const updatedCategories: SchoolEmissionCategory[] =
              school.emissionCategories.map((schoolCat) => {
                const globalCat = data.categories.find(
                  (gc: TranslatedCategory) => gc.id === schoolCat.categoryId,
                );

                if (globalCat) {
                  console.log(
                    `Updating category ${schoolCat.categoryId} with fresh translations:`,
                    {
                      oldName: schoolCat.categoryName,
                      newName: globalCat.name,
                      subcategories: globalCat.subcategories?.map(
                        (sub: TranslatedSubcategory) => ({
                          id: sub.id,
                          name: sub.name,
                        }),
                      ),
                    },
                  );

                  return {
                    ...schoolCat,
                    categoryName: globalCat.name, // Update category name too
                    subcategories: schoolCat.subcategories.map((schoolSub) => {
                      const globalSub = globalCat.subcategories?.find(
                        (gs: TranslatedSubcategory) =>
                          gs.id === schoolSub.subcategoryId,
                      );

                      if (globalSub) {
                        console.log(
                          `Updating subcategory ${schoolSub.subcategoryId}:`,
                          {
                            oldName: schoolSub.subcategoryName,
                            newName: globalSub.name,
                          },
                        );

                        return {
                          ...schoolSub,
                          subcategoryName: globalSub.name, // Update with fresh translation
                        };
                      }
                      return schoolSub;
                    }),
                  };
                }
                return schoolCat;
              });

            setSchoolCategories(updatedCategories);
          } else {
            // If school has no emission data, initialize with global categories
            const initialCategories: SchoolEmissionCategory[] =
              data.categories.map((cat: TranslatedCategory) => {
                console.log(`Initializing category ${cat.id}:`, {
                  name: cat.name,
                  subcategories: cat.subcategories?.map(
                    (sub: TranslatedSubcategory) => ({
                      id: sub.id,
                      name: sub.name,
                      subcategoryTitle: sub.subcategoryTitle,
                    }),
                  ),
                });

                return {
                  categoryId: cat.id,
                  categoryName: cat.name,
                  amount: 0,
                  subcategories: (cat.subcategories || []).map(
                    (sub: TranslatedSubcategory) => {
                      console.log(`Initializing subcategory ${sub.id}:`, {
                        name: sub.name,
                        subcategoryTitle: sub.subcategoryTitle,
                        description: sub.description,
                      });

                      return {
                        subcategoryId: sub.id,
                        subcategoryName:
                          sub.name ||
                          sub.subcategoryTitle ||
                          `Fallback-${sub.id}`,
                        amount: 0,
                        updatedAt: new Date().toISOString(),
                      };
                    },
                  ),
                  updatedAt: new Date().toISOString(),
                };
              });
            setSchoolCategories(initialCategories);
          }
        }
      } catch (error) {
        console.error("Error fetching global categories:", error);
        showToast("error", t("error"), t("failedToLoadCategories"), 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalCategories();
  }, [school, showToast, t]);

  // Parse input value handling commas as decimal separators
  const parseInputValue = (value: string): number => {
    if (!value || value.trim() === "") return 0;
    // Remove any non-numeric characters except comma and period
    // Replace comma with period for decimal separator (European format)
    const cleaned = value.replace(/[^\d,.-]/g, ""); // Remove all non-numeric except comma, period, minus
    // Handle comma as decimal separator
    const normalizedValue = cleaned.replace(/,/g, ".");
    // Only allow one decimal point
    const parts = normalizedValue.split(".");
    const finalValue =
      parts.length > 2
        ? parts[0] + "." + parts.slice(1).join("")
        : normalizedValue;
    const parsed = parseFloat(finalValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleCategoryAmountChange = (categoryId: string, value: string) => {
    // Store raw input string to preserve commas
    setRawInputs((prev) => ({
      ...prev,
      categories: { ...prev.categories, [categoryId]: value },
    }));
    // Parse and update the amount
    const amount = parseInputValue(value);
    setSchoolCategories((prev) =>
      prev.map((cat) =>
        cat.categoryId === categoryId
          ? { ...cat, amount, updatedAt: new Date().toISOString() }
          : cat,
      ),
    );
  };

  const handleCategoryAmountBlur = (categoryId: string) => {
    // On blur, ensure the raw input is formatted correctly with comma
    const rawInput = rawInputs.categories[categoryId] || "";
    const amount = parseInputValue(rawInput);
    if (rawInput && amount > 0) {
      // Update raw input to show comma format
      setRawInputs((prev) => ({
        ...prev,
        categories: {
          ...prev.categories,
          [categoryId]: String(amount).replace(".", ","),
        },
      }));
    }
  };

  const handleSubcategoryAmountChange = (
    categoryId: string,
    subcategoryId: string,
    value: string,
  ) => {
    const key = `${categoryId}-${subcategoryId}`;
    // Store raw input string to preserve commas
    setRawInputs((prev) => ({
      ...prev,
      subcategories: { ...prev.subcategories, [key]: value },
    }));
    // Parse and update the amount
    const amount = parseInputValue(value);
    setSchoolCategories((prev) =>
      prev.map((cat) =>
        cat.categoryId === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.map((sub) =>
                sub.subcategoryId === subcategoryId
                  ? { ...sub, amount, updatedAt: new Date().toISOString() }
                  : sub,
              ),
              updatedAt: new Date().toISOString(),
            }
          : cat,
      ),
    );
  };

  const handleSubcategoryAmountBlur = (
    categoryId: string,
    subcategoryId: string,
  ) => {
    // On blur, ensure the raw input is formatted correctly with comma
    const key = `${categoryId}-${subcategoryId}`;
    const rawInput = rawInputs.subcategories[key] || "";
    const amount = parseInputValue(rawInput);
    if (rawInput && amount > 0) {
      // Update raw input to show comma format
      setRawInputs((prev) => ({
        ...prev,
        subcategories: {
          ...prev.subcategories,
          [key]: String(amount).replace(".", ","),
        },
      }));
    }
  };

  // Get display value for category input
  const getCategoryDisplayValue = (
    categoryId: string,
    amount: number,
  ): string => {
    const rawInput = rawInputs.categories[categoryId];
    if (rawInput !== undefined) {
      return rawInput;
    }
    return amount === 0 ? "" : String(amount).replace(".", ",");
  };

  // Get display value for subcategory input
  const getSubcategoryDisplayValue = (
    categoryId: string,
    subcategoryId: string,
    amount: number,
  ): string => {
    const key = `${categoryId}-${subcategoryId}`;
    const rawInput = rawInputs.subcategories[key];
    if (rawInput !== undefined) {
      return rawInput;
    }
    return amount === 0 ? "" : String(amount).replace(".", ",");
  };

  // Calculate total emissions and percentages
  const calculatePercentages = () => {
    const totalEmissions = schoolCategories.reduce(
      (total, cat) => total + cat.amount,
      0,
    );

    return {
      totalEmissions,
      categories: schoolCategories.map((cat) => ({
        categoryId: cat.categoryId,
        percentage:
          totalEmissions > 0
            ? Math.round((cat.amount / totalEmissions) * 100)
            : 0,
        subcategories: cat.subcategories.map((sub) => ({
          subcategoryId: sub.subcategoryId,
          percentage:
            cat.amount > 0 ? Math.round((sub.amount / cat.amount) * 100) : 0,
        })),
      })),
    };
  };

  const percentages = calculatePercentages();

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/school/${school.id}/emissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emissionCategories: schoolCategories,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save emission data");
      }

      const result = await response.json();

      // Update the school object with new emission data
      const updatedSchool: School = {
        ...school,
        emissionCategories: result.emissionCategories,
        updatedAt: new Date().toISOString(),
      };

      onUpdate(updatedSchool);
      showToast(
        "success",
        t("success"),
        t("emissionDataSavedSuccessfully"),
        4000,
      );
    } catch (error) {
      console.error("Error saving emission data:", error);
      showToast(
        "error",
        t("error"),
        error instanceof Error ? error.message : t("failedToSaveData"),
        5000,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex justify-center items-center py-8">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-2">{t("loadingEmissionCategories")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex max-lg:flex-col justify-between items-start">
          <div>
            <h3 className="font-bold text-2xl">{t("title")}</h3>
            <p className="mt-2 text-gray-600">{t("description")}</p>
          </div>
        </div>
        {percentages.totalEmissions > 0 && (
          <div className="bg-blue-50 mt-4 p-4 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900">
              {t("totalSchoolEmissions")}
            </h4>
            <p className="font-bold text-blue-800 text-lg">
              {percentages.totalEmissions.toLocaleString()} kgCO2e
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {schoolCategories.map((category) => (
          <div key={category.categoryId} className="p-4 border rounded-lg">
            <div className="mb-4">
              <div className="flex max-lg:flex-col justify-between items-start">
                <div>
                  <label className="block mb-2 font-semibold text-lg">
                    {category.categoryName}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={getCategoryDisplayValue(
                        category.categoryId,
                        category.amount,
                      )}
                      onChange={(e) => {
                        // Allow input with commas and periods
                        const inputValue = e.target.value;
                        // Only allow numbers, commas, and periods
                        if (/^[\d,.]*$/.test(inputValue) || inputValue === "") {
                          handleCategoryAmountChange(
                            category.categoryId,
                            inputValue,
                          );
                        }
                      }}
                      onBlur={() =>
                        handleCategoryAmountBlur(category.categoryId)
                      }
                      className="w-40 input"
                      placeholder="0"
                    />
                    <span className="text-gray-500">kgCO2e</span>
                  </div>
                </div>
                {percentages.totalEmissions > 0 && (
                  <div className="flex gap-1 text-right">
                    <div className="font-bold text-green-600 text-sm lg:text-lg">
                      {percentages.categories.find(
                        (c) => c.categoryId === category.categoryId,
                      )?.percentage || 0}
                      %
                    </div>
                    <div className="text-gray-500 text-sm">
                      {t("percentageOfTotal")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 lg:ml-4">
              <h4 className="font-semibold text-gray-700">
                {t("subcategories")}
              </h4>
              {category.subcategories.map((subcategory) => {
                const categoryPercentages = percentages.categories.find(
                  (c) => c.categoryId === category.categoryId,
                );
                const subcategoryPercentage =
                  categoryPercentages?.subcategories.find(
                    (s) => s.subcategoryId === subcategory.subcategoryId,
                  )?.percentage || 0;

                console.log("subcategoryPercentage", subcategory);

                return (
                  <div
                    key={subcategory.subcategoryId}
                    className="flex max-lg:flex-col justify-between items-start lg:items-center"
                  >
                    <label className="max-lg:flex-1 lg:min-w-1/2 font-medium text-sm">
                      {subcategory.subcategoryName}
                    </label>
                    <div className="flex max-lg:flex-col lg:justify-start items-start lg:items-center lg:gap-10 space-x-4 max-lg:space-x-0 max-lg:space-y-2 max-lg:mt-2 max-lg:w-full min-w-1/3">
                      <div className="flex items-center space-x-2 mb-0">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={getSubcategoryDisplayValue(
                            category.categoryId,
                            subcategory.subcategoryId,
                            subcategory.amount,
                          )}
                          onChange={(e) => {
                            // Allow input with commas and periods
                            const inputValue = e.target.value;
                            // Only allow numbers, commas, and periods
                            if (
                              /^[\d,.]*$/.test(inputValue) ||
                              inputValue === ""
                            ) {
                              handleSubcategoryAmountChange(
                                category.categoryId,
                                subcategory.subcategoryId,
                                inputValue,
                              );
                            }
                          }}
                          onBlur={() =>
                            handleSubcategoryAmountBlur(
                              category.categoryId,
                              subcategory.subcategoryId,
                            )
                          }
                          className="w-32 text-sm input"
                          placeholder="0"
                        />
                        <span className="text-gray-500 text-sm">kgCO2e</span>
                      </div>
                      {category.amount > 0 && (
                        <div className="flex lg:flex-1 lg:justify-end gap-1 max-lg:w-full text-right">
                          <div className="font-semibold text-primary text-sm">
                            {subcategoryPercentage}%
                          </div>
                          <div className="text-gray-500 text-xs max-lg:text-sm leading-normal">
                            {t("percentOfCategory")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? (
            <>
              <div className="loading loading-spinner loading-sm"></div>
              {t("saving")}
            </>
          ) : (
            t("saveEmissionData")
          )}
        </button>
      </div>
    </div>
  );
};

export default EmissionDataManager;
