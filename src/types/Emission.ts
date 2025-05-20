export interface EmissionType {
  label: string;
  value: string;
  category: string;
  subcategories: {
    subcategoryTitle: string;
    value: string;
  }[];
}
