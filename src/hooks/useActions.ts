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

        let response: Response;

        // Check if user has authentication (admin/teacher) or is a student
        if (user && user.token && !user.passcode) {
          // User is admin/teacher with token, try authenticated API
          try {
            response = await authenticatedFetch("/api/actions");
          } catch (authError) {
            console.warn(
              "Authenticated actions API failed, falling back to public API:",
              authError,
            );
            // Fall back to public API
            const publicResponse = await fetch(
              `/api/actions/public?locale=${locale}`,
            );
            if (!publicResponse.ok) {
              throw new Error(
                "Failed to fetch actions from both authenticated and public APIs",
              );
            }
            const publicData = await publicResponse.json();
            if (publicData.success && Array.isArray(publicData.actions)) {
              setActions(publicData.actions);
              return;
            } else {
              throw new Error("Invalid response from public actions API");
            }
          }
        } else {
          // User is a student or not authenticated, try public API first
          console.info(
            "Fetching action templates from public API for student/unauthenticated user",
          );
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
                  `Loaded ${publicData.actions.length} action templates from database`,
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
          return;
        }

        if (!response.ok) {
          // If authenticated API fails, fall back to public API
          console.warn(
            "Authenticated API returned error, falling back to public API",
          );
          const publicResponse = await fetch(
            `/api/actions/public?locale=${locale}`,
          );
          if (!publicResponse.ok) {
            throw new Error(
              "Failed to fetch actions from both authenticated and public APIs",
            );
          }
          const publicData = await publicResponse.json();
          if (publicData.success && Array.isArray(publicData.actions)) {
            setActions(publicData.actions);
            return;
          } else {
            throw new Error("Invalid response from public actions API");
          }
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.actions)) {
          throw new Error("Invalid response format from actions API");
        }

        console.log(
          `Loaded ${data.actions.length} action templates from authenticated API`,
        );
        setActions(data.actions);
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
