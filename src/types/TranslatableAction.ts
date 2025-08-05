export interface ActionTranslation {
  title: string;
  description: string;
  objectives: string;
  steps: string;
}

export interface TranslatableAction {
  id: string;
  category: string;
  type: "Fixed" | "Dynamic";
  reduction: number;
  effort: string;
  date: string;
  // Optional fields for extended functionality
  subcategory?: string;
  timeline?: string;
  status?: "Available" | "Selected" | "Completed";
  assignedTo?: string;
  selected?: boolean;
  // Translatable fields for each locale
  translations: {
    [locale: string]: ActionTranslation;
  };
}

// Helper function to get translated action
export function getTranslatedAction(
  action: TranslatableAction,
  locale: string,
  availableLocales?: string[],
): TranslatableAction & ActionTranslation {
  // Check if translations exist
  if (!action.translations) {
    // Fallback for corrupted data
    return {
      ...action,
      title: "Untitled Action",
      description: "",
      objectives: "",
      steps: "",
    };
  }

  // Try the requested locale first
  if (action.translations[locale] && action.translations[locale].title) {
    return {
      ...action,
      ...action.translations[locale],
    };
  }

  // Fallback to first available locale from config, or first available translation
  const fallbackLocale =
    availableLocales?.[0] || Object.keys(action.translations)[0];
  const translation =
    action.translations[fallbackLocale] ||
    Object.values(action.translations)[0];

  if (!translation || !translation.title) {
    // Final fallback if no translations found or title is missing
    return {
      ...action,
      title: "Untitled Action",
      description: "",
      objectives: "",
      steps: "",
    };
  }

  return {
    ...action,
    ...translation,
  };
}

// Helper function to create a new translatable action
export function createTranslatableAction(
  baseAction: Omit<TranslatableAction, "translations">,
  translations: { [locale: string]: ActionTranslation },
): TranslatableAction {
  return {
    ...baseAction,
    translations,
  };
}

// Helper function to create empty translations for all available locales
export function createEmptyTranslations(locales: string[]): {
  [locale: string]: ActionTranslation;
} {
  const translations: { [locale: string]: ActionTranslation } = {};

  locales.forEach((locale) => {
    translations[locale] = {
      title: "",
      description: "",
      objectives: "",
      steps: "",
    };
  });

  return translations;
}
