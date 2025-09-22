import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import { PendingAction } from "../../../../../types/PendingAction";
import { ActionTranslation } from "../../../../../types/TranslatableAction";

// Get pending actions for a project (for teachers)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

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
      console.warn(
        "Index not available, falling back to simple query:",
        indexError,
      );
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
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const { pendingActionId, action, teacherId, reviewNotes } = body;

    // Validate input
    if (!projectId || !pendingActionId || !action || !teacherId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: projectId, pendingActionId, action, teacherId",
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

      // Create project action with all required fields
      const projectAction = {
        id: projectActionId,
        actionTemplateId:
          pendingAction.actionType === "Custom"
            ? "custom"
            : pendingAction.actionId,
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
        reduction:
          pendingAction.actionType === "Custom"
            ? pendingAction.customActionData?.reduction || 0
            : Number(actionTemplate?.reduction) || 0, // Original template reduction
        calculatedReduction: pendingAction.calculatedReduction, // Calculated reduction based on category/subcategory
        effort:
          pendingAction.actionType === "Custom"
            ? pendingAction.customActionData?.effort || "Medium"
            : actionTemplate?.effort || "Medium",
        manager: pendingAction.studentName, // Student name as manager
        nature: pendingAction.categoryData.categoryName,
        objectives:
          pendingAction.actionType === "Custom"
            ? pendingAction.actionDescription
            : (translation as ActionTranslation).objectives || "",
        keyContacts: "",
        steps: (translation as ActionTranslation).steps || "",
        calendar: "",
        indicators: "",
        monitoring: "",
        performance: "",
        date: currentDate.split("T")[0], // Date in YYYY-MM-DD format
        timeline:
          pendingAction.actionType === "Custom"
            ? pendingAction.customActionData?.timeline || 1
            : Number(actionTemplate?.timeline) || 1, // Number of years the action will take place

        // Project-specific fields
        type: pendingAction.actionType,
        status: "Available",
        selected: false,
        dateAdded: currentDate,
        notes: reviewNotes || "",

        // Store category context if provided
        categoryContext: {
          categoryId: pendingAction.categoryData.categoryId,
          categoryName: pendingAction.categoryData.categoryName,
          subcategoryData: pendingAction.categoryData.subcategoryData || [],
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
