"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2, Plus, Languages } from "lucide-react";
import {
  TranslatableAction,
  ActionTranslation,
  getTranslatedAction,
  createEmptyTranslations,
} from "../../types/TranslatableAction";
import {
  TranslatableCategory,
  EmissionCategory,
  getTranslatedCategory,
  getTranslatedSubcategory,
} from "../../types/EmissionCategory";
import AdminModal from "./AdminModal";
import { authenticatedFetch } from "../../lib/auth-utils";
import { useTranslations } from "next-intl";
import { locales } from "@/i18n/config";

const ActionsManager: React.FC = () => {
  const t = useTranslations("ActionsManager");
  const tAction = useTranslations("Action");

  const [actions, setActions] = useState<TranslatableAction[]>([]);
  const [categories, setCategories] = useState<
    (TranslatableCategory | EmissionCategory)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [editingAction, setEditingAction] = useState<TranslatableAction | null>(
    null,
  );
  const [selectedLocale, setSelectedLocale] = useState<string>(locales[0]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [newAction, setNewAction] = useState<{
    category: string;
    type: "Direct" | "Indirect";
    reduction: number;
    effort: string;
    // Optional extended fields
    subcategory: string;
    timeline: number;
    translations: { [locale: string]: ActionTranslation };
  }>({
    category: "",
    type: "Direct",
    reduction: 0,
    effort: "Medium",
    subcategory: "",
    timeline: 1,
    translations: {},
  });

  // Initialize translations for all locales
  useEffect(() => {
    const initialTranslations = createEmptyTranslations(locales);
    setNewAction((prev) => ({ ...prev, translations: initialTranslations }));
  }, []);

  // Fetch actions
  const fetchActions = async () => {
    try {
      const response = await authenticatedFetch("/api/actions");
      const data = await response.json();
      if (data.success) {
        setActions(data.actions);
      } else {
        console.error("Error fetching actions:", data.error);
      }
    } catch (error) {
      console.error("Error fetching actions:", error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await authenticatedFetch("/api/emission-categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        console.error("Error fetching categories:", data.error);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchActions(), fetchCategories()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCreateAction = async () => {
    setSaveLoading(true);
    try {
      const response = await authenticatedFetch("/api/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAction),
      });

      const data = await response.json();
      if (data.success) {
        setActions((prev) => [...prev, data.action]);
        const modal = document.getElementById(
          "create-action-modal",
        ) as HTMLDialogElement;
        if (modal) modal.close();
        resetNewAction();
      } else {
        console.error("Error creating action:", data.error);
      }
    } catch (error) {
      console.error("Error creating action:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateAction = async () => {
    if (!editingAction) return;

    setSaveLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/actions/${editingAction.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingAction),
        },
      );

      const data = await response.json();
      if (data.success) {
        setActions((prev) =>
          prev.map((a) => (a.id === editingAction.id ? editingAction : a)),
        );
        const modal = document.getElementById(
          "edit-action-modal",
        ) as HTMLDialogElement;
        if (modal) modal.close();
        setEditingAction(null);
      } else {
        console.error("Error updating action:", data.error);
      }
    } catch (error) {
      console.error("Error updating action:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAction = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    setDeleteLoading(id);
    try {
      const response = await authenticatedFetch(`/api/actions/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setActions((prev) => prev.filter((a) => a.id !== id));
      } else {
        console.error("Error deleting action:", data.error);
      }
    } catch (error) {
      console.error("Error deleting action:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const resetNewAction = () => {
    const initialTranslations = createEmptyTranslations(locales);

    setNewAction({
      category: "",
      type: "Direct",
      reduction: 0,
      effort: "Medium",
      subcategory: "",
      timeline: 1,
      translations: initialTranslations,
    });
  };

  const updateNewActionTranslation = (
    locale: string,
    field: keyof ActionTranslation,
    value: string,
  ) => {
    setNewAction((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: {
          ...prev.translations[locale],
          [field]: value,
        },
      },
    }));
  };

  const updateEditingActionTranslation = (
    locale: string,
    field: keyof ActionTranslation,
    value: string,
  ) => {
    if (!editingAction) return;

    setEditingAction({
      ...editingAction,
      translations: {
        ...editingAction.translations,
        [locale]: {
          ...editingAction.translations[locale],
          [field]: value,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Get category options from fetched categories
  const categoryOptions = categories.map((category) => {
    const translatedCategory = getTranslatedCategory(
      category,
      selectedLocale,
      locales,
    );
    return {
      id: category.id,
      name: translatedCategory.name,
    };
  });
  const effortOptions = ["Easy", "Medium", "Hard"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl">{t("title")}</h2>
        <button
          onClick={() => {
            resetNewAction();
            const modal = document.getElementById(
              "create-action-modal",
            ) as HTMLDialogElement;
            if (modal) modal.showModal();
          }}
          className="flex items-center gap-2 btn btn-primary"
        >
          <Plus size={20} />
          {t("addAction")}
        </button>
      </div>

      <div className="space-y-4">
        {actions.map((action) => {
          const translatedAction = getTranslatedAction(
            action,
            selectedLocale,
            locales,
          );

          // Debug logging for action translation issues
          if (
            !translatedAction.title ||
            translatedAction.title === "Untitled Action"
          ) {
            console.log("Action with missing/fallback title:", {
              actionId: action.id,
              selectedLocale,
              availableTranslations: action.translations
                ? Object.keys(action.translations)
                : "No translations",
              translationData: action.translations,
              resultTitle: translatedAction.title,
            });
          }

          return (
            <div key={action.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {translatedAction.title ||
                        `[Action ID: ${action.id.substring(0, 8)}...]`}
                    </h3>
                    <span
                      className={`badge ${
                        action.status === "Available"
                          ? "badge-success"
                          : action.status === "Selected"
                            ? "badge-warning"
                            : "badge-info"
                      }`}
                    >
                      {tAction(action.status?.toLowerCase() || "available")}
                    </span>
                  </div>
                  <p className="mb-2 text-gray-600">
                    {translatedAction.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-gray-500 text-sm">
                    <span className="badge-outline badge">
                      {(() => {
                        const category = categories.find(
                          (cat) => cat.id === action.category,
                        );
                        if (category) {
                          const translatedCategory = getTranslatedCategory(
                            category,
                            selectedLocale,
                            locales,
                          );
                          return translatedCategory.name;
                        }
                        return action.category || "Unknown Category";
                      })()}
                    </span>
                    <span
                      className={`badge ${action.type === "Direct" ? "badge-info" : "badge-secondary"}`}
                    >
                      {action.type}
                    </span>
                    <span>Reduction: {action.reduction}%</span>
                    <span>Effort: {tAction(action.effort)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingAction(action);
                      const modal = document.getElementById(
                        "edit-action-modal",
                      ) as HTMLDialogElement;
                      if (modal) modal.showModal();
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteAction(action.id)}
                    className="text-red-600 hover:text-red-800"
                    disabled={deleteLoading === action.id}
                  >
                    {deleteLoading === action.id ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Locale Selector */}
      <div className="right-4 bottom-4 fixed">
        <div className="dropdown-top dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-circle btn-primary"
          >
            <Languages size={20} />
          </div>
          <ul
            tabIndex={0}
            className="z-[1] bg-base-100 shadow p-2 rounded-box w-32 dropdown-content menu"
          >
            {locales.map((locale) => (
              <li key={locale}>
                <button
                  onClick={() => setSelectedLocale(locale)}
                  className={selectedLocale === locale ? "active" : ""}
                >
                  {locale.toUpperCase()}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Create Action Modal */}
      <AdminModal
        id="create-action-modal"
        title={t("createAction")}
        onClose={() => {
          const modal = document.getElementById(
            "create-action-modal",
          ) as HTMLDialogElement;
          if (modal) modal.close();
        }}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Basic Fields */}
          <div className="gap-4 grid grid-cols-2">
            <div>
              <label className="block mb-1">{tAction("category")}</label>
              <select
                value={newAction.category}
                onChange={(e) => {
                  setNewAction({
                    ...newAction,
                    category: e.target.value,
                    subcategory: "", // Reset subcategory when category changes
                  });
                }}
                className="w-full select-bordered select"
              >
                <option value="">{tAction("selectCategory")}</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">{tAction("subcategory")}</label>
              <select
                value={newAction.subcategory}
                onChange={(e) =>
                  setNewAction({ ...newAction, subcategory: e.target.value })
                }
                className="w-full select-bordered select"
                disabled={!newAction.category}
              >
                <option value="">{tAction("selectSubcategory")}</option>
                {newAction.category &&
                  categories
                    .find((cat) => cat.id === newAction.category)
                    ?.subcategories?.map((subcat) => {
                      const translatedSubcat = getTranslatedSubcategory(
                        subcat,
                        selectedLocale,
                        locales,
                      );
                      return (
                        <option key={subcat.id} value={subcat.id}>
                          {translatedSubcat.name}
                        </option>
                      );
                    })}
              </select>
            </div>
          </div>

          <div className="gap-4 grid grid-cols-2">
            <div>
              <label className="block mb-1">{t("typeOfImpact")}</label>
              <select
                value={newAction.type}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    type: e.target.value as "Direct" | "Indirect",
                  })
                }
                className="w-full select-bordered select"
              >
                <option value="Direct">{t("typeDirect")}</option>
                <option value="Indirect">{t("typeIndirect")}</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">{tAction("effort")}</label>
              <select
                value={newAction.effort}
                onChange={(e) =>
                  setNewAction({ ...newAction, effort: e.target.value })
                }
                className="w-full select-bordered select"
              >
                {effortOptions.map((effort) => (
                  <option key={effort} value={effort}>
                    {tAction(effort)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="gap-4 grid grid-cols-2">
            <div>
              <label className="block mb-1">
                {tAction("estimatedReduction")}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newAction.reduction}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    reduction: parseFloat(e.target.value) || 0,
                  })
                }
                className="input-bordered w-full input"
              />
            </div>
            <div>
              <label className="block mb-1">{tAction("timeline")}</label>
              <input
                type="number"
                min="1"
                max="50"
                value={newAction.timeline}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    timeline: parseInt(e.target.value) || 1,
                  })
                }
                className="input-bordered w-full input"
                placeholder="Number of years"
              />
            </div>
          </div>

          {/* Translation Fields */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-4">
              <Languages size={16} />
              <span className="font-medium">{t("translations")}</span>
            </div>

            <div className="mb-4 tabs-bordered tabs">
              {locales.map((locale) => (
                <button
                  key={locale}
                  className={`tab ${selectedLocale === locale ? "tab-active" : ""}`}
                  onClick={() => setSelectedLocale(locale)}
                >
                  {locale.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1">
                  {tAction("actionTitle")} ({selectedLocale.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={newAction.translations[selectedLocale]?.title || ""}
                  onChange={(e) =>
                    updateNewActionTranslation(
                      selectedLocale,
                      "title",
                      e.target.value,
                    )
                  }
                  className="input-bordered w-full input"
                />
              </div>
              <div>
                <label className="block mb-1">
                  {tAction("description")} ({selectedLocale.toUpperCase()})
                </label>
                <textarea
                  value={
                    newAction.translations[selectedLocale]?.description || ""
                  }
                  onChange={(e) =>
                    updateNewActionTranslation(
                      selectedLocale,
                      "description",
                      e.target.value,
                    )
                  }
                  className="textarea-bordered w-full textarea"
                  rows={3}
                />
              </div>
              <div>
                <label className="block mb-1">
                  {tAction("objectives")} ({selectedLocale.toUpperCase()})
                </label>
                <textarea
                  value={
                    newAction.translations[selectedLocale]?.objectives || ""
                  }
                  onChange={(e) =>
                    updateNewActionTranslation(
                      selectedLocale,
                      "objectives",
                      e.target.value,
                    )
                  }
                  className="textarea-bordered w-full textarea"
                  rows={2}
                />
              </div>
              <div>
                <label className="block mb-1">
                  {tAction("steps")} ({selectedLocale.toUpperCase()})
                </label>
                <textarea
                  value={newAction.translations[selectedLocale]?.steps || ""}
                  onChange={(e) =>
                    updateNewActionTranslation(
                      selectedLocale,
                      "steps",
                      e.target.value,
                    )
                  }
                  className="textarea-bordered w-full textarea"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const modal = document.getElementById(
                "create-action-modal",
              ) as HTMLDialogElement;
              if (modal) modal.close();
            }}
          >
            {tAction("cancel")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateAction}
            disabled={
              saveLoading ||
              !newAction.category ||
              !newAction.type ||
              !newAction.translations[locales[0]]?.title
            }
          >
            {saveLoading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            {saveLoading ? "Creating..." : t("createAction")}
          </button>
        </div>
      </AdminModal>

      {/* Edit Action Modal */}
      {editingAction && (
        <AdminModal
          id="edit-action-modal"
          title={t("editAction")}
          onClose={() => {
            const modal = document.getElementById(
              "edit-action-modal",
            ) as HTMLDialogElement;
            if (modal) modal.close();
          }}
        >
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Basic Fields */}
            <div className="gap-4 grid grid-cols-2">
              <div>
                <label className="block mb-1">{tAction("category")}</label>
                <select
                  value={editingAction.category}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      category: e.target.value,
                      subcategory: "", // Reset subcategory when category changes
                    })
                  }
                  className="w-full select-bordered select"
                >
                  <option value="">{tAction("selectCategory")}</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">{tAction("subcategory")}</label>
                <select
                  value={editingAction.subcategory || ""}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      subcategory: e.target.value,
                    })
                  }
                  className="w-full select-bordered select"
                  disabled={!editingAction.category}
                >
                  <option value="">{tAction("selectSubcategory")}</option>
                  {editingAction.category &&
                    categories
                      .find((cat) => cat.id === editingAction.category)
                      ?.subcategories?.map((subcat) => {
                        const translatedSubcat = getTranslatedSubcategory(
                          subcat,
                          selectedLocale,
                          locales,
                        );
                        return (
                          <option key={subcat.id} value={subcat.id}>
                            {translatedSubcat.name}
                          </option>
                        );
                      })}
                </select>
              </div>
            </div>

            <div className="gap-4 grid grid-cols-2">
              <div>
                <label className="block mb-1">{t("typeOfImpact")}</label>
                <select
                  value={editingAction.type}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      type: e.target.value as "Direct" | "Indirect",
                    })
                  }
                  className="w-full select-bordered select"
                >
                  <option value="Direct">{t("typeDirect")}</option>
                  <option value="Indirect">{t("typeIndirect")}</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">{tAction("effort")}</label>
                <select
                  value={editingAction.effort}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      effort: e.target.value,
                    })
                  }
                  className="w-full select-bordered select"
                >
                  {effortOptions.map((effort) => (
                    <option key={effort} value={effort}>
                      {tAction(effort)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="gap-4 grid grid-cols-1">
              <div>
                <label className="block mb-1">
                  {tAction("estimatedReduction")}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingAction.reduction}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      reduction: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="input-bordered w-full input"
                />
              </div>
            </div>

            {/* Translation Fields */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Languages size={16} />
                <span className="font-medium">{t("translations")}</span>
              </div>

              <div className="mb-4 tabs-bordered tabs">
                {locales.map((locale) => (
                  <button
                    key={locale}
                    className={`tab ${selectedLocale === locale ? "tab-active" : ""}`}
                    onClick={() => setSelectedLocale(locale)}
                  >
                    {locale.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block mb-1">
                    {tAction("actionTitle")} ({selectedLocale.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={
                      editingAction.translations[selectedLocale]?.title || ""
                    }
                    onChange={(e) =>
                      updateEditingActionTranslation(
                        selectedLocale,
                        "title",
                        e.target.value,
                      )
                    }
                    className="input-bordered w-full input"
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    {tAction("description")} ({selectedLocale.toUpperCase()})
                  </label>
                  <textarea
                    value={
                      editingAction.translations[selectedLocale]?.description ||
                      ""
                    }
                    onChange={(e) =>
                      updateEditingActionTranslation(
                        selectedLocale,
                        "description",
                        e.target.value,
                      )
                    }
                    className="textarea-bordered w-full textarea"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    {tAction("objectives")} ({selectedLocale.toUpperCase()})
                  </label>
                  <textarea
                    value={
                      editingAction.translations[selectedLocale]?.objectives ||
                      ""
                    }
                    onChange={(e) =>
                      updateEditingActionTranslation(
                        selectedLocale,
                        "objectives",
                        e.target.value,
                      )
                    }
                    className="textarea-bordered w-full textarea"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    {tAction("steps")} ({selectedLocale.toUpperCase()})
                  </label>
                  <textarea
                    value={
                      editingAction.translations[selectedLocale]?.steps || ""
                    }
                    onChange={(e) =>
                      updateEditingActionTranslation(
                        selectedLocale,
                        "steps",
                        e.target.value,
                      )
                    }
                    className="textarea-bordered w-full textarea"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const modal = document.getElementById(
                  "edit-action-modal",
                ) as HTMLDialogElement;
                if (modal) modal.close();
              }}
            >
              {tAction("cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdateAction}
              disabled={saveLoading}
            >
              {saveLoading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {saveLoading ? "Saving..." : tAction("saveChanges")}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default ActionsManager;
