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

type ActionImpactInput = {
  calculatedReduction: number;
  category?: string;
  subcategory?: string;
  categoryContext?: {
    categoryId?: string;
    subcategoryData?: Array<{ id?: string; name?: string; value?: string }>;
  };
};

/**
 * Annual kg CO₂ removed for an action.
 * Direct + subcategory scope: (calculatedReduction% × subcategory kg).
 * Indirect / no subcategory: treated as % of school total (caller converts if needed).
 */
export function actionImpactKg(
  action: ActionImpactInput,
  lookup: SubcategoryKgLookup | undefined,
  schoolTotalKg?: number,
): { kg: number; asPctOfSchoolTotal: number } {
  const pct = action.calculatedReduction || 0;
  const subData = action.categoryContext?.subcategoryData;
  const categoryId =
    action.categoryContext?.categoryId || action.category || undefined;

  const valuesFromRows: number[] = [];
  for (const s of subData || []) {
    if (s.value == null || s.value === "") continue;
    const n = parseFloat(String(s.value));
    if (!Number.isNaN(n) && n > 0) valuesFromRows.push(n);
  }
  if (valuesFromRows.length > 0) {
    const base = valuesFromRows.reduce((a, b) => a + b, 0);
    const kg = (pct / 100) * base;
    const asPctOfSchoolTotal =
      schoolTotalKg && schoolTotalKg > 0 ? (kg / schoolTotalKg) * 100 : 0;
    return { kg, asPctOfSchoolTotal };
  }

  if (lookup && Object.keys(lookup).length > 0) {
    let base = 0;
    let matched = false;
    if (subData?.length) {
      for (const s of subData) {
        if (!s?.id) continue;
        const v = lookupSubcategoryKg(lookup, String(s.id), categoryId);
        if (v != null && v > 0) {
          base += v;
          matched = true;
        }
      }
    }
    if (!matched && action.subcategory) {
      const v = lookupSubcategoryKg(lookup, action.subcategory, categoryId);
      if (v != null && v > 0) {
        base = v;
        matched = true;
      }
    }
    if (matched) {
      const kg = (pct / 100) * base;
      const asPctOfSchoolTotal =
        schoolTotalKg && schoolTotalKg > 0 ? (kg / schoolTotalKg) * 100 : 0;
      return { kg, asPctOfSchoolTotal };
    }
  }

  const hasSubcategoryScope =
    !!action.categoryContext ||
    !!(action.subcategory && String(action.subcategory).length > 0);
  if (hasSubcategoryScope) {
    return { kg: 0, asPctOfSchoolTotal: 0 };
  }

  // Legacy / Indirect: pct of school total
  const kg =
    schoolTotalKg && schoolTotalKg > 0 ? (pct / 100) * schoolTotalKg : 0;
  return { kg, asPctOfSchoolTotal: pct };
}

/** Format a reduction % for UI (1 decimal, or 2 when the value would round to 0.0). */
export function formatReductionPct(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);
  if (abs !== 0 && abs < 0.1) {
    return (Math.round(value * 100) / 100).toFixed(2);
  }
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export type ActionReductionDisplay = {
  subcategoryPct: number;
  schoolPct: number | null;
  isIndirect: boolean;
};

/** Subcategory % (action label) and equivalent % of school total for display. */
export function getActionReductionDisplay(
  action: ActionImpactInput & { reduction?: number; type?: string },
  lookup?: SubcategoryKgLookup,
  schoolTotalKg?: number,
): ActionReductionDisplay {
  const isIndirect = action.type === "Indirect";
  const subcategoryPct =
    Number(action.calculatedReduction ?? action.reduction ?? 0) || 0;

  if (isIndirect) {
    return {
      subcategoryPct,
      schoolPct: subcategoryPct || 1,
      isIndirect: true,
    };
  }

  if (schoolTotalKg == null || schoolTotalKg <= 0) {
    return { subcategoryPct, schoolPct: null, isIndirect: false };
  }

  const { kg, asPctOfSchoolTotal } = actionImpactKg(
    action,
    lookup,
    schoolTotalKg,
  );
  const canShowSchool = kg > 0 || asPctOfSchoolTotal > 0;

  return {
    subcategoryPct,
    schoolPct: canShowSchool ? asPctOfSchoolTotal : null,
    isIndirect: false,
  };
}
