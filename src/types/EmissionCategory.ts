// Translation interface for subcategory content
export interface SubcategoryTranslation {
  name: string;
  description: string;
}

// Translation interface for category content
export interface CategoryTranslation {
  name: string;
  description: string;
}

// Translatable subcategory interface
export interface TranslatableSubcategory {
  id: string;
  createdAt: string;
  updatedAt?: string;
  // Translatable fields for each locale
  translations: {
    [locale: string]: SubcategoryTranslation;
  };
}

// Translatable category interface
export interface TranslatableCategory {
  id: string;
  subcategories: TranslatableSubcategory[];
  createdAt: string;
  updatedAt?: string;
  // Translatable fields for each locale
  translations: {
    [locale: string]: CategoryTranslation;
  };
}

// Legacy interfaces for backward compatibility
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

// Helper function to get translated category (handles both old and new formats)
export function getTranslatedCategory(
  category: TranslatableCategory | EmissionCategory,
  locale: string,
  availableLocales?: string[],
): (TranslatableCategory | EmissionCategory) & CategoryTranslation {
  // Handle legacy format (old categories with direct name/description)
  if ("name" in category && typeof category.name === "string") {
    const legacyCategory = category as EmissionCategory;
    return {
      ...legacyCategory,
      name: legacyCategory.name,
      description: legacyCategory.description || "",
    };
  }

  // Handle new translation format
  const translatableCategory = category as TranslatableCategory;

  // Check if translations exist
  if (!translatableCategory.translations) {
    // Fallback for corrupted data
    return {
      ...translatableCategory,
      name: "Untitled Category",
      description: "",
    };
  }

  // Try the requested locale first
  if (
    translatableCategory.translations[locale] &&
    translatableCategory.translations[locale].name
  ) {
    return {
      ...translatableCategory,
      ...translatableCategory.translations[locale],
    };
  }

  // Fallback to first available locale from config, or first available translation
  const fallbackLocale =
    availableLocales?.[0] || Object.keys(translatableCategory.translations)[0];
  const translation =
    translatableCategory.translations[fallbackLocale] ||
    Object.values(translatableCategory.translations)[0];

  if (!translation || !translation.name) {
    // Final fallback if no translations found or name is missing
    return {
      ...translatableCategory,
      name: "Untitled Category",
      description: "",
    };
  }

  return {
    ...translatableCategory,
    ...translation,
  };
}

// Helper function to get translated subcategory (handles both old and new formats)
export function getTranslatedSubcategory(
  subcategory: TranslatableSubcategory | EmissionSubcategory,
  locale: string,
  availableLocales?: string[],
): (TranslatableSubcategory | EmissionSubcategory) & SubcategoryTranslation {
  // Handle legacy format (old subcategories with direct name/description)
  if ("name" in subcategory && typeof subcategory.name === "string") {
    const legacySubcategory = subcategory as EmissionSubcategory;
    return {
      ...legacySubcategory,
      name: legacySubcategory.name,
      description: legacySubcategory.description || "",
    };
  }

  // Handle new translation format
  const translatableSubcategory = subcategory as TranslatableSubcategory;

  // Check if translations exist
  if (!translatableSubcategory.translations) {
    // Fallback for corrupted data
    return {
      ...translatableSubcategory,
      name: "Untitled Subcategory",
      description: "",
    };
  }

  // Try the requested locale first
  if (
    translatableSubcategory.translations[locale] &&
    translatableSubcategory.translations[locale].name
  ) {
    return {
      ...translatableSubcategory,
      ...translatableSubcategory.translations[locale],
    };
  }

  // Fallback to first available locale from config, or first available translation
  const fallbackLocale =
    availableLocales?.[0] ||
    Object.keys(translatableSubcategory.translations)[0];
  const translation =
    translatableSubcategory.translations[fallbackLocale] ||
    Object.values(translatableSubcategory.translations)[0];

  if (!translation || !translation.name) {
    // Final fallback if no translations found or name is missing
    return {
      ...translatableSubcategory,
      name: "Untitled Subcategory",
      description: "",
    };
  }

  return {
    ...translatableSubcategory,
    ...translation,
  };
}

// Helper function to create empty category translations
export function createEmptyCategoryTranslations(locales: string[]): {
  [locale: string]: CategoryTranslation;
} {
  const translations: { [locale: string]: CategoryTranslation } = {};

  locales.forEach((locale) => {
    translations[locale] = {
      name: "",
      description: "",
    };
  });

  return translations;
}

// Helper function to create empty subcategory translations
export function createEmptySubcategoryTranslations(locales: string[]): {
  [locale: string]: SubcategoryTranslation;
} {
  const translations: { [locale: string]: SubcategoryTranslation } = {};

  locales.forEach((locale) => {
    translations[locale] = {
      name: "",
      description: "",
    };
  });

  return translations;
}

// Helper function to migrate legacy category to translatable format
export function migrateCategoryToTranslatable(
  legacyCategory: EmissionCategory,
  defaultLocale: string = "en",
): TranslatableCategory {
  const translations: { [locale: string]: CategoryTranslation } = {};

  // Create translation for default locale using existing name/description
  translations[defaultLocale] = {
    name: legacyCategory.name,
    description: legacyCategory.description || "",
  };

  // Migrate subcategories
  const migratedSubcategories: TranslatableSubcategory[] =
    legacyCategory.subcategories.map((subcat) =>
      migrateSubcategoryToTranslatable(subcat, defaultLocale),
    );

  return {
    id: legacyCategory.id,
    subcategories: migratedSubcategories,
    createdAt: legacyCategory.createdAt,
    updatedAt: legacyCategory.updatedAt,
    translations,
  };
}

// Helper function to migrate legacy subcategory to translatable format
export function migrateSubcategoryToTranslatable(
  legacySubcategory: EmissionSubcategory,
  defaultLocale: string = "en",
): TranslatableSubcategory {
  const translations: { [locale: string]: SubcategoryTranslation } = {};

  // Create translation for default locale using existing name/description
  translations[defaultLocale] = {
    name: legacySubcategory.name,
    description: legacySubcategory.description || "",
  };

  return {
    id: legacySubcategory.id,
    createdAt: legacySubcategory.createdAt,
    updatedAt: legacySubcategory.updatedAt,
    translations,
  };
}
