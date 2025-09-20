import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Action } from "@/types/Action";
import { authenticatedFetch } from "@/lib/auth-utils";
import { useUser } from "@/context/UserContext";

export const useActions = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const locale = useLocale();

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always use public API for consistent action format
        // This ensures both teachers and students get the same Action objects
        // with processed titles, descriptions, etc.
        try {
          const publicResponse = await fetch(
            `/api/actions/public?locale=${locale}`,
          );
          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            if (
              publicData.success &&
              Array.isArray(publicData.actions) &&
              publicData.actions.length > 0
            ) {
              console.log(
                `Loaded ${publicData.actions.length} action templates from public API for locale ${locale}`,
              );
              setActions(publicData.actions);
              return;
            }
          }
        } catch (publicError) {
          console.warn("Public actions API failed:", publicError);
        }

        // No fallback to static file - database should be the source of truth
        console.warn("Public actions API returned no data from database");
        setActions([]);
      } catch (err) {
        console.error("Error fetching actions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch actions",
        );

        // No fallback to static file - database is the only source
        console.error(
          "All database sources failed, no action templates available",
        );
        setActions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [user, locale]);

  return { actions, loading, error, refetch: () => window.location.reload() };
};
