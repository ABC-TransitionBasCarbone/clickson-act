// Input validation and sanitization utilities

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

export function validateName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Name is required" };
  }

  if (name.trim().length > 200) {
    return { isValid: false, error: "Name must be less than 200 characters" };
  }

  if (!/^[\p{L}\p{N}\s\-_.()]+$/u.test(name.trim())) {
    return { isValid: false, error: "Name contains invalid characters" };
  }

  return { isValid: true };
}

export function validateDescription(description: string): {
  isValid: boolean;
  error?: string;
} {
  if (description && description.length > 1000) {
    return {
      isValid: false,
      error: "Description must be less than 1000 characters",
    };
  }

  return { isValid: true };
}

export function validateNumber(
  value: number,
  min: number,
  max: number,
): { isValid: boolean; error?: string } {
  if (isNaN(value) || value < min || value > max) {
    return { isValid: false, error: `Value must be between ${min} and ${max}` };
  }

  return { isValid: true };
}

export function validateYear(year: string): {
  isValid: boolean;
  error?: string;
} {
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(year);

  if (isNaN(yearNum) || yearNum < currentYear || yearNum > currentYear + 50) {
    return {
      isValid: false,
      error: "Year must be between current year and 50 years from now",
    };
  }

  return { isValid: true };
}
