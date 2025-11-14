"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface LoadingStateProps {
  /**
   * The translation key for the loading message
   * If not provided, defaults to "loadingProjects"
   */
  messageKey?: string;

  /**
   * Translation namespace. Defaults to "DataReporting"
   */
  namespace?: string;

  /**
   * Custom message text. If provided, overrides translation
   */
  message?: string;

  /**
   * Size of the spinner: "small" | "medium" | "large"
   * Defaults to "large"
   */
  spinnerSize?: "small" | "medium" | "large";
}

const LoadingState: React.FC<LoadingStateProps> = ({
  messageKey = "loadingProjects",
  namespace = "DataReporting",
  message,
  spinnerSize = "large",
}) => {
  const t = useTranslations(namespace);

  // Get message from translation or use custom message
  const loadingMessage = message || t(messageKey);

  // Spinner size and border classes - consistent styling for all sizes
  const spinnerClasses = {
    small: "h-8 w-8 border-4 border-gray-300 border-t-primary",
    medium: "h-16 w-16 border-4 border-gray-300 border-t-primary",
    large: "h-32 w-32 border-b-2 border-gray-900",
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="pt-8 text-center">
        <div
          className={`mx-auto animate-spin rounded-full ${spinnerClasses[spinnerSize]}`}
        />
        <p className="mt-4 text-gray-600">{loadingMessage}</p>
      </div>
    </div>
  );
};

export default LoadingState;
