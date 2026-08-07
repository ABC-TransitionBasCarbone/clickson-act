/** Build API categoryData so trajectory chart can apply % to subcategory kg. */
export function buildCategoryDataPayload(options: {
  categoryId: string;
  categoryName?: string;
  subcategory?: string;
  /** Optional kg CO₂e for the subcategory (from inventory / selection). */
  subcategoryKg?: number | null;
  subcategoryName?: string;
  /** Multiple selected subcategories with kg amounts (student calculator). */
  subcategoryRows?: Array<{
    id: string;
    name?: string;
    amount?: number;
  }>;
}): {
  categoryId: string;
  categoryName: string;
  subcategoryData: Array<{
    subcategoryId: string;
    subcategoryName: string;
    value: string;
  }>;
} {
  const categoryId = options.categoryId;
  const categoryName = options.categoryName || categoryId;

  if (options.subcategoryRows?.length) {
    return {
      categoryId,
      categoryName,
      subcategoryData: options.subcategoryRows.map((row) => ({
        subcategoryId: row.id,
        subcategoryName: row.name || row.id,
        value:
          row.amount != null && !Number.isNaN(row.amount)
            ? String(row.amount)
            : "",
      })),
    };
  }

  if (options.subcategory) {
    return {
      categoryId,
      categoryName,
      subcategoryData: [
        {
          subcategoryId: options.subcategory,
          subcategoryName: options.subcategoryName || options.subcategory,
          value:
            options.subcategoryKg != null &&
            !Number.isNaN(options.subcategoryKg)
              ? String(options.subcategoryKg)
              : "",
        },
      ],
    };
  }

  return {
    categoryId,
    categoryName,
    subcategoryData: [],
  };
}

/** Map API subcategory rows to SchoolGoalCard categoryContext shape. */
export function toChartSubcategoryData(
  rows:
    | Array<{
        subcategoryId?: string;
        subcategoryName?: string;
        id?: string;
        name?: string;
        value?: string;
      }>
    | undefined,
): Array<{ id?: string; name?: string; value?: string }> {
  if (!rows?.length) return [];
  return rows.map((row) => ({
    id: row.id || row.subcategoryId,
    name: row.name || row.subcategoryName,
    value: row.value ?? "",
  }));
}
