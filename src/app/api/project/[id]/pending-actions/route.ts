import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import { PendingAction } from "../../../../../types/PendingAction";
import { ActionTranslation } from "../../../../../types/TranslatableAction";
import {
  withSecurity,
  SecurityContext,
  sanitizeInput,
} from "../../../../../lib/security-middleware";

// Get pending actions for a project (for teachers)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleGet(req: NextRequest, _context: SecurityContext) {
  try {
    // Extract project ID from URL since we're not using auth context
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const projectId = pathParts[pathParts.length - 2]; // Get the project ID from the URL

    // Get all pending actions for this project
    // Note: If this fails with index error, we'll fall back to getting all and filtering
    let pendingActionsSnapshot;
    try {
      pendingActionsSnapshot = await adminDb
        .collection("projects")
        .doc(projectId)
        .collection("pendingActions")
        .where("status", "==", "pending")
        .orderBy("submittedAt", "desc")
        .get();
    } catch (indexError) {
      // Only log in development with verbose logging enabled
      if (
        process.env.NODE_ENV === "development" &&
        process.env.VERBOSE_LOGGING === "true"
      ) {
        console.warn(
          "Index not available, falling back to simple query:",
          indexError,
        );
      }
      // Fallback: get all pending actions without ordering
      pendingActionsSnapshot = await adminDb
        .collection("projects")
        .doc(projectId)
        .collection("pendingActions")
        .where("status", "==", "pending")
        .get();
    }

    const pendingActions: PendingAction[] = pendingActionsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as PendingAction,
    );

    return NextResponse.json({
      success: true,
      pendingActions,
      count: pendingActions.length,
    });
  } catch (error) {
    console.error("Error fetching pending actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending actions" },
      { status: 500 },
    );
  }
}

