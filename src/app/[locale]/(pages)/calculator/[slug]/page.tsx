"use client";
import React, { useState } from "react";
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
import { Car, Leaf, Recycle, Zap } from "lucide-react";

type Emission = {
  label: string;
  value: string;
  category: string;
  subcategories: { subcategoryTitle: string; value: string }[];
};

const StudentCalculator: React.FC = () => {
  const t = useTranslations("StudentCalculator");
  const { user } = useUser();

  const schoolGoal = 70;

  const [emissions, setEmissions] = useState<Emission[]>([
    {
      label: t("emissionsTitle1"),
      value: "",
      category: "energy",
      subcategories: [
        { subcategoryTitle: t("subcat1_title_energy"), value: "" },
        { subcategoryTitle: t("subcat2_title_energy"), value: "" },
        { subcategoryTitle: t("subcat3_title_energy"), value: "" },
      ],
    },
    {
      label: t("emissionsTitle2"),
      value: "",
      category: "waste",
      subcategories: [
        { subcategoryTitle: t("subcat1_title_waste"), value: "" },
        { subcategoryTitle: t("subcat2_title_waste"), value: "" },
        { subcategoryTitle: t("subcat3_title_waste"), value: "" },
      ],
    },
    {
      label: t("emissionsTitle3"),
      value: "",
      category: "transport",
      subcategories: [
        { subcategoryTitle: t("subcat1_title_transport"), value: "" },
        { subcategoryTitle: t("subcat2_title_transport"), value: "" },
        { subcategoryTitle: t("subcat3_title_transport"), value: "" },
      ],
    },
    {
      label: t("emissionsTitle4"),
      value: "",
      category: "nature",
      subcategories: [
        { subcategoryTitle: t("subcat1_title_nature"), value: "" },
        { subcategoryTitle: t("subcat2_title_nature"), value: "" },
        { subcategoryTitle: t("subcat3_title_nature"), value: "" },
      ],
    },
    {
      label: t("emissionsTitle5"),
      value: "",
      category: "energy1",
      subcategories: [
        { subcategoryTitle: t("subcat1_title_energy"), value: "" },
        { subcategoryTitle: t("subcat2_title_energy"), value: "" },
        { subcategoryTitle: t("subcat3_title_energy"), value: "" },
      ],
    },
  ]);

  const [actions, setActions] = useState<Action[]>([
    {
      id: "1",
      title: t("actions.switchToLED.title"),
      description: t("actions.switchToLED.description"),
      reduction: 15,
      icon: (<Zap className="h-6 w-6" />) as React.ReactNode,
      category: "energy",
      selected: false,
    },
    {
      id: "2",
      title: t("actions.startComposting.title"),
      description: t("actions.startComposting.description"),
      reduction: 10,
      icon: (<Leaf className="h-6 w-6" />) as React.ReactNode,
      category: "nature",
      selected: false,
    },
    {
      id: "3",
      title: t("actions.reduceCarUsage.title"),
      description: t("actions.reduceCarUsage.description"),
      reduction: 20,
      category: "transport",
      icon: (<Car className="h-6 w-6" />) as React.ReactNode,
      selected: false,
    },
    {
      id: "4",
      title: t("actions.implementRecycling.title"),
      description: t("actions.implementRecycling.description"),
      reduction: 12,
      icon: (<Recycle className="h-6 w-6" />) as React.ReactNode,
      category: "waste",
      selected: false,
    },
  ]);

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
            schoolGoal={schoolGoal}
            currentReduction={totalReduction}
            totalReduction={30}
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
