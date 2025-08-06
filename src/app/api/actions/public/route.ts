import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";

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
      const actionData = { id: doc.id, ...doc.data() };

      // Get translation for the requested locale
      const translation =
        actionData.translations?.[locale] ||
        actionData.translations?.["en"] ||
        Object.values(actionData.translations || {})[0] ||
        {};

      return {
        id: actionData.id,
        category: (actionData as any).category || "",
        title: translation.title || "Untitled Action",
        description: translation.description || "",
        reduction: Number((actionData as any).reduction) || 0,
        effort: (actionData as any).effort || "Medium",
        manager: translation.manager || "",
        nature: (actionData as any).category || "",
        objectives: translation.objectives || "",
        keyContacts: translation.keyContacts || "",
        steps: translation.steps || "",
        calendar: translation.calendar || "",
        indicators: translation.indicators || "",
        monitoring: translation.monitoring || "",
        performance: translation.performance || "",
        date:
          (actionData as any).date || new Date().toISOString().split("T")[0],
        type: (actionData as any).type || "Fixed", // Include type from action template
        subcategory: (actionData as any).subcategory || undefined, // Optional subcategory field
        timeline: Number((actionData as any).timeline) || 1, // Number of years the action will take place
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