// Approve or reject a pending action (for teachers)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handlePatch(req: NextRequest, _context: SecurityContext) {
  try {
    // Extract project ID from URL since we're not using auth context
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const projectId = pathParts[pathParts.length - 2]; // Get the project ID from the URL

    const body = await req.json();
    const sanitizedBody = sanitizeInput(body) as {
      pendingActionId?: string;
      action?: string;
      teacherId?: string;
      reviewNotes?: string;
    };
    const { pendingActionId, action, teacherId, reviewNotes } = sanitizedBody;

    // Validate input
    if (!pendingActionId || !action || !teacherId) {
      return NextResponse.json(
        {
          error: "Missing required fields: pendingActionId, action, teacherId",
        },
        { status: 400 },
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be either 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    // Get the pending action
    const pendingActionDoc = await adminDb
      .collection("projects")
      .doc(projectId)
      .collection("pendingActions")
      .doc(pendingActionId)
      .get();

    if (!pendingActionDoc.exists) {
      return NextResponse.json(
        { error: "Pending action not found" },
        { status: 404 },
      );
    }

    const pendingAction = pendingActionDoc.data() as PendingAction;

    if (pendingAction.status !== "pending") {
      return NextResponse.json(
        { error: "This action has already been reviewed" },
        { status: 400 },
      );
    }

    const currentDate = new Date().toISOString();

    if (action === "approve") {
      // Create the actual project action from the pending action
      const projectActionId = uuidv4();

      // Determine the action template data or custom action data
      let actionTemplate = null;
      let translation = {};

      if (pendingAction.actionType !== "Custom") {
        // Get the action template from database
        const actionTemplateDoc = await adminDb
          .collection("admin-action-templates")
          .doc(pendingAction.actionId)
          .get();

        if (actionTemplateDoc.exists) {
          actionTemplate = actionTemplateDoc.data();
          const locale = "en"; // Default to English, could be made dynamic

          // Get translation for the action
          translation =
            actionTemplate?.translations?.[locale] ||
            actionTemplate?.translations?.["en"] ||
            Object.values(actionTemplate?.translations || {})[0] ||
            {};

          // Only log in development with verbose logging enabled
          if (
            process.env.NODE_ENV === "development" &&
            process.env.VERBOSE_LOGGING === "true"
          ) {
            console.log(
              `Approving action template for ${pendingAction.actionId}:`,
              {
                title:
                  (translation as ActionTranslation).title ||
                  actionTemplate?.title,
                description:
                  (translation as ActionTranslation).description ||
                  actionTemplate?.description,
                hasTranslations: !!actionTemplate?.translations,
                availableLocales: actionTemplate?.translations
                  ? Object.keys(actionTemplate.translations)
                  : [],
              },
            );
          }
        }
      }

      const isCustomAction = pendingAction.actionType === "Custom";
      const customData = pendingAction.customActionData;

      const resolvedType: "Direct" | "Indirect" =
        isCustomAction
          ? customData?.type === "Indirect"
            ? "Indirect"
            : "Direct"
          : pendingAction.actionType === "Indirect"
            ? "Indirect"
            : "Direct";

      // Create project action with all required fields
      const projectAction = {
        id: projectActionId,
        actionTemplateId:
          isCustomAction ? "custom" : pendingAction.actionId,
        projectId,
        studentId: pendingAction.studentId,
        studentName: pendingAction.studentName,

        // Core action fields (from Action type)
        title:
          pendingAction.actionTitle ||
          (translation as ActionTranslation).title ||
          actionTemplate?.title ||
          "Untitled Action",
        description:
          pendingAction.actionDescription ||
          (translation as ActionTranslation).description ||
          actionTemplate?.description ||
          "",
        category: pendingAction.categoryData.categoryId,
        subcategory: isCustomAction
          ? customData?.subcategory || pendingAction.subcategory || ""
          : pendingAction.subcategory || actionTemplate?.subcategory || "",
        reduction:
          isCustomAction
            ? customData?.reduction || 0
            : Number(actionTemplate?.reduction) || 0, // Original template reduction
        calculatedReduction: pendingAction.calculatedReduction, // Calculated reduction based on category/subcategory
        effort:
          isCustomAction ? customData?.effort || "Medium" : actionTemplate?.effort || "Medium",
        manager: isCustomAction
          ? customData?.manager || pendingAction.studentName
          : pendingAction.studentName,
        assignedTo: isCustomAction
          ? customData?.assignedTo || ""
          : actionTemplate?.assignedTo || "",
        nature: isCustomAction
          ? customData?.nature || pendingAction.categoryData.categoryName
          : actionTemplate?.nature || pendingAction.categoryData.categoryName,
        objectives:
          isCustomAction
            ? customData?.objectives || pendingAction.actionDescription
            : (translation as ActionTranslation).objectives ||
              actionTemplate?.objectives ||
              "",
        keyContacts: isCustomAction
          ? customData?.keyContacts || ""
          : actionTemplate?.keyContacts || "",
        steps: isCustomAction
          ? customData?.steps || ""
          : (translation as ActionTranslation).steps ||
            actionTemplate?.steps ||
            "",
        calendar: isCustomAction
          ? customData?.calendar || currentDate.split("T")[0]
          : actionTemplate?.calendar || currentDate.split("T")[0],
        indicators: isCustomAction
          ? customData?.indicators || ""
          : actionTemplate?.indicators || "",
        monitoring: isCustomAction
          ? customData?.monitoring || ""
          : actionTemplate?.monitoring || "",
        performance: isCustomAction
          ? customData?.performance || ""
          : actionTemplate?.performance || "",
        date: currentDate.split("T")[0], // Date in YYYY-MM-DD format
        timeline:
          isCustomAction
            ? customData?.timeline || 1
            : Number(actionTemplate?.timeline) || 1, // Number of years the action will take place

        // Project-specific fields
        type: resolvedType,
        status: "Available",
        selected: false,
        dateAdded: currentDate,
        notes: reviewNotes || "",

        // Store category context if provided
        categoryContext: {
          categoryId: pendingAction.categoryData.categoryId,
          categoryName: pendingAction.categoryData.categoryName,
          subcategoryData:
            pendingAction.categoryData.subcategoryData?.length
              ? pendingAction.categoryData.subcategoryData
              : pendingAction.subcategory
                ? [
                    {
                      subcategoryId: pendingAction.subcategory,
                      subcategoryName: pendingAction.subcategory,
                      value: "",
                    },
                  ]
                : [],
        },
      };

      // Add to project's actions subcollection
      await adminDb
        .collection("projects")
        .doc(projectId)
        .collection("actions")
        .doc(projectActionId)
        .set(projectAction);
    }

    // Update the pending action status
    await adminDb
      .collection("projects")
      .doc(projectId)
      .collection("pendingActions")
      .doc(pendingActionId)
      .update({
        status: action === "approve" ? "approved" : "rejected",
        reviewedAt: currentDate,
        reviewedBy: teacherId,
        reviewNotes: reviewNotes || "",
      });

    return NextResponse.json({
      success: true,
      message: `Action ${action === "approve" ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    console.error("Error reviewing pending action:", error);
    return NextResponse.json(
      { error: "Failed to review pending action" },
      { status: 500 },
    );
  }
}

// Export handlers with security middleware
export async function GET(req: NextRequest) {
  const securityHandler = withSecurity(handleGet, {
    requireAuth: false, // Temporarily disabled for testing
    requireTeacherAccess: false,
    rateLimit: { maxRequests: 100, windowMs: 60000 },
  });

  // Create a mock SecurityContext since we're not using auth
  const mockContext: SecurityContext = {
    uid: "mock",
    email: "mock@example.com",
  };

  return securityHandler(req, mockContext);
}

export async function PATCH(req: NextRequest) {
  const securityHandler = withSecurity(handlePatch, {
    requireAuth: false, // Temporarily disabled for testing
    requireTeacherAccess: false,
    rateLimit: { maxRequests: 20, windowMs: 60000 },
  });

  // Create a mock SecurityContext since we're not using auth
  const mockContext: SecurityContext = {
    uid: "mock",
    email: "mock@example.com",
  };

  return securityHandler(req, mockContext);
}
