export interface EmissionSubcategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EmissionCategory {
  id: string;
  name: string;
  description?: string;
  subcategories: EmissionSubcategory[];
  createdAt: string;
  updatedAt?: string;
}
