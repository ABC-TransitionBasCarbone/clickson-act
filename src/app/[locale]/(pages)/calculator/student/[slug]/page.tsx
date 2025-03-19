"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Car, Zap, Recycle } from "lucide-react";
import { useTranslations } from "next-intl";
import CustomActionModal from "./CustomActionModal";
import SchoolGoalCard from "@/components/SchoolGoalCard";
import ActionList from "./ActionList";
import { Action } from "@/types/Action";
import EmissionsInput from "./EmissionsInput";

const StudentCalculator: React.FC = () => {
  const t = useTranslations("StudentCalculator");

  const [emissions, setEmissions] = useState([
    { label: t("emissionsTitle1"), value: "" },
    { label: t("emissionsTitle2"), value: "" },
    { label: t("emissionsTitle3"), value: "" },
    { label: t("emissionsTitle4"), value: "" },
    { label: t("emissionsTitle5"), value: "" },
  ]);

  const handleEmissionChange = (index: number, value: string) => {
    setEmissions((prev) => {
      const updated = [...prev];
      updated[index].value = value;
      return updated;
    });
  };

  const [actions, setActions] = useState<Action[]>([
    {
      id: "1",
      title: t("actions.switchToLED.title"),
      description: t("actions.switchToLED.description"),
      reduction: 15,
      icon: (<Zap className="h-6 w-6" />) as React.ReactNode,
      selected: false,
    },
    {
      id: "2",
      title: t("actions.startComposting.title"),
      description: t("actions.startComposting.description"),
      reduction: 10,
      icon: (<Leaf className="h-6 w-6" />) as React.ReactNode,
      selected: false,
    },
    {
      id: "3",
      title: t("actions.reduceCarUsage.title"),
      description: t("actions.reduceCarUsage.description"),
      reduction: 20,
      icon: (<Car className="h-6 w-6" />) as React.ReactNode,
      selected: false,
    },
    {
      id: "4",
      title: t("actions.implementRecycling.title"),
      description: t("actions.implementRecycling.description"),
      reduction: 12,
      icon: (<Recycle className="h-6 w-6" />) as React.ReactNode,
      selected: false,
    },
  ]);

  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const handleActionSelect = (actionId: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId],
    );
  };

  const totalReduction = selectedActions.reduce((total, actionId) => {
    const action = actions.find((a) => a.id === actionId);
    return total + (action?.reduction || 0);
  }, 0);

  const CATEGORIES = [
    { value: "energy", label: "Energy", icon: <Zap className="h-4 w-4" /> },
    { value: "waste", label: "Waste", icon: <Recycle className="h-4 w-4" /> },
    {
      value: "transport",
      label: "Transport",
      icon: <Car className="h-4 w-4" />,
    },
    { value: "nature", label: "Nature", icon: <Leaf className="h-4 w-4" /> },
  ];

  const openModal = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement | null;
    if (modal) modal.showModal();
  };

  const schoolGoal = 90;

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
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-gray-400">{t("subtitle")}</p>
          </div>

          <EmissionsInput
            emissions={emissions}
            setEmissions={handleEmissionChange}
          />

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("availableActions")}</h2>
            <button
              className="btn btn-soft-primary"
              onClick={() => openModal("custom_action")}
            >
              Add Action
            </button>
          </div>

          <div className="mb-8 grid gap-4">
            <ActionList
              actions={actions}
              schoolGoal={schoolGoal}
              selectedActions={selectedActions}
              onActionSelect={handleActionSelect}
            />
          </div>

          <div className="mb-8">
            {selectedActions.length > 0 && (
              <div className="bg-primary/10! border-primary-200! card">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {t("totalReductionTitle")}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {t("totalReductionDescription", {
                          count: selectedActions.length,
                        })}
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      -{Math.ceil((totalReduction / schoolGoal) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* School Goal Card */}
          <SchoolGoalCard
            schoolGoal={schoolGoal}
            currentReduction={totalReduction}
            totalReduction={30}
          />
        </div>
      </motion.div>

      <CustomActionModal
        onAddAction={(action) =>
          setActions((prev) => [
            ...prev,
            {
              id: action.id,
              title: action.title,
              description: action.description,
              reduction: parseInt(action.reduction),
              icon: action.icon,
              selected: false,
            },
          ])
        }
        categories={CATEGORIES}
      />
    </div>
  );
};

export default StudentCalculator;
