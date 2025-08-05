"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import {
  EmissionCategory,
  EmissionSubcategory,
} from "../../types/EmissionCategory";
import AdminModal from "./AdminModal";
import { authenticatedFetch } from "../../lib/auth-utils";

const EmissionCategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<EmissionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [editingCategory, setEditingCategory] =
    useState<EmissionCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{
    categoryId: string;
    subcategory: EmissionSubcategory;
  } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    totalPercentage: 0,
  });
  const [newSubcategory, setNewSubcategory] = useState({
    name: "",
    description: "",
    SubcategoryTotalPercentage: 0,
  });

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
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
        setNewCategory({ name: "", description: "", totalPercentage: 0 });
      } else {
        console.error("Error creating category:", data.error);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await authenticatedFetch(
        `/api/emission-categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingCategory.name,
            description: editingCategory.description,
            totalPercentage: editingCategory.totalPercentage,
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
        setNewSubcategory({
          name: "",
          description: "",
          SubcategoryTotalPercentage: 0,
        });
      } else {
        console.error("Error creating subcategory:", data.error);
      }
    } catch (error) {
      console.error("Error creating subcategory:", error);
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory) return;

    try {
      const response = await authenticatedFetch(
        `/api/emission-categories/${editingSubcategory.categoryId}/subcategories/${editingSubcategory.subcategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingSubcategory.subcategory.name,
            description: editingSubcategory.subcategory.description,
            SubcategoryTotalPercentage:
              editingSubcategory.subcategory.SubcategoryTotalPercentage,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setCategories((prev) =>
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
          ),
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
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  subcategories: c.subcategories.filter(
                    (sub) => sub.id !== subcategoryId,
                  ),
                }
              : c,
          ),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Emission Categories</h2>
        <button
          onClick={() => {
            const modal = document.getElementById(
              "create-category-modal",
            ) as HTMLDialogElement;
            if (modal) modal.showModal();
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCategoryExpansion(category.id)}
                  className="rounded p-1 hover:bg-gray-100"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <span className="text-sm text-gray-500">
                  ({category.subcategories.length} subcategories)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    const modal = document.getElementById(
                      "edit-category-modal",
                    ) as HTMLDialogElement;
                    if (modal) modal.showModal();
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {category.description && (
              <p className="mt-2 ml-6 text-gray-600">{category.description}</p>
            )}
            {category.totalPercentage !== undefined && (
              <p className="mt-1 ml-6 text-sm text-blue-600">
                Total Percentage: {category.totalPercentage}%
              </p>
            )}

            {expandedCategories.has(category.id) && (
              <div className="mt-4 ml-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Subcategories</h4>
                  <button
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      const modal = document.getElementById(
                        "create-subcategory-modal",
                      ) as HTMLDialogElement;
                      if (modal) modal.showModal();
                    }}
                    className="btn btn-sm btn-outline flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Subcategory
                  </button>
                </div>

                <div className="space-y-2">
                  {category.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center justify-between rounded bg-gray-50 p-2"
                    >
                      <div>
                        <span className="font-medium">{subcategory.name}</span>
                        {subcategory.description && (
                          <p className="text-sm text-gray-600">
                            {subcategory.description}
                          </p>
                        )}
                        {subcategory.SubcategoryTotalPercentage !==
                          undefined && (
                          <p className="text-sm text-green-600">
                            Subcategory Total Percentage:{" "}
                            {subcategory.SubcategoryTotalPercentage}%
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSubcategory({
                              categoryId: category.id,
                              subcategory,
                            });
                            const modal = document.getElementById(
                              "edit-subcategory-modal",
                            ) as HTMLDialogElement;
                            if (modal) modal.showModal();
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteSubcategory(category.id, subcategory.id)
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Category Modal */}
      <AdminModal
        id="create-category-modal"
        title="Create Emission Category"
        onClose={() => {
          const modal = document.getElementById(
            "create-category-modal",
          ) as HTMLDialogElement;
          if (modal) modal.close();
        }}
      >
        <div className="mb-4">
          <label className="mb-1 block">Category Name</label>
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            className="input input-bordered w-full"
            placeholder="Enter category name"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block">Description (Optional)</label>
          <textarea
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
            className="textarea textarea-bordered w-full"
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block">Total Percentage</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={newCategory.totalPercentage}
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                totalPercentage: parseFloat(e.target.value) || 0,
              })
            }
            className="input input-bordered w-full"
            placeholder="Enter total percentage (0-100)"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const modal = document.getElementById(
                "create-category-modal",
              ) as HTMLDialogElement;
              if (modal) modal.close();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateCategory}
          >
            Create
          </button>
        </div>
      </AdminModal>

      {/* Edit Category Modal */}
      <AdminModal
        id="edit-category-modal"
        title="Edit Emission Category"
        onClose={() => {
          const modal = document.getElementById(
            "edit-category-modal",
          ) as HTMLDialogElement;
          if (modal) modal.close();
        }}
      >
        <div className="mb-4">
          <label className="mb-1 block">Category Name</label>
          <input
            type="text"
            value={editingCategory?.name || ""}
            onChange={(e) =>
              setEditingCategory(
                editingCategory
                  ? { ...editingCategory, name: e.target.value }
                  : null,
              )
            }
            className="input input-bordered w-full"
            placeholder="Enter category name"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block">Description (Optional)</label>
          <textarea
            value={editingCategory?.description || ""}
            onChange={(e) =>
              setEditingCategory(
                editingCategory
                  ? { ...editingCategory, description: e.target.value }
                  : null,
              )
            }
            className="textarea textarea-bordered w-full"
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block">Total Percentage</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={editingCategory?.totalPercentage || 0}
            onChange={(e) =>
              setEditingCategory(
                editingCategory
                  ? {
                      ...editingCategory,
                      totalPercentage: parseFloat(e.target.value) || 0,
                    }
                  : null,
              )
            }
            className="input input-bordered w-full"
            placeholder="Enter total percentage (0-100)"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const modal = document.getElementById(
                "edit-category-modal",
              ) as HTMLDialogElement;
              if (modal) modal.close();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpdateCategory}
          >
            Update
          </button>
        </div>
      </AdminModal>

      {/* Create Subcategory Modal */}
      <AdminModal
        id="create-subcategory-modal"
        title="Create Subcategory"
        onClose={() => {
          const modal = document.getElementById(
            "create-subcategory-modal",
          ) as HTMLDialogElement;
          if (modal) modal.close();
        }}
      >
        <div className="mb-4">
          <label className="mb-1 block">Subcategory Name</label>
          <input
            type="text"
            value={newSubcategory.name}
            onChange={(e) =>
              setNewSubcategory({ ...newSubcategory, name: e.target.value })
            }
            className="input input-bordered w-full"
            placeholder="Enter subcategory name"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block">Description (Optional)</label>
          <textarea
            value={newSubcategory.description}
            onChange={(e) =>
              setNewSubcategory({
                ...newSubcategory,
                description: e.target.value,
              })
            }
            className="textarea textarea-bordered w-full"
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block">Subcategory Total Percentage</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={newSubcategory.SubcategoryTotalPercentage}
            onChange={(e) =>
              setNewSubcategory({
                ...newSubcategory,
                SubcategoryTotalPercentage: parseFloat(e.target.value) || 0,
              })
            }
            className="input input-bordered w-full"
            placeholder="Enter subcategory total percentage (0-100)"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const modal = document.getElementById(
                "create-subcategory-modal",
              ) as HTMLDialogElement;
              if (modal) modal.close();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateSubcategory}
          >
            Create
          </button>
        </div>
      </AdminModal>

      {/* Edit Subcategory Modal */}
      <AdminModal
        id="edit-subcategory-modal"
        title="Edit Subcategory"
        onClose={() => {
          const modal = document.getElementById(
            "edit-subcategory-modal",
          ) as HTMLDialogElement;
          if (modal) modal.close();
        }}
      >
        <div className="mb-4">
          <label className="mb-1 block">Subcategory Name</label>
          <input
            type="text"
            value={editingSubcategory?.subcategory.name || ""}
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
            className="input input-bordered w-full"
            placeholder="Enter subcategory name"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block">Description (Optional)</label>
          <textarea
            value={editingSubcategory?.subcategory.description || ""}
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
            className="textarea textarea-bordered w-full"
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block">Subcategory Total Percentage</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={
              editingSubcategory?.subcategory.SubcategoryTotalPercentage || 0
            }
            onChange={(e) =>
              setEditingSubcategory(
                editingSubcategory
                  ? {
                      ...editingSubcategory,
                      subcategory: {
                        ...editingSubcategory.subcategory,
                        SubcategoryTotalPercentage:
                          parseFloat(e.target.value) || 0,
                      },
                    }
                  : null,
              )
            }
            className="input input-bordered w-full"
            placeholder="Enter subcategory total percentage (0-100)"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const modal = document.getElementById(
                "edit-subcategory-modal",
              ) as HTMLDialogElement;
              if (modal) modal.close();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpdateSubcategory}
          >
            Update
          </button>
        </div>
      </AdminModal>
    </div>
  );
};

export default EmissionCategoriesManager;
