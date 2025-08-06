"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import EmissionsInput from "./EmissionsInput";
import { useUser } from "@/context/UserContext";
import { Action } from "@/types/Action";

import { SubcategoryForm } from "./SubcategoryForm";

import { ActionsSection } from "./ActionsSection";
import { SelectedActionsSummary } from "./SelectedActionsSummary";
import { AddActionModalWrapper } from "./AddActionModalWrapper";

import {
  useEmissionCategories,
  ProcessedEmissionCategory,
} from "@/hooks/useEmissionCategories";
import { useActions } from "@/hooks/useActions";
import { useToast } from "@/context/ToastContext";

interface CustomAction extends Action {
  selected: boolean;
}

const StudentCalculator: React.FC = () => {
  const t = useTranslations("StudentCalculator");
  const { user } = useUser();
  const { showToast } = useToast();
  const {
    categories: emissionCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useEmissionCategories();

  const {
    actions: actionTemplates,
    loading: actionsLoading,
    error: actionsError,
  } = useActions();

  const schoolGoal = 70;

  const [emissions, setEmissions] = useState<ProcessedEmissionCategory[]>([]);

  const [actions, setActions] = useState<CustomAction[]>([]);

  const [filteredActions, setFilteredActions] = useState<Action[]>([]);
  const [activeEmissionCategories, setActiveEmissionCategories] = useState<
    string[]
  >([]);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategoryValues, setSubcategoryValues] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [addingToMonitoring, setAddingToMonitoring] = useState<Set<string>>(
    new Set(),
  );

  // Function to calculate dynamic reduction for display
  const calculateDisplayReduction = (action: CustomAction): number => {
    const actionType = action.type || "Fixed";

    // For Fixed actions, always return original reduction
    if (actionType === "Fixed") {
      return action.reduction;
    }

    // For Dynamic actions, check if we have the necessary data
    if (
      actionType === "Dynamic" &&
      selectedCategory &&
      subcategoryValues.length > 0 &&
      subcategoryValues.some((val) => val && val.trim() !== "")
    ) {
      const selectedEmission = emissions.find(
        (e) => e.category === selectedCategory,
      );

      if (selectedEmission) {
        // Get user-entered category value
        const categoryValue = parseFloat(selectedEmission.value) || 0;

        // Calculate total of user-entered subcategory values
        const filledSubcategoryValues = subcategoryValues
          .map((val) => {
            if (val && val.trim() !== "") {
              return parseFloat(val) || 0;
            }
            return 0;
          })
          .filter((val) => val > 0);

        const totalSubcategoryValue = filledSubcategoryValues.reduce(
          (sum, val) => sum + val,
          0,
        );

        // Calculate using the correct formula: action × subcategory_percentage × category_percentage
        let calculatedValue = action.reduction;

        if (categoryValue > 0 && totalSubcategoryValue > 0) {
          // Use the actual percentages as decimals directly
          const subcategoryPercentage = totalSubcategoryValue / 100; // e.g., 80/100 = 0.8 for 80%
          const categoryPercentage = categoryValue / 100; // e.g., 20/100 = 0.2 for 20%

          calculatedValue =
            action.reduction * subcategoryPercentage * categoryPercentage;
        }

        // Debug: Dynamic calculation with user values
        console.log(
          `Dynamic calculation for "${action.title}" using CORRECT FORMULA:`,
          {
            originalReduction: action.reduction,
            categoryValue: categoryValue,
            subcategoryValues: filledSubcategoryValues,
            totalSubcategoryValue: totalSubcategoryValue,
            subcategoryPercentage: totalSubcategoryValue / 100,
            categoryPercentage: categoryValue / 100,
            calculatedValue: calculatedValue,
            formula: `${action.reduction} × (${totalSubcategoryValue}/100) × (${categoryValue}/100) = ${calculatedValue}`,
          },
        );

        return calculatedValue;
      }
    }

    // Return original reduction if no dynamic calculation is possible
    return action.reduction;
  };

  const totalSelectedReduction = selectedActions.reduce((sum, id) => {
    const action = actions.find((a) => a.id === id);
    return sum + (action ? calculateDisplayReduction(action) : 0);
  }, 0);

  // Set actions from the hook when action templates are loaded
  useEffect(() => {
    // Always set actions, even if empty array
    console.log("Loaded action templates:", actionTemplates.length, "actions");
    // Convert Action[] to CustomAction[] by adding selected property
    const customActions: CustomAction[] = actionTemplates.map((action) => ({
      ...action,
      selected: false,
    }));
    setActions(customActions);
  }, [actionTemplates]);

  // Set emissions from the hook when categories are loaded
  useEffect(() => {
    if (emissionCategories.length > 0) {
      // console.log("Loaded emission categories:", emissionCategories.map(cat => ({id: cat.id, name: cat.name, legacyCategory: cat.legacyCategory})));
      setEmissions(emissionCategories);
    }
  }, [emissionCategories]);

  const handleEmissionChange = (idx: number, val: string) => {
    setEmissions((prev) => {
      const copy = [...prev];
      copy[idx].value = val;
      return copy;
    });
  };

  const handleCalculateEmissions = () => {
    const cats: string[] = [];
    const legacyCats: string[] = [];

    emissions.forEach((e) => {
      const n = parseFloat(e.value);
      if (!isNaN(n) && n > 0) {
        if (!cats.includes(e.category)) {
          cats.push(e.category);
        }
        // Also collect legacy categories for action filtering
        if (e.legacyCategory && !legacyCats.includes(e.legacyCategory)) {
          legacyCats.push(e.legacyCategory);
        }
      }
    });

    setActiveEmissionCategories(cats);

    // Filter actions by both database category IDs and legacy categories
    const categoryActions = actions.filter(
      (a) =>
        cats.includes(a.category) || // Database category ID match
        legacyCats.includes(a.category), // Legacy category match
    );

    // Debug: Selected categories and actions
    console.log("Selected database category IDs:", cats);
    console.log("Selected legacy categories:", legacyCats);
    console.log("Available action categories:", [
      ...new Set(actions.map((a) => a.category)),
    ]);
    console.log(
      `Found ${categoryActions.length} actions for selected categories:`,
      categoryActions.map((a) => a.title),
    );

    // If no actions found with category matching, show all actions as fallback
    if (categoryActions.length === 0) {
      if (actions.length > 0) {
        console.log(
          `No actions found for categories, showing all ${actions.length} actions as fallback`,
        );
        setFilteredActions(actions);
      } else {
        console.log("No action templates available in database");
        setFilteredActions([]);
      }
    } else {
      setFilteredActions(categoryActions);
    }
    setShowSubcategoryForm(true);
    setSelectedCategory(null);
    setSubcategoryValues([]);
  };

  const handleCalculateSubcategories = () => {
    if (selectedCategory) {
      // Find the selected emission category
      const selectedEmission = emissions.find(
        (e) => e.category === selectedCategory,
      );
      if (selectedEmission) {
        // Get subcategories that have values entered
        const filledSubcategories = selectedEmission.subcategories.filter(
          (_, index) =>
            subcategoryValues[index] && subcategoryValues[index].trim() !== "",
        );

        console.log("Selected category ID:", selectedCategory);
        console.log("Selected emission:", selectedEmission.name);
        console.log("Legacy category:", selectedEmission.legacyCategory);
        console.log(
          "Filled subcategories:",
          filledSubcategories.map((s) => s.name),
        );

        if (filledSubcategories.length > 0) {
          // Show ALL actions for the category, but prioritize those matching subcategories
          const categoryActions = actions.filter(
            (a) =>
              a.category === selectedCategory || // Database category ID match
              a.category === selectedEmission.legacyCategory, // Legacy category match
          );

          console.log(
            `Found ${categoryActions.length} total actions for category "${selectedEmission.name}"`,
          );

          // Log details about each action for debugging
          categoryActions.forEach((action) => {
            const hasSubcategory = (action as Action & { subcategory?: string })
              .subcategory;
            console.log(`Action "${action.title}":`, {
              category: action.category,
              hasSubcategory,
              subcategory: (action as Action & { subcategory?: string })
                .subcategory,
            });
          });

          setFilteredActions(categoryActions);
        } else {
          // No subcategories filled, show all category actions
          const categoryActions = actions.filter(
            (a) =>
              a.category === selectedCategory || // Database category ID match
              a.category === selectedEmission.legacyCategory, // Legacy category match
          );
          console.log(
            `No subcategories filled, showing ${categoryActions.length} category actions`,
          );
          setFilteredActions(categoryActions);
        }
      }
    }
  };

  const handleActionSelect = (actionId: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId],
    );
  };

  const handleAddToMonitoring = async (actionId: string) => {
    // Only allow users who are logged in (either with token or passcode)
    if (!user || !user.username) {
      console.warn("Add to monitoring is only available for logged-in users");
      return;
    }

    // Check if we have a project context (for students with passcode)
    const projectId = user.passcode;
    if (!projectId) {
      console.warn("No project context found for adding to monitoring");
      return;
    }

    // Require subcategory selection
    if (
      !selectedCategory ||
      subcategoryValues.length === 0 ||
      subcategoryValues.every((val) => !val || val.trim() === "")
    ) {
      showToast(
        "warning",
        "Subcategory Required",
        "Please select a category and enter subcategory data before adding actions to monitoring.",
        5000,
      );
      return;
    }

    // Find the action and selected emission category
    const action = actions.find((a) => a.id === actionId);
    const selectedEmission = emissions.find(
      (e) => e.category === selectedCategory,
    );

    if (!action || !selectedEmission) {
      console.error("Action or emission category not found");
      return;
    }

    // Calculate the emission reduction based on action type
    let calculatedReduction = action.reduction;

    // Check if action has type field (from action template)
    const actionType = action.type || "Fixed"; // Default to Fixed if not specified

    if (actionType === "Dynamic") {
      // Dynamic calculation using USER-ENTERED VALUES
      // Get user-entered category value
      const categoryValue = parseFloat(selectedEmission.value) || 0;

      // Calculate total of user-entered subcategory values
      const filledSubcategoryValues = subcategoryValues
        .map((val) => {
          if (val && val.trim() !== "") {
            return parseFloat(val) || 0;
          }
          return 0;
        })
        .filter((val) => val > 0);

      const totalSubcategoryValue = filledSubcategoryValues.reduce(
        (sum, val) => sum + val,
        0,
      );

      // Calculate using the correct formula: action × subcategory_percentage × category_percentage
      if (categoryValue > 0 && totalSubcategoryValue > 0) {
        // Use the actual percentages as decimals directly
        const subcategoryPercentage = totalSubcategoryValue / 100; // e.g., 80/100 = 0.8 for 80%
        const categoryPercentage = categoryValue / 100; // e.g., 20/100 = 0.2 for 20%

        calculatedReduction =
          action.reduction * subcategoryPercentage * categoryPercentage;
      }

      console.log(
        `handleAddToMonitoring calculation for action "${action.title}" using CORRECT FORMULA:`,
        {
          originalReduction: action.reduction,
          categoryValue: categoryValue,
          subcategoryValues: filledSubcategoryValues,
          totalSubcategoryValue: totalSubcategoryValue,
          subcategoryPercentage: totalSubcategoryValue / 100,
          categoryPercentage: categoryValue / 100,
          calculatedReduction: calculatedReduction,
          formula: `${action.reduction} × (${totalSubcategoryValue}/100) × (${categoryValue}/100) = ${calculatedReduction}`,
        },
      );
    } else {
      console.log(
        `Fixed reduction for action "${action.title}":`,
        calculatedReduction,
      );
    }

    try {
      setAddingToMonitoring((prev) => new Set(prev).add(actionId));

      const response = await fetch(`/api/project/${projectId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionIds: [actionId],
          studentName: user.username,
          studentId: user.studentId,
          calculatedReduction: Math.round(calculatedReduction * 100) / 100, // Round to 2 decimal places
          actionType,
          categoryData: {
            categoryId: selectedCategory,
            categoryName: selectedEmission.name,
            categoryPercentage: selectedEmission.totalPercentage,
            subcategoryData: selectedEmission.subcategories
              .filter(
                (_, index) =>
                  subcategoryValues[index] &&
                  subcategoryValues[index].trim() !== "",
              )
              .map((sub) => ({
                id: sub.id,
                name: sub.name,
                value:
                  subcategoryValues[
                    selectedEmission.subcategories.indexOf(sub)
                  ],
                percentage: sub.SubcategoryTotalPercentage,
              })),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to add action to monitoring",
        );
      }

      const result = await response.json();
      console.log("Successfully added action to monitoring:", result);

      // Show success toast notification
      const actionTitle =
        actions.find((a) => a.id === actionId)?.title || "Action";
      showToast(
        "success",
        "Action Added Successfully!",
        `"${actionTitle}" has been added to your monitoring screen.`,
        4000,
      );
    } catch (error) {
      console.error("Error adding action to monitoring:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showToast(
        "error",
        "Failed to Add Action",
        `Could not add action to monitoring: ${errorMessage}`,
        6000,
      );
    } finally {
      setAddingToMonitoring((prev) => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  };

  return (
    <div className="bg-gray-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-8"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
            <p className="text-gray-400">
              {t("hello")} {user?.username}, {t("subtitle")}
            </p>
          </div>

          {categoriesLoading || actionsLoading ? (
            <div className="card mb-8">
              <h3 className="text-2xl font-bold">
                {t("currentEmissionsTitle")}
              </h3>
              <div className="flex items-center justify-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
                <span className="ml-2">
                  {categoriesLoading && actionsLoading
                    ? "Loading categories and actions..."
                    : categoriesLoading
                      ? t("loadingCategories") ||
                        "Loading emission categories..."
                      : "Loading action templates..."}
                </span>
              </div>
            </div>
          ) : categoriesError || actionsError ? (
            <div className="card mb-8">
              <h3 className="text-2xl font-bold">
                {t("currentEmissionsTitle")}
              </h3>
              <div className="alert alert-error">
                <span>
                  {categoriesError ||
                    actionsError ||
                    "Error loading data. Please try again."}
                </span>
              </div>
            </div>
          ) : (
            <EmissionsInput
              emissions={emissions}
              setEmissions={handleEmissionChange}
              handleCalculateEmissions={handleCalculateEmissions}
            />
          )}

          {showSubcategoryForm && (
            <SubcategoryForm
              emissions={emissions}
              activeEmissionCategories={activeEmissionCategories}
              selectedCategory={selectedCategory}
              subcategoryValues={subcategoryValues}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                // Initialize subcategory values based on the selected category's subcategories
                const selectedEmission = emissions.find(
                  (e) => e.category === cat,
                );
                if (selectedEmission) {
                  setSubcategoryValues(
                    new Array(selectedEmission.subcategories.length).fill(""),
                  );

                  // Show actions for the selected category immediately
                  // Filter actions by both database category ID and legacy category
                  const categoryActions = actions.filter(
                    (a) =>
                      a.category === cat || // Database category ID match
                      a.category === selectedEmission.legacyCategory, // Legacy category match
                  );
                  console.log(
                    `Category "${selectedEmission.name}" selected, showing ${categoryActions.length} actions`,
                  );
                  console.log(
                    "Action categories found:",
                    categoryActions.map((a) => a.category),
                  );
                  setFilteredActions(categoryActions);
                }
              }}
              onSubcategoryChange={(i, v) => {
                const copy = [...subcategoryValues];
                copy[i] = v;
                setSubcategoryValues(copy);
              }}
              onCalculate={handleCalculateSubcategories}
              t={t}
            />
          )}

          {showSubcategoryForm && (
            <>
              {/* Debug: Rendering ActionsSection */}
              <ActionsSection
                filteredActions={filteredActions}
                schoolGoal={schoolGoal}
                selectedActions={selectedActions}
                onActionSelect={handleActionSelect}
                onAddActionClick={() =>
                  (
                    document.getElementById(
                      "custom_action",
                    ) as HTMLDialogElement
                  )?.showModal()
                }
                showAddButton={!!user && !user.passcode} // Show custom action button for teachers/admins
                onAddToMonitoring={handleAddToMonitoring}
                showMonitoringButton={!!user && !!user.passcode} // Show monitoring button for students with passcode
                addingToMonitoring={addingToMonitoring}
                calculateDisplayReduction={calculateDisplayReduction}
                t={t}
              />
            </>
          )}

          {selectedActions.length > 0 && (
            <SelectedActionsSummary
              selectedActionsCount={selectedActions.length}
              totalReductionPercent={totalSelectedReduction}
              t={t}
            />
          )}
        </div>
      </motion.div>

      <AddActionModalWrapper
        onAddAction={(action) => setActions((prev) => [...prev, action])}
      />
    </div>
  );
};

export default StudentCalculator;
