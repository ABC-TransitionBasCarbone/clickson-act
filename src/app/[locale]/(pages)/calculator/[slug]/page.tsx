"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import EmissionsInput from "./EmissionsInput";
import { useUser } from "@/context/UserContext";
import SchoolGoalCard from "@/components/SchoolGoalCard";
import { Action } from "@/types/Action";

import { SubcategoryForm } from "./SubcategoryForm";
import { ActionsSection } from "./ActionsSection";
import { SelectedActionsSummary } from "./SelectedActionsSummary";
import { AddActionModalWrapper } from "./AddActionModalWrapper";
import { EmissionType } from "@/types/Emission";

interface CustomAction extends Action {
  selected: boolean;
}

const StudentCalculator: React.FC = () => {
  const t = useTranslations("StudentCalculator");
  const { user } = useUser();

  const schoolGoal = 70;

  const [emissions, setEmissions] = useState<EmissionType[]>([]);

  const [actions, setActions] = useState<CustomAction[]>([]);

  const [filteredActions, setFilteredActions] = useState<Action[]>([]);
  const [activeEmissionCategories, setActiveEmissionCategories] = useState<
    string[]
  >([]);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategoryValues, setSubcategoryValues] = useState<string[]>([
    "",
    "",
    "",
  ]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const totalReduction = selectedActions.reduce((sum, id) => {
    const a = actions.find((x) => x.id === id);
    return sum + (a?.reduction || 0);
  }, 0);

  useEffect(() => {
    fetch("/data/actions.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch action file");
        return res.json();
      })
      .then((data) => {
        if (data) setActions(data);
      })
      .catch((error) => console.error("Error loading action file:", error));
  }, []);

  useEffect(() => {
    fetch("/data/emissions.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch emission file");
        return res.json();
      })
      .then((data) => {
        if (data) setEmissions(data);
      })
      .catch((error) => console.error("Error loading emission file:", error));
  }, []);

  const handleEmissionChange = (idx: number, val: string) => {
    setEmissions((prev) => {
      const copy = [...prev];
      copy[idx].value = val;
      return copy;
    });
  };

  const handleCalculateEmissions = () => {
    const cats: string[] = [];
    emissions.forEach((e) => {
      const n = parseFloat(e.value);
      if (!isNaN(n) && n > 0 && !cats.includes(e.category))
        cats.push(e.category);
    });
    setActiveEmissionCategories(cats);
    setFilteredActions(actions.filter((a) => cats.includes(a.category)));
    setShowSubcategoryForm(true);
    setSelectedCategory(null);
    setSubcategoryValues(["", "", ""]);
  };

  const handleCalculateSubcategories = () => {
    if (selectedCategory) {
      setFilteredActions(
        actions.filter((a) => a.category === selectedCategory),
      );
    }
  };

  const handleActionSelect = (actionId: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId],
    );
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

          <EmissionsInput
            emissions={emissions}
            setEmissions={handleEmissionChange}
            handleCalculateEmissions={handleCalculateEmissions}
          />

          {showSubcategoryForm && (
            <SubcategoryForm
              emissions={emissions}
              activeEmissionCategories={activeEmissionCategories}
              selectedCategory={selectedCategory}
              subcategoryValues={subcategoryValues}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setSubcategoryValues(["", "", ""]);
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

          <ActionsSection
            filteredActions={filteredActions}
            schoolGoal={schoolGoal}
            selectedActions={selectedActions}
            onActionSelect={handleActionSelect}
            onAddActionClick={() =>
              (
                document.getElementById("custom_action") as HTMLDialogElement
              )?.showModal()
            }
            showAddButton={showSubcategoryForm}
            t={t}
          />

          {selectedActions.length > 0 && (
            <SelectedActionsSummary
              selectedActionsCount={selectedActions.length}
              totalReductionPercent={Math.ceil(
                (totalReduction / schoolGoal) * 100,
              )}
              t={t}
            />
          )}

          <SchoolGoalCard
            schoolGoal={40}
            subGoal={25}
            subGoalYear="2028"
            finalGoalYear="2030"
            baseReductionPerYear={3}
            startYear={"2025"}
            selectedActionReductionPerYear={Math.ceil(
              (totalReduction / schoolGoal) * 100,
            )}
          />
        </div>
      </motion.div>

      <AddActionModalWrapper
        onAddAction={(action) => setActions((prev) => [...prev, action])}
      />
    </div>
  );
};

export default StudentCalculator;
