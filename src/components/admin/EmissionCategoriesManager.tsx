"use client";

import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Languages,
} from "lucide-react";
import {
  EmissionCategory,
  EmissionSubcategory,
  TranslatableCategory,
  TranslatableSubcategory,
  CategoryTranslation,
  SubcategoryTranslation,
  getTranslatedCategory,
  getTranslatedSubcategory,
  createEmptyCategoryTranslations,
  createEmptySubcategoryTranslations,
} from "../../types/EmissionCategory";
import AdminModal from "./AdminModal";
import { authenticatedFetch } from "../../lib/auth-utils";
import { useTranslations } from "next-intl";
import { locales } from "@/i18n/config";

const EmissionCategoriesManager: React.FC = () => {
  const t = useTranslations("CategoriesManager");
  const tCommon = useTranslations("Common");

  const [categories, setCategories] = useState<
    (TranslatableCategory | EmissionCategory)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [editingCategory, setEditingCategory] = useState<
    (TranslatableCategory | EmissionCategory) | null
  >(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{
    categoryId: string;
    subcategory: TranslatableSubcategory | EmissionSubcategory;
  } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedLocale, setSelectedLocale] = useState<string>(locales[0]);
  const [newCategory, setNewCategory] = useState<{
    translations: { [locale: string]: CategoryTranslation };
  }>({
    translations: {},
  });
  const [newSubcategory, setNewSubcategory] = useState<{
    translations: { [locale: string]: SubcategoryTranslation };
  }>({
    translations: {},
  });
  const [validationError, setValidationError] = useState<string>("");
  const [saveLoading, setSaveLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  // Initialize translations for all locales
  useEffect(() => {
    const initialCategoryTranslations =
      createEmptyCategoryTranslations(locales);
    const initialSubcategoryTranslations =
      createEmptySubcategoryTranslations(locales);
    setNewCategory((prev) => ({
      ...prev,
      translations: initialCategoryTranslations,
    }));
    setNewSubcategory((prev) => ({
      ...prev,
      translations: initialSubcategoryTranslations,
    }));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const validateCategoryTranslations = () => {
    // Check if at least one language has a name
    const hasAtLeastOneName = locales.some(
      (locale) => newCategory.translations[locale]?.name.trim()
    );
    
    if (!hasAtLeastOneName) {
      setValidationError(
        "Please provide a category name in at least one language.",
      );
      return false;
    }
    
    // Warn about missing translations but don't fail
    const missingTranslations = [];
    for (const locale of locales) {
      if (!newCategory.translations[locale]?.name.trim()) {
        missingTranslations.push(locale.toUpperCase());
      }
    }
    
    if (missingTranslations.length > 0 && missingTranslations.length < locales.length) {
      setValidationError(
        `Warning: Missing translations for ${missingTranslations.join(", ")}. You can add them later.`,
      );
      // Don't return false - this is just a warning
    } else {
      setValidationError("");
    }
    
    return true;
  };

  const validateSubcategoryTranslations = () => {
    // Check if at least one language has a name
    const hasAtLeastOneName = locales.some(
      (locale) => newSubcategory.translations[locale]?.name.trim()
    );
    
    if (!hasAtLeastOneName) {
      setValidationError(
        "Please provide a subcategory name in at least one language.",
      );
      return false;
    }
    
    // Warn about missing translations but don't fail
    const missingTranslations = [];
    for (const locale of locales) {
      if (!newSubcategory.translations[locale]?.name.trim()) {
        missingTranslations.push(locale.toUpperCase());
      }
    }
    
    if (missingTranslations.length > 0 && missingTranslations.length < locales.length) {
      setValidationError(
        `Warning: Missing translations for ${missingTranslations.join(", ")}. You can add them later.`,
      );
      // Don't return false - this is just a warning
    } else {
      setValidationError("");
    }
    
    return true;
  };

  const handleCreateCategory = async () => {
    if (!validateCategoryTranslations()) {
      return;
    }

    setSaveLoading(true);
    try {
      const response = await authenticatedFetch("/api/emission-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();
      if (data.success) {
        setCategories((prev) => [...prev, data.category]);
        const modal = document.getElementById(
          "create-category-modal",
        ) as HTMLDialogElement;
        if (modal) modal.close();
        resetNewCategory();
        setValidationError("");
      } else {
        setValidationError(data.error || "Failed to create category");
        console.error("Error creating category:", data.error);
      }
    } catch (error) {
      setValidationError("Failed to create category");
      console.error("Error creating category:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    setSaveLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/emission-categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            translations:
              "translations" in editingCategory
                ? editingCategory.translations
                : undefined,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? editingCategory : c)),
        );
        const modal = document.getElementById(
          "edit-category-modal",
        ) as HTMLDialogElement;
        if (modal) modal.close();
        setEditingCategory(null);
      } else {
        console.error("Error updating category:", data.error);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await authenticatedFetch(
        `/api/emission-categories/${id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        console.error("Error deleting category:", data.error);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleCreateSubcategory = async () => {
    if (!validateSubcategoryTranslations()) {
      return;
    }

    setSaveLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/emission-categories/${selectedCategoryId}/subcategories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSubcategory),
        },
      );

      const data = await response.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === selectedCategoryId
              ? { ...c, subcategories: [...c.subcategories, data.subcategory] }
              : c,
          ),
        );
        const modal = document.getElementById(
          "create-subcategory-modal",
        ) as HTMLDialogElement;
        if (modal) modal.close();
        resetNewSubcategory();
        setValidationError("");
      } else {
        setValidationError(data.error || "Failed to create subcategory");
        console.error("Error creating subcategory:", data.error);
      }
    } catch (error) {
      setValidationError("Failed to create subcategory");
      console.error("Error creating subcategory:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory) return;

    setSaveLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/emission-categories/${editingSubcategory.categoryId}/subcategories/${editingSubcategory.subcategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            translations:
              "translations" in editingSubcategory.subcategory
                ? editingSubcategory.subcategory.translations
                : undefined,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setCategories(
          (prev) =>
            prev.map((c) =>
              c.id === editingSubcategory.categoryId
                ? {
                    ...c,
                    subcategories: c.subcategories.map((sub) =>
                      sub.id === editingSubcategory.subcategory.id
                        ? editingSubcategory.subcategory
                        : sub,
                    ),
                  }
                : c,
            ) as (TranslatableCategory | EmissionCategory)[],
        );
        const modal = document.getElementById(
          "edit-subcategory-modal",
        ) as HTMLDialogElement;
        if (modal) modal.close();
        setEditingSubcategory(null);
      } else {
        console.error("Error updating subcategory:", data.error);
      }
    } catch (error) {
      console.error("Error updating subcategory:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteSubcategory = async (
    categoryId: string,
    subcategoryId: string,
  ) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      const response = await authenticatedFetch(
        `/api/emission-categories/${categoryId}/subcategories/${subcategoryId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();
      if (data.success) {
        setCategories(
          (prev) =>
            prev.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    subcategories: c.subcategories.filter(
                      (sub) => sub.id !== subcategoryId,
                    ),
                  }
                : c,
            ) as (TranslatableCategory | EmissionCategory)[],
        );
      } else {
        console.error("Error deleting subcategory:", data.error);
      }
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Helper functions for managing translations
  const resetNewCategory = () => {
    const initialTranslations = createEmptyCategoryTranslations(locales);
    setNewCategory({
      translations: initialTranslations,
    });
  };

  const resetNewSubcategory = () => {
    const initialTranslations = createEmptySubcategoryTranslations(locales);
    setNewSubcategory({
      translations: initialTranslations,
    });
  };

  const updateNewCategoryTranslation = (
    locale: string,
    field: keyof CategoryTranslation,
    value: string,
  ) => {
    setNewCategory((prev) => ({
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

  const updateEditingCategoryTranslation = (
    locale: string,
    field: keyof CategoryTranslation,
    value: string,
  ) => {
    if (!editingCategory || !("translations" in editingCategory)) return;

    setEditingCategory((prev) => {
      if (!prev || !("translations" in prev)) return prev;
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [locale]: {
            ...prev.translations[locale],
            [field]: value,
          },
        },
      };
    });
  };

  const updateNewSubcategoryTranslation = (
    locale: string,
    field: keyof SubcategoryTranslation,
    value: string,
  ) => {
    setNewSubcategory((prev) => ({
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

  const updateEditingSubcategoryTranslation = (
    locale: string,
    field: keyof SubcategoryTranslation,
    value: string,
  ) => {
    if (
      !editingSubcategory ||
      !("translations" in editingSubcategory.subcategory)
    )
      return;

    setEditingSubcategory((prev) => {
      if (!prev || !("translations" in prev.subcategory)) return prev;
      return {
        ...prev,
        subcategory: {
          ...prev.subcategory,
          translations: {
            ...prev.subcategory.translations,
            [locale]: {
              ...prev.subcategory.translations[locale],
              [field]: value,
            },
          },
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl">{t("title")}</h2>
        <button
          onClick={() => {
            setValidationError("");
            const modal = document.getElementById(
              "create-category-modal",
            ) as HTMLDialogElement;
            if (modal) modal.showModal();
          }}
          className="flex items-center gap-2 btn btn-primary"
        >
          <Plus size={20} />
          {t("addCategory")}
        </button>
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="py-8 text-gray-500 text-center">
            {t("noCategories")}
          </div>
        ) : (
          categories.map((category) => {
            const translatedCategory = getTranslatedCategory(
              category,
              selectedLocale,
              locales,
            );
            return (
              <div key={category.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCategoryExpansion(category.id)}
                      className="cursor-pointer"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    <h3 className="font-semibold text-lg">
                      {translatedCategory.name}
                    </h3>
                    <span className="text-gray-500 text-sm">
                      ({category.subcategories?.length || 0}{" "}
                      {t("subcategories")})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setValidationError("");
                        setEditingCategory(category);
                        const modal = document.getElementById(
                          "edit-category-modal",
                        ) as HTMLDialogElement;
                        if (modal) modal.showModal();
                      }}
                      className="text-primary hover:text-primary-600 cursor-pointer"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {translatedCategory.description && (
                  <p className="mt-2 ml-6 text-gray-600">
                    {translatedCategory.description}
                  </p>
                )}

                {expandedCategories.has(category.id) && (
                  <div className="space-y-2 mt-4 ml-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Subcategories</h4>
                      <button
                        onClick={() => {
                          setValidationError("");
                          setSelectedCategoryId(category.id);
                          const modal = document.getElementById(
                            "create-subcategory-modal",
                          ) as HTMLDialogElement;
                          if (modal) modal.showModal();
                        }}
                        className="flex items-center gap-1 btn-outline btn btn-sm"
                      >
                        <Plus size={14} />
                        {t("addSubcategory")}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {!category.subcategories ||
                      category.subcategories.length === 0 ? (
                        <div className="py-4 text-gray-500 text-sm text-center">
                          {t("noSubcategories")}
                        </div>
                      ) : (
                        category.subcategories.map((subcategory) => {
                          const translatedSubcategory =
                            getTranslatedSubcategory(
                              subcategory,
                              selectedLocale,
                              locales,
                            );
                          return (
                            <div
                              key={subcategory.id}
                              className="flex justify-between items-center bg-gray-50 p-2 rounded"
                            >
                              <div>
                                <span className="font-medium">
                                  {translatedSubcategory.name}
                                </span>
                                {translatedSubcategory.description && (
                                  <p className="text-gray-600 text-sm">
                                    {translatedSubcategory.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setValidationError("");
                                    setEditingSubcategory({
                                      categoryId: category.id,
                                      subcategory,
                                    });
                                    const modal = document.getElementById(
                                      "edit-subcategory-modal",
                                    ) as HTMLDialogElement;
                                    if (modal) modal.showModal();
                                  }}
                                  className="text-primary hover:text-primary-600 cursor-pointer"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteSubcategory(
                                      category.id,
                                      subcategory.id,
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800 cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Locale Selector (fixed bottom right) */}
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

      {/* Create Category Modal */}
      <AdminModal
        id="create-category-modal"
        title={t("createCategory")}
        onClose={() => {
          const modal = document.getElementById(
            "create-category-modal",
          ) as HTMLDialogElement;
          if (modal) modal.close();
        }}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Translation Fields */}
          <div className="pt-4">
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
                  {t("categoryName")} ({selectedLocale.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={newCategory.translations[selectedLocale]?.name || ""}
                  onChange={(e) =>
                    updateNewCategoryTranslation(
                      selectedLocale,
                      "name",
                      e.target.value,
                    )
                  }
                  className="input-bordered w-full input"
                  placeholder={`${t("categoryName")} in ${selectedLocale.toUpperCase()}`}
                />
              </div>
              <div>
                <label className="block mb-1">
                  {t("categoryDescription")} ({selectedLocale.toUpperCase()})
                </label>
                <textarea
                  value={
                    newCategory.translations[selectedLocale]?.description || ""
                  }
                  onChange={(e) =>
                    updateNewCategoryTranslation(
                      selectedLocale,
                      "description",
                      e.target.value,
                    )
                  }
                  className="textarea-bordered w-full textarea"
                  placeholder={`${t("categoryDescription")} in ${selectedLocale.toUpperCase()}`}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {validationError && (
            <div className="alert alert-error">
              <span>{validationError}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const modal = document.getElementById(
                "create-category-modal",
              ) as HTMLDialogElement;
              if (modal) modal.close();
              setValidationError("");
            }}
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateCategory}
            disabled={
              saveLoading || 
              !locales.some((locale) => newCategory.translations[locale]?.name.trim())
            }
          >
            {saveLoading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            {saveLoading ? "Creating..." : t("createCategory")}
          </button>
        </div>
      </AdminModal>

      {/* Edit Category Modal */}
      {editingCategory && (
        <AdminModal
          id="edit-category-modal"
          title={t("editCategory")}
          onClose={() => {
            const modal = document.getElementById(
              "edit-category-modal",
            ) as HTMLDialogElement;
            if (modal) modal.close();
            setValidationError("");
          }}
        >
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Translation Fields - Only show if category has translations */}
            {"translations" in editingCategory && (
              <div className="pt-4">
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
                      {t("categoryName")} ({selectedLocale.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={
                        editingCategory.translations[selectedLocale]?.name || ""
                      }
                      onChange={(e) =>
                        updateEditingCategoryTranslation(
                          selectedLocale,
                          "name",
                          e.target.value,
                        )
                      }
                      className="input-bordered w-full input"
                      placeholder={`${t("categoryName")} in ${selectedLocale.toUpperCase()}`}
                    />
                  </div>
                  <div>
                    <label className="block mb-1">
                      {t("categoryDescription")} ({selectedLocale.toUpperCase()}
                      )
                    </label>
                    <textarea
                      value={
                        editingCategory.translations[selectedLocale]
                          ?.description || ""
                      }
                      onChange={(e) =>
                        updateEditingCategoryTranslation(
                          selectedLocale,
                          "description",
                          e.target.value,
                        )
                      }
                      className="textarea-bordered w-full textarea"
                      placeholder={`${t("categoryDescription")} in ${selectedLocale.toUpperCase()}`}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Legacy category without translations */}
            {"name" in editingCategory && (
              <div className="pt-4">
                <div className="mb-4 alert alert-info">
                  <span>
                    This is a legacy category. Edit will convert it to use
                    translations.
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1">Category Name</label>
                    <input
                      type="text"
                      value={(editingCategory as EmissionCategory).name || ""}
                      onChange={(e) =>
                        setEditingCategory(
                          editingCategory
                            ? { ...editingCategory, name: e.target.value }
                            : null,
                        )
                      }
                      className="input-bordered w-full input"
                      placeholder="Enter category name"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Description</label>
                    <textarea
                      value={
                        (editingCategory as EmissionCategory).description || ""
                      }
                      onChange={(e) =>
                        setEditingCategory(
                          editingCategory
                            ? {
                                ...editingCategory,
                                description: e.target.value,
                              }
                            : null,
                        )
                      }
                      className="textarea-bordered w-full textarea"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {validationError && (
              <div className="alert alert-error">
                <span>{validationError}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const modal = document.getElementById(
                  "edit-category-modal",
                ) as HTMLDialogElement;
                if (modal) modal.close();
                setValidationError("");
              }}
            >
              {tCommon("cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdateCategory}
              disabled={saveLoading}
            >
              {saveLoading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {saveLoading ? "Saving..." : tCommon("save")}
            </button>
          </div>
        </AdminModal>
      )}

      {/* Create Subcategory Modal */}
      <AdminModal
        id="create-subcategory-modal"
        title={t("createSubcategory")}
        onClose={() => {
          const modal = document.getElementById(
            "create-subcategory-modal",
          ) as HTMLDialogElement;
          if (modal) modal.close();
          setValidationError("");
        }}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Translation Fields */}
          <div className="pt-4">
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
                  {t("subcategoryName")} ({selectedLocale.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={
                    newSubcategory.translations[selectedLocale]?.name || ""
                  }
                  onChange={(e) =>
                    updateNewSubcategoryTranslation(
                      selectedLocale,
                      "name",
                      e.target.value,
                    )
                  }
                  className="input-bordered w-full input"
                  placeholder={`${t("subcategoryName")} in ${selectedLocale.toUpperCase()}`}
                />
              </div>
              <div>
                <label className="block mb-1">
                  {t("subcategoryDescription")} ({selectedLocale.toUpperCase()})
                </label>
                <textarea
                  value={
                    newSubcategory.translations[selectedLocale]?.description ||
                    ""
                  }
                  onChange={(e) =>
                    updateNewSubcategoryTranslation(
                      selectedLocale,
                      "description",
                      e.target.value,
                    )
                  }
                  className="textarea-bordered w-full textarea"
                  placeholder={`${t("subcategoryDescription")} in ${selectedLocale.toUpperCase()}`}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {validationError && (
            <div className="alert alert-error">
              <span>{validationError}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const modal = document.getElementById(
                "create-subcategory-modal",
              ) as HTMLDialogElement;
              if (modal) modal.close();
              setValidationError("");
            }}
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateSubcategory}
            disabled={
              saveLoading || 
              !locales.some((locale) => newSubcategory.translations[locale]?.name.trim())
            }
          >
            {saveLoading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            {saveLoading ? "Creating..." : t("createSubcategory")}
          </button>
        </div>
      </AdminModal>

      {/* Edit Subcategory Modal */}
      {editingSubcategory && (
        <AdminModal
          id="edit-subcategory-modal"
          title={t("editSubcategory")}
          onClose={() => {
            const modal = document.getElementById(
              "edit-subcategory-modal",
            ) as HTMLDialogElement;
            if (modal) modal.close();
            setValidationError("");
          }}
        >
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Translation Fields - Only show if subcategory has translations */}
            {"translations" in editingSubcategory.subcategory && (
              <div className="pt-4">
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
                      {t("subcategoryName")} ({selectedLocale.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={
                        editingSubcategory.subcategory.translations[
                          selectedLocale
                        ]?.name || ""
                      }
                      onChange={(e) =>
                        updateEditingSubcategoryTranslation(
                          selectedLocale,
                          "name",
                          e.target.value,
                        )
                      }
                      className="input-bordered w-full input"
                      placeholder={`${t("subcategoryName")} in ${selectedLocale.toUpperCase()}`}
                    />
                  </div>
                  <div>
                    <label className="block mb-1">
                      {t("subcategoryDescription")} (
                      {selectedLocale.toUpperCase()})
                    </label>
                    <textarea
                      value={
                        editingSubcategory.subcategory.translations[
                          selectedLocale
                        ]?.description || ""
                      }
                      onChange={(e) =>
                        updateEditingSubcategoryTranslation(
                          selectedLocale,
                          "description",
                          e.target.value,
                        )
                      }
                      className="textarea-bordered w-full textarea"
                      placeholder={`${t("subcategoryDescription")} in ${selectedLocale.toUpperCase()}`}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Legacy subcategory without translations */}
            {"name" in editingSubcategory.subcategory && (
              <div className="pt-4">
                <div className="mb-4 alert alert-info">
                  <span>
                    This is a legacy subcategory. Edit will convert it to use
                    translations.
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1">Subcategory Name</label>
                    <input
                      type="text"
                      value={
                        (editingSubcategory.subcategory as EmissionSubcategory)
                          .name || ""
                      }
                      onChange={(e) =>
                        setEditingSubcategory(
                          editingSubcategory
                            ? {
                                ...editingSubcategory,
                                subcategory: {
                                  ...editingSubcategory.subcategory,
                                  name: e.target.value,
                                },
                              }
                            : null,
                        )
                      }
                      className="input-bordered w-full input"
                      placeholder="Enter subcategory name"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Description</label>
                    <textarea
                      value={
                        (editingSubcategory.subcategory as EmissionSubcategory)
                          .description || ""
                      }
                      onChange={(e) =>
                        setEditingSubcategory(
                          editingSubcategory
                            ? {
                                ...editingSubcategory,
                                subcategory: {
                                  ...editingSubcategory.subcategory,
                                  description: e.target.value,
                                },
                              }
                            : null,
                        )
                      }
                      className="textarea-bordered w-full textarea"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {validationError && (
              <div className="alert alert-error">
                <span>{validationError}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const modal = document.getElementById(
                  "edit-subcategory-modal",
                ) as HTMLDialogElement;
                if (modal) modal.close();
                setValidationError("");
              }}
            >
              {tCommon("cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdateSubcategory}
              disabled={saveLoading}
            >
              {saveLoading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {saveLoading ? "Saving..." : tCommon("save")}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default EmissionCategoriesManager;
