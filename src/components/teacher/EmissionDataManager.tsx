import React, { useState, useEffect } from "react";
import { School, SchoolEmissionCategory } from "@/types/School";
import { useToast } from "@/context/ToastContext";

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
  const [schoolCategories, setSchoolCategories] = useState<
    SchoolEmissionCategory[]
  >(school.emissionCategories || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
        showToast("error", "Error", "Failed to load emission categories", 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalCategories();
  }, [school, showToast]);

  const handleCategoryAmountChange = (categoryId: string, amount: number) => {
    setSchoolCategories((prev) =>
      prev.map((cat) =>
        cat.categoryId === categoryId
          ? { ...cat, amount, updatedAt: new Date().toISOString() }
          : cat,
      ),
    );
  };

  const handleSubcategoryAmountChange = (
    categoryId: string,
    subcategoryId: string,
    amount: number,
  ) => {
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

  const refreshSubcategoryNames = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/emission-categories/public?locale=en");

      if (response.ok) {
        const data = await response.json();

        // Update subcategory names with latest translations
        const updatedCategories: SchoolEmissionCategory[] =
          schoolCategories.map((schoolCat) => {
            const globalCat = data.categories.find(
              (gc: TranslatedCategory) => gc.id === schoolCat.categoryId,
            );

            if (globalCat) {
              return {
                ...schoolCat,
                categoryName: globalCat.name,
                subcategories: schoolCat.subcategories.map((schoolSub) => {
                  const globalSub = globalCat.subcategories?.find(
                    (gs: TranslatedSubcategory) =>
                      gs.id === schoolSub.subcategoryId,
                  );

                  if (globalSub) {
                    return {
                      ...schoolSub,
                      subcategoryName: globalSub.name,
                    };
                  }
                  return schoolSub;
                }),
              };
            }
            return schoolCat;
          });

        setSchoolCategories(updatedCategories);
        showToast(
          "success",
          "Success",
          "Subcategory names refreshed from latest translations",
          3000,
        );
      }
    } catch (error) {
      console.error("Error refreshing subcategory names:", error);
      showToast("error", "Error", "Failed to refresh subcategory names", 5000);
    } finally {
      setRefreshing(false);
    }
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
      showToast("success", "Success", "Emission data saved successfully", 4000);
    } catch (error) {
      console.error("Error saving emission data:", error);
      showToast(
        "error",
        "Error",
        error instanceof Error ? error.message : "Failed to save emission data",
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
          <span className="ml-2">Loading emission categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-2xl">School Emission Data</h3>
            <p className="mt-2 text-gray-600">
              Enter the emission amounts (in kgCO2e) for your school. The tool
              will automatically calculate percentages for action impact
              calculations.
            </p>
          </div>
          <button
            onClick={refreshSubcategoryNames}
            disabled={refreshing}
            className="btn-outline btn btn-sm"
          >
            {refreshing ? (
              <>
                <div className="loading loading-spinner loading-xs"></div>
                Refreshing...
              </>
            ) : (
              "Refresh Names"
            )}
          </button>
        </div>
        {percentages.totalEmissions > 0 && (
          <div className="bg-blue-50 mt-4 p-4 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900">
              Total School Emissions
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
              <div className="flex justify-between items-start">
                <div>
                  <label className="block mb-2 font-semibold text-lg">
                    {category.categoryName}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={category.amount}
                      onChange={(e) =>
                        handleCategoryAmountChange(
                          category.categoryId,
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-40 input"
                      placeholder="0"
                    />
                    <span className="text-gray-500">kgCO2e</span>
                  </div>
                </div>
                {percentages.totalEmissions > 0 && (
                  <div className="text-right">
                    <div className="text-gray-500 text-sm">
                      Percentage of total
                    </div>
                    <div className="font-bold text-green-600 text-lg">
                      {percentages.categories.find(
                        (c) => c.categoryId === category.categoryId,
                      )?.percentage || 0}
                      %
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 ml-4">
              <h4 className="font-medium text-gray-700">Subcategories:</h4>
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
                    className="flex justify-between items-center"
                  >
                    <label className="flex-1 font-medium text-sm">
                      {subcategory.subcategoryName}
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={subcategory.amount}
                          onChange={(e) =>
                            handleSubcategoryAmountChange(
                              category.categoryId,
                              subcategory.subcategoryId,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-32 text-sm input"
                          placeholder="0"
                        />
                        <span className="text-gray-500 text-sm">kgCO2e</span>
                      </div>
                      {category.amount > 0 && (
                        <div className="min-w-[60px] text-right">
                          <div className="text-gray-500 text-xs">
                            % of category
                          </div>
                          <div className="font-semibold text-blue-600 text-sm">
                            {subcategoryPercentage}%
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
              Saving...
            </>
          ) : (
            "Save Emission Data"
          )}
        </button>
      </div>
    </div>
  );
};

export default EmissionDataManager;
