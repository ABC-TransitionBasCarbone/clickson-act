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
    type: "Fixed" | "Dynamic";
    reduction: number;
    effort: string;
    // Optional extended fields
    subcategory: string;
    timeline: number;
    translations: { [locale: string]: ActionTranslation };
  }>({
    category: "",
    type: "Fixed",
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
      type: "Fixed",
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
      <div className="flex items-center justify-center py-8">
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <button
          onClick={() => {
            resetNewAction();
            const modal = document.getElementById(
              "create-action-modal",
            ) as HTMLDialogElement;
            if (modal) modal.showModal();
          }}
          className="btn btn-primary flex items-center gap-2"
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
          return (
            <div key={action.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {translatedAction.title}
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
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="badge badge-outline">
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
                      className={`badge ${action.type === "Fixed" ? "badge-info" : "badge-secondary"}`}
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
      <div className="fixed right-4 bottom-4">
        <div className="dropdown dropdown-top dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-circle btn-primary"
          >
            <Languages size={20} />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow"
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
        <div className="max-h-96 space-y-4 overflow-y-auto">
          {/* Basic Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block">{tAction("category")}</label>
              <select
                value={newAction.category}
                onChange={(e) => {
                  setNewAction({
                    ...newAction,
                    category: e.target.value,
                    subcategory: "", // Reset subcategory when category changes
                  });
                }}
                className="select select-bordered w-full"
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
              <label className="mb-1 block">{tAction("subcategory")}</label>
              <select
                value={newAction.subcategory}
                onChange={(e) =>
                  setNewAction({ ...newAction, subcategory: e.target.value })
                }
                className="select select-bordered w-full"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block">{t("type")}</label>
              <select
                value={newAction.type}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    type: e.target.value as "Fixed" | "Dynamic",
                  })
                }
                className="select select-bordered w-full"
              >
                <option value="Fixed">{t("typeFixed")}</option>
                <option value="Dynamic">{t("typeDynamic")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block">{tAction("effort")}</label>
              <select
                value={newAction.effort}
                onChange={(e) =>
                  setNewAction({ ...newAction, effort: e.target.value })
                }
                className="select select-bordered w-full"
              >
                {effortOptions.map((effort) => (
                  <option key={effort} value={effort}>
                    {tAction(effort)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block">
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
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="mb-1 block">{tAction("timeline")}</label>
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
                className="input input-bordered w-full"
                placeholder="Number of years"
              />
            </div>
          </div>

          {/* Translation Fields */}
          <div className="border-t pt-4">
            <div className="mb-4 flex items-center gap-2">
              <Languages size={16} />
              <span className="font-medium">{t("translations")}</span>
            </div>

            <div className="tabs tabs-bordered mb-4">
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
                <label className="mb-1 block">
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
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="mb-1 block">
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
                  className="textarea textarea-bordered w-full"
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-1 block">
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
                  className="textarea textarea-bordered w-full"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-1 block">
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
                  className="textarea textarea-bordered w-full"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
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
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {/* Basic Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block">{tAction("category")}</label>
                <select
                  value={editingAction.category}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      category: e.target.value,
                      subcategory: "", // Reset subcategory when category changes
                    })
                  }
                  className="select select-bordered w-full"
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
                <label className="mb-1 block">{tAction("subcategory")}</label>
                <select
                  value={editingAction.subcategory || ""}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      subcategory: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block">{t("type")}</label>
                <select
                  value={editingAction.type}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      type: e.target.value as "Fixed" | "Dynamic",
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="Fixed">{t("typeFixed")}</option>
                  <option value="Dynamic">{t("typeDynamic")}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block">{tAction("effort")}</label>
                <select
                  value={editingAction.effort}
                  onChange={(e) =>
                    setEditingAction({
                      ...editingAction,
                      effort: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  {effortOptions.map((effort) => (
                    <option key={effort} value={effort}>
                      {tAction(effort)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block">
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
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* Translation Fields */}
            <div className="border-t pt-4">
              <div className="mb-4 flex items-center gap-2">
                <Languages size={16} />
                <span className="font-medium">{t("translations")}</span>
              </div>

              <div className="tabs tabs-bordered mb-4">
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
                  <label className="mb-1 block">
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
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block">
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
                    className="textarea textarea-bordered w-full"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block">
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
                    className="textarea textarea-bordered w-full"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="mb-1 block">
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
                    className="textarea textarea-bordered w-full"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
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
