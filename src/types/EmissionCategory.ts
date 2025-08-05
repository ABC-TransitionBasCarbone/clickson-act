export interface EmissionSubcategory {
  id: string;
  name: string;
  description?: string;
  SubcategoryTotalPercentage?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface EmissionCategory {
  id: string;
  name: string;
  description?: string;
  totalPercentage?: number;
  subcategories: EmissionSubcategory[];
  createdAt: string;
  updatedAt?: string;
}
