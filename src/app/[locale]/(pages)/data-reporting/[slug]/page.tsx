"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useUser } from "@/context/UserContext";
import { useParams } from "next/navigation";
import { Action } from "@/types/Action";

import CategorySelection from "./CategorySelection";
import { SubcategorySelection } from "./SubcategorySelection";
import { ActionsSection } from "./ActionsSection";
import { AddActionModalWrapper } from "./AddActionModalWrapper";

import {
  useSchoolEmissionData,
  ProcessedSchoolEmissionCategory,
} from "@/hooks/useSchoolEmissionData";
import { useActions } from "@/hooks/useActions";
import { useToast } from "@/context/ToastContext";

interface CustomAction extends Action {
  selected: boolean;
}

const StudentCalculator: React.FC = () => {
  const t = useTranslations("StudentCalculator");
  const { user } = useUser();
  const { showToast } = useToast();
  const params = useParams();

  // Get project ID from URL parameter (slug) or user passcode for students
  const projectId = (params.slug as string) || user?.passcode || "";

  // Use school emission data instead of global categories
  const {
    categories: schoolCategories,
    loading: categoriesLoading,
    error: categoriesError,
    school,
  } = useSchoolEmissionData(projectId);

  const {
    actions: actionTemplates,
    loading: actionsLoading,
    error: actionsError,
  } = useActions();

  // State management for the new flow
  const [currentStep, setCurrentStep] = useState<
    "category" | "subcategory" | "actions"
  >("category");
  const [selectedCategory, setSelectedCategory] =
    useState<ProcessedSchoolEmissionCategory | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    [],
  );
  const [actions, setActions] = useState<CustomAction[]>([]);
  const [filteredActions, setFilteredActions] = useState<Action[]>([]);

  // Handler functions for the new flow
  const handleCategorySelect = (categoryId: string) => {
    const category = schoolCategories.find(
      (cat) => cat.category === categoryId,
    );
    if (category) {
      setSelectedCategory(category);
      setSelectedSubcategories([]);
      setCurrentStep("subcategory");
    }
  };

  const handleSubcategoryToggle = (subcategoryId: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId],
    );
  };

  const handleProceedToActions = () => {
    if (!selectedCategory || selectedSubcategories.length === 0) return;

    // Filter actions based on selected category
    const categoryActions = actions.filter(
      (action) =>
        action.category === selectedCategory.category || // Database category ID match
        action.category === selectedCategory.legacyCategory, // Legacy category match
    );

    console.log(
      `Found ${categoryActions.length} actions for category "${selectedCategory.name}"`,
      categoryActions.map((a) => a.title),
    );

    setFilteredActions(categoryActions);
    setCurrentStep("actions");
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategories([]);
    setCurrentStep("category");
  };

  const calculateDisplayReduction = (action: CustomAction): number => {
    const actionType = action.type || "Direct";

    // For Direct actions, always return original reduction
    if (actionType === "Direct") {
      return action.reduction;
    }

    // For Indirect actions, use school-specific category and subcategory data
    if (
      actionType === "Indirect" &&
      selectedCategory &&
      selectedSubcategories.length > 0
    ) {
      // New calculation formula: y * b * a = x
      // where:
      // y = action reduction percentage (from admin)
      // a = category percentage of total emissions
      // b = average subcategory percentage of category emissions
      // x = total emissions reduction percentage

      const categoryPercentage = selectedCategory.percentage / 100; // Convert to decimal (a)

      // Get selected subcategory percentages and calculate average
      const selectedSubcategoryData = selectedCategory.subcategories.filter(
        (sub) => selectedSubcategories.includes(sub.id),
      );

      if (selectedSubcategoryData.length > 0 && selectedCategory.amount > 0) {
        const avgSubcategoryPercentage =
          selectedSubcategoryData.reduce(
            (sum, sub) => sum + sub.percentage,
            0,
          ) /
          selectedSubcategoryData.length /
          100; // Convert to decimal (b)

        const actionReductionPercentage = action.reduction / 100; // Convert to decimal (y)

        // Formula: x = y * b * a
        const totalEmissionReduction =
          actionReductionPercentage *
          avgSubcategoryPercentage *
          categoryPercentage;
        const calculatedValue = totalEmissionReduction * 100; // Convert back to percentage

        console.log(
          `Dynamic calculation for "${action.title}" using formula y*b*a=x:`,
          {
            actionReduction_y: action.reduction + "%",
            categoryPercentage_a: selectedCategory.percentage + "%",
            avgSubcategoryPercentage_b:
              (avgSubcategoryPercentage * 100).toFixed(2) + "%",
            calculatedTotalReduction_x: calculatedValue.toFixed(4) + "%",
            formula: `${action.reduction}% × ${(avgSubcategoryPercentage * 100).toFixed(2)}% × ${selectedCategory.percentage}% = ${calculatedValue.toFixed(4)}%`,
            categoryAmount: selectedCategory.amount + " kgCO2e",
            selectedSubcategories: selectedSubcategoryData.map(
              (s) =>
                `${s.name}: ${s.amount} kgCO2e (${s.percentage.toFixed(1)}%)`,
            ),
          },
        );

        return calculatedValue;
      } else {
        // Show warning if calculation can't be performed
        console.warn(
          `Cannot calculate dynamic reduction for "${action.title}": missing emission amounts. Category amount: ${selectedCategory.amount}, Selected subcategories: ${selectedSubcategoryData.length}`,
        );
      }
    }

    // Return original reduction if no dynamic calculation is possible
    return action.reduction;
  };

  // Handle custom action submission
  const handleAddCustomAction = async (action: CustomAction) => {
    try {
      // Submit as custom action to project
      const response = await fetch(`/api/project/${projectId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customActionData: {
            title: action.title,
            description: action.description,
            category: action.category,
            subcategory: action.subcategory || "",
            reduction: action.reduction,
            effort: action.effort,
            manager: action.manager,
            nature: action.nature,
            objectives: action.objectives,
            keyContacts: action.keyContacts,
            steps: action.steps,
            calendar: action.calendar,
            indicators: action.indicators,
            monitoring: action.monitoring,
            performance: action.performance,
            timeline: action.timeline || 1,
            type: action.type || "Direct",
          },
          studentName: user?.username || "",
          studentId: user?.studentId || "",
          calculatedReduction: action.reduction,
          actionType: action.type || "Direct",
          categoryData: {
            categoryId: action.category,
            categoryName: action.category,
          },
          isTeacherAction: user?.role === "teacher" || user?.role === "admin",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create custom action");
      }

      const result = await response.json();
      console.log("Successfully created custom action:", result);

      showToast(
        "success",
        "Action Submitted!",
        `"${action.title}" has been submitted for teacher approval.`,
        4000,
      );

      // Add to local state for immediate UI update
      setActions((prev) => [...prev, action]);
    } catch (error) {
      console.error("Error creating custom action:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showToast(
        "error",
        "Failed to Create Custom Action",
        `Could not create custom action: ${errorMessage}`,
        6000,
      );
    }
  };

  // Set actions from the hook when action templates are loaded
  useEffect(() => {
    console.log("Loaded action templates:", actionTemplates.length, "actions");
    // Convert Action[] to CustomAction[] by adding selected property
    const customActions: CustomAction[] = actionTemplates.map((action) => ({
      ...action,
      selected: false,
    }));
    setActions(customActions);
  }, [actionTemplates]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto px-6 py-8 container"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-bold text-3xl">{t("title")}</h1>
            <p className="text-gray-400">
              {t("hello")} {user?.username}, {t("subtitle")}
            </p>
            {school && (
              <p className="mt-2 text-gray-500 text-sm">
                School: {school.name} | Goal: {school.goal}% by{" "}
                {school.deadlineYear}
              </p>
            )}
          </div>

          {/* Loading State */}
          {categoriesLoading || actionsLoading ? (
            <div className="mb-8 card">
              <div className="flex justify-center items-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
                <span className="ml-2">
                  {categoriesLoading && actionsLoading
                    ? "Loading school data and actions..."
                    : categoriesLoading
                      ? "Loading school emission data..."
                      : "Loading action templates..."}
                </span>
              </div>
            </div>
          ) : categoriesError || actionsError ? (
            /* Error State */
            <div className="mb-8 card">
              <div className="alert alert-error">
                <span>
                  {categoriesError ||
                    actionsError ||
                    "Error loading data. Please try again."}
                </span>
              </div>
            </div>
          ) : (
            /* Main Content based on current step */
            <>
              {/* Validation Message */}
              {schoolCategories.length > 0 &&
                schoolCategories.every((cat) => cat.amount === 0) && (
                  <div className="bg-amber-50 mb-6 p-4 border border-amber-200 rounded-lg">
                    <h3 className="mb-2 font-semibold text-amber-800">
                      Emission Data Required
                    </h3>
                    <p className="text-amber-700 text-sm">
                      Your teacher needs to set up emission amounts for your
                      school before you can calculate action impacts. You can
                      still select categories and actions, but precise
                      calculations won&apos;t be available until emission data
                      is provided.
                    </p>
                  </div>
                )}

              {currentStep === "category" && (
                <CategorySelection
                  categories={schoolCategories}
                  onCategorySelect={handleCategorySelect}
                  selectedCategory={selectedCategory?.category || null}
                />
              )}

              {currentStep === "subcategory" && selectedCategory && (
                <SubcategorySelection
                  category={selectedCategory}
                  selectedSubcategories={selectedSubcategories}
                  onSubcategoryToggle={handleSubcategoryToggle}
                  onProceed={handleProceedToActions}
                  onBack={handleBackToCategories}
                  t={t}
                />
              )}

              {currentStep === "actions" && selectedCategory && (
                <>
                  {/* Breadcrumb */}
                  <div className="flex items-center space-x-2 mb-6 text-gray-600 text-sm">
                    <button
                      onClick={() => setCurrentStep("category")}
                      className="hover:text-primary"
                    >
                      Categories
                    </button>
                    <span>/</span>
                    <button
                      onClick={() => setCurrentStep("subcategory")}
                      className="hover:text-primary"
                    >
                      {selectedCategory.name}
                    </button>
                    <span>/</span>
                    <span className="text-gray-900">Actions</span>
                  </div>

                  <ActionsSection
                    filteredActions={filteredActions}
                    schoolGoal={school?.goal || 50}
                    selectedActions={[]} // Remove selection feature for new flow
                    onActionSelect={() => {}} // No action selection in new flow
                    onAddActionClick={() =>
                      (
                        document.getElementById(
                          "custom_action",
                        ) as HTMLDialogElement
                      )?.showModal()
                    }
                    showAddButton={!!user} // Show custom action button for both teachers and students
                    calculateDisplayReduction={(action: Action) => {
                      const customAction: CustomAction = {
                        ...action,
                        selected: false,
                      };
                      return calculateDisplayReduction(customAction);
                    }}
                    projectId={projectId}
                    // Convert schoolCategories to the format expected by the modal
                    categories={schoolCategories.map((cat) => ({
                      value: cat.category,
                      label: cat.name,
                    }))}
                    // Convert subcategories to the format expected by the modal
                    subcategoryOptions={schoolCategories.flatMap((cat) =>
                      cat.subcategories.map((sub) => ({
                        value: sub.id,
                        label: sub.name,
                        categoryId: cat.category, // Include category ID for filtering
                      })),
                    )}
                    t={t}
                  />
                </>
              )}
            </>
          )}
        </div>
      </motion.div>

      <AddActionModalWrapper
        onAddAction={handleAddCustomAction}
        categories={schoolCategories.map((cat) => ({
          value: cat.category,
          label: cat.name,
        }))}
        subcategoryOptions={schoolCategories.flatMap((cat) =>
          cat.subcategories.map((sub) => ({
            value: sub.id,
            label: sub.name,
            categoryId: cat.category,
          })),
        )}
      />
    </div>
  );
};

export default StudentCalculator;
