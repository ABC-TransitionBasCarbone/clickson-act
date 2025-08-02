"use client";

import { useState } from "react";

export default function SchoolMigrationUtil() {
  const [initLoading, setInitLoading] = useState(false);
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [results, setResults] = useState<{
    type: string;
    data?: unknown;
    error?: string;
  } | null>(null);

  const initializeSchools = async () => {
    setInitLoading(true);
    setResults(null);
    try {
      const response = await fetch("/api/schools/init", {
        method: "POST",
      });
      const data = await response.json();
      setResults({ type: "init", data });
    } catch {
      setResults({ type: "error", error: "Failed to initialize schools" });
    } finally {
      setInitLoading(false);
    }
  };

  const migrateTeachers = async () => {
    setMigrateLoading(true);
    setResults(null);
    try {
      const response = await fetch("/api/teachers/migrate-schoolid", {
        method: "POST",
      });
      const data = await response.json();
      setResults({ type: "migrate", data });
    } catch {
      setResults({ type: "error", error: "Failed to migrate teachers" });
    } finally {
      setMigrateLoading(false);
    }
  };

  return (
    <div className="bg-white shadow mb-6 p-6 rounded-lg">
      <h3 className="mb-4 font-semibold text-lg">School Migration Utilities</h3>

      <div className="space-y-4">
        <div>
          <h4 className="mb-2 font-medium">1. Initialize Default Schools</h4>
          <p className="mb-2 text-gray-600 text-sm">
            Creates School A, B, and C in the database if they don&apos;t exist.
          </p>
          <button
            onClick={initializeSchools}
            disabled={initLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-4 py-2 rounded text-white"
          >
            {initLoading ? "Initializing..." : "Initialize Schools"}
          </button>
        </div>

        <div>
          <h4 className="mb-2 font-medium">2. Migrate Teachers</h4>
          <p className="mb-2 text-gray-600 text-sm">
            Links existing teachers to their schools by adding schoolId
            references.
          </p>
          <button
            onClick={migrateTeachers}
            disabled={migrateLoading}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 px-4 py-2 rounded text-white"
          >
            {migrateLoading ? "Migrating..." : "Migrate Teachers"}
          </button>
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 mt-6 p-4 rounded">
          <h4 className="mb-2 font-medium">Results:</h4>
          {results.type === "error" ? (
            <div className="text-red-600">{results.error}</div>
          ) : (
            <pre className="overflow-auto text-sm">
              {JSON.stringify(results.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
