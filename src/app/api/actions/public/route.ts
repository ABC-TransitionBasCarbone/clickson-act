import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";

interface ActionTemplateData {
  id: string;
  category?: string;
  reduction?: number;
  effort?: string;
  date?: string;
  type?: string;
  subcategory?: string;
  timeline?: number;
  translations?: Record<
    string,
    {
      title?: string;
      description?: string;
      manager?: string;
      objectives?: string;
      keyContacts?: string;
      steps?: string;
      calendar?: string;
      indicators?: string;
      monitoring?: string;
      performance?: string;
    }
  >;
}

// Public endpoint to get action templates for students
// This endpoint doesn't require authentication and returns action templates
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    // Fetch from the same collection as the authenticated API
    const actionsSnapshot = await adminDb
      .collection("admin-action-templates")
      .get();

    if (actionsSnapshot.empty) {
      // No actions in database, return empty array
      console.warn(
        "[PUBLIC ACTIONS API] No action templates found in database",
      );
      return NextResponse.json({
        success: true,
        actions: [],
        message:
          "No action templates found in database. Please add some through the admin panel.",
      });
    }

    // Process translatable actions from database
    const actions = actionsSnapshot.docs.map((doc) => {
      const actionData = { id: doc.id, ...doc.data() } as ActionTemplateData;

      // Get translation for the requested locale
      const translation =
        actionData.translations?.[locale] ||
        actionData.translations?.["en"] ||
        Object.values(actionData.translations || {})[0] ||
        {};

      return {
        id: actionData.id,
        category: actionData.category || "",
        title: translation.title || "Untitled Action",
        description: translation.description || "",
        reduction: Number(actionData.reduction) || 0,
        effort: actionData.effort || "Medium",
        manager: translation.manager || "",
        nature: actionData.category || "",
        objectives: translation.objectives || "",
        keyContacts: translation.keyContacts || "",
        steps: translation.steps || "",
        calendar: translation.calendar || "",
        indicators: translation.indicators || "",
        monitoring: translation.monitoring || "",
        performance: translation.performance || "",
        date: actionData.date || new Date().toISOString().split("T")[0],
        type: actionData.type || "Fixed", // Include type from action template
        subcategory: actionData.subcategory || undefined, // Optional subcategory field
        timeline: Number(actionData.timeline) || 1, // Number of years the action will take place
      };
    });

    console.log(
      `[PUBLIC ACTIONS API] Loaded ${actions.length} action templates for locale ${locale}`,
    );

    return NextResponse.json({
      success: true,
      actions: actions,
    });
  } catch (error: unknown) {
    console.error("Error fetching public action templates:", error);
    return NextResponse.json(
      {
        success: false,
        actions: [],
        error: "Failed to fetch action templates. Please try again.",
      },
      { status: 500 },
    );
  }
}
