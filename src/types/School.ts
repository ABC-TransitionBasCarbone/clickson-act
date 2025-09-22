// School document structure in the "schools" collection
// Each school is a document with a random ID containing name, goal, deadline, and emission data
export interface School {
  id: string;
  name: string;
  goal: number;
  deadlineYear: string;
  createdAt: string;
  updatedAt?: string;
  // Emission categories with school-specific data
  emissionCategories?: SchoolEmissionCategory[];
}

// School-specific emission category data
export interface SchoolEmissionCategory {
  categoryId: string; // Reference to the global category
  categoryName: string; // Cached name for display
  amount: number; // Teacher-entered emission amount in kgCO2e for this category
  subcategories: SchoolEmissionSubcategory[];
  updatedAt: string;
}

// School-specific emission subcategory data
export interface SchoolEmissionSubcategory {
  subcategoryId: string; // Reference to the global subcategory
  subcategoryName: string; // Cached name for display
  amount: number; // Teacher-entered emission amount in kgCO2e for this subcategory
  updatedAt: string;
}

// Calculated percentages (computed from amounts)
export interface SchoolEmissionPercentages {
  totalEmissions: number; // Total school emissions in kgCO2e
  categories: {
    categoryId: string;
    percentage: number; // Calculated: (categoryAmount / totalEmissions) * 100
    subcategories: {
      subcategoryId: string;
      percentage: number; // Calculated: (subcategoryAmount / categoryAmount) * 100
    }[];
  }[];
}
