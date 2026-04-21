import type { SchoolEmissionCategory } from "@/types/School";

export type SubcategoryKgLookup = Record<string, number>;

/** Build lookup: subcategoryId and `${categoryId}-${subcategoryId}` → kg CO₂e */
export function buildSubcategoryKgLookupFromSchoolCategories(
  categories: SchoolEmissionCategory[] | undefined | null,
): SubcategoryKgLookup {
  const map: SubcategoryKgLookup = {};
  if (!categories?.length) return map;

  for (const cat of categories) {
    for (const sub of cat.subcategories || []) {
      const kg =
        typeof sub.amount === "number" && !Number.isNaN(sub.amount)
          ? sub.amount
          : 0;
      if (kg <= 0) continue;
      const id = sub.subcategoryId;
      map[id] = (map[id] || 0) + kg;
      map[`${cat.categoryId}-${id}`] = (map[`${cat.categoryId}-${id}`] || 0) + kg;
    }
  }
  return map;
}

type ProjectEmissionDoc = {
  id?: string;
  studentId?: string;
  dateCalculated?: string;
  emissions?: Array<{
    categoryId: string;
    subcategories: Array<{ id: string; value: string }>;
  }>;
};

/** Latest emissions doc per student, then sum subcategory kg across students (same idea as project total). */
export function buildSubcategoryKgLookupFromProjectEmissions(
  emissionsData: ProjectEmissionDoc[] | undefined | null,
): SubcategoryKgLookup {
  const map: SubcategoryKgLookup = {};
  if (!emissionsData?.length) return map;

  const latestByStudent = new Map<string, ProjectEmissionDoc>();
  for (const doc of emissionsData) {
    const key = String(doc.studentId ?? doc.id ?? "anonymous");
    const existing = latestByStudent.get(key);
    const docDate = doc.dateCalculated
      ? new Date(doc.dateCalculated).getTime()
      : 0;
    const existingDate = existing?.dateCalculated
      ? new Date(existing.dateCalculated).getTime()
      : -1;
    if (!existing || docDate > existingDate) {
      latestByStudent.set(key, doc);
    }
  }

  for (const doc of latestByStudent.values()) {
    for (const cat of doc.emissions || []) {
      for (const sub of cat.subcategories || []) {
        const kg = parseFloat(String(sub.value || "0"));
        if (Number.isNaN(kg) || kg <= 0) continue;
        const id = sub.id;
        map[id] = (map[id] || 0) + kg;
        map[`${cat.categoryId}-${id}`] =
          (map[`${cat.categoryId}-${id}`] || 0) + kg;
      }
    }
  }
  return map;
}

export function mergeSubcategoryKgLookups(
  project: SubcategoryKgLookup,
  school: SubcategoryKgLookup | undefined,
): SubcategoryKgLookup {
  return { ...project, ...school };
}

/** Resolve kg for an action subcategory select value (`categoryId-subcategoryId`) or raw id. */
export function lookupSubcategoryKg(
  lookup: SubcategoryKgLookup,
  subcategoryValue: string | undefined,
  categoryId: string | undefined,
): number | undefined {
  if (!subcategoryValue || !lookup || !Object.keys(lookup).length) {
    return undefined;
  }

  if (lookup[subcategoryValue] != null && lookup[subcategoryValue]! > 0) {
    return lookup[subcategoryValue];
  }

  if (subcategoryValue.includes("-")) {
    const last = subcategoryValue.split("-").pop();
    if (last && lookup[last] != null && lookup[last]! > 0) {
      return lookup[last];
    }
    if (
      categoryId &&
      lookup[`${categoryId}-${last}`] != null &&
      lookup[`${categoryId}-${last}`]! > 0
    ) {
      return lookup[`${categoryId}-${last}`];
    }
  }

  return undefined;
}
