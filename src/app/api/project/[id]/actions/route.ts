import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import {
  PendingAction,
  createPendingAction,
} from "../../../../../types/PendingAction";
import {
  withSecurity,
  SecurityContext,
  sanitizeInput,
  validateProjectId,
  validateStudentName,
  validateActionIds,
} from "../../../../../lib/security-middleware";

// ProjectAction interface - actions specific to a project
// Includes all fields from Action type with student as manager
interface ProjectAction {
  id: string;
  actionTemplateId: string; // Reference to the action template
  projectId: string;
  studentId?: string; // Student who added the action
  studentName: string; // Name of the student (manager)

  // Core action fields (from Action type)
  title: string;
  description: string;
  category: string;
  reduction: number; // Original reduction from template
  calculatedReduction: number; // Calculated reduction based on category/subcategory percentages
  effort: string;
  manager: string; // Student name who added the action
  nature: string;
  objectives: string;
  keyContacts: string;
  steps: string;
  calendar: string;
  indicators: string;
  monitoring: string;
  performance: string;
  date: string;
  timeline: number; // Number of years the action will take place

  // Project-specific fields
  type: "Direct" | "Indirect"; // Type of impact from the action template
  status: "Available" | "Selected" | "In Progress" | "Completed";
  selected: boolean;
  dateAdded: string;
  dateCompleted?: string;
  notes?: string;

  // Category and subcategory context data
  categoryContext?: {
    categoryId: string;
    categoryName: string;
    categoryPercentage?: number;
    subcategoryData: {
      id: string;
      name: string;
      value: string;
      percentage?: number;
    }[];
  };
}

// Submit actions to a project for teacher approval (students)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handlePost(req: NextRequest, _context: SecurityContext) {
  try {
    // Extract project ID from URL since we're not using auth context
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const projectId = pathParts[pathParts.length - 2]; // Get the project ID from the URL

    const body = await req.json();

    // Sanitize and validate input
    const sanitizedBody = sanitizeInput(body) as {
      actionIds?: string[];
      studentName?: string;
      studentId?: string;
      calculatedReduction?: number;
      actionType?: string;
      categoryData?: {
        categoryId: string;
        categoryName: string;
        subcategoryData?: Array<{
          subcategoryId: string;
          subcategoryName: string;
          value: string;
        }>;
      };
      customActionData?: {
        title: string;
        description: string;
        reduction: number;
        category: string;
        effort: string;
        timeline: number;
      };
      isTeacherAction?: boolean;
    };
    const {
      actionIds,
      studentName,
      studentId,
      calculatedReduction,
      actionType,
      categoryData,
      customActionData,
      isTeacherAction = false,
    } = sanitizedBody;

    // Validate project ID
    if (!projectId || !validateProjectId(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 },
      );
    }

    // Validate student name
    if (!studentName || !validateStudentName(studentName)) {
      return NextResponse.json(
        { error: "Invalid student name" },
        { status: 400 },
      );
    }

    // Validate action IDs for non-custom actions
    if (!customActionData && (!actionIds || !validateActionIds(actionIds))) {
      return NextResponse.json(
        { error: "Invalid action IDs" },
        { status: 400 },
      );
    }

    // Verify project exists
    const projectDoc = await adminDb
      .collection("projects")
      .doc(projectId)
      .get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const pendingActions: PendingAction[] = [];
    const approvedActions: ProjectAction[] = [];
    const errors: string[] = [];

    // Handle custom action submission
    if (customActionData) {
      try {
        const pendingActionId = uuidv4();
        const currentDate = new Date().toISOString();

        const pendingActionData = createPendingAction({
          projectId,
          studentId: studentId || "",
          studentName: studentName.trim(),
          actionId: "custom", // Special ID for custom actions
          actionTitle: customActionData.title,
          actionDescription: customActionData.description,
          actionType: "Custom",
          calculatedReduction: customActionData.reduction,
          categoryData: {
            categoryId: customActionData.category,
            categoryName: customActionData.category,
          },
          customActionData,
        });

        const pendingAction: PendingAction = {
          id: pendingActionId,
          submittedAt: currentDate,
          ...pendingActionData,
        };

        // Add to project's pending actions subcollection
        await adminDb
          .collection("projects")
          .doc(projectId)
          .collection("pendingActions")
          .doc(pendingActionId)
          .set(pendingAction);

        pendingActions.push(pendingAction);
      } catch (error) {
        console.error("Error processing custom action:", error);
        errors.push("Failed to submit custom action");
      }
    } else {
      // Handle regular action template submissions
      if (!actionIds) {
        return NextResponse.json(
          { error: "Action IDs are required for template submissions" },
          { status: 400 },
        );
      }

      for (const actionId of actionIds) {
        try {
          // Get the action template from database
          const actionTemplateDoc = await adminDb
            .collection("admin-action-templates")
            .doc(actionId)
            .get();

          if (!actionTemplateDoc.exists) {
            errors.push(`Action template ${actionId} not found`);
            continue;
          }

          const actionTemplate = actionTemplateDoc.data();
          const locale = "en"; // Default to English, could be made dynamic

          // Get translation for the action
          const translation =
            actionTemplate?.translations?.[locale] ||
            actionTemplate?.translations?.["en"] ||
            Object.values(actionTemplate?.translations || {})[0] ||
            {};

          // Only log in development with verbose logging enabled
          if (
            process.env.NODE_ENV === "development" &&
            process.env.VERBOSE_LOGGING === "true"
          ) {
            console.log(`Action template for ${actionId}:`, {
              title: translation.title || actionTemplate?.title,
              description:
                translation.description || actionTemplate?.description,
              hasTranslations: !!actionTemplate?.translations,
              availableLocales: actionTemplate?.translations
                ? Object.keys(actionTemplate.translations)
                : [],
            });
          }

          // Check if this action is already pending, approved, or exists in project actions
          const existingPendingQuery = await adminDb
            .collection("projects")
            .doc(projectId)
            .collection("pendingActions")
            .where("actionId", "==", actionId)
            .where("status", "in", ["pending", "approved"])
            .limit(1)
            .get();

          const existingActionQuery = await adminDb
            .collection("projects")
            .doc(projectId)
            .collection("actions")
            .where("actionTemplateId", "==", actionId)
            .limit(1)
            .get();

          if (!existingPendingQuery.empty || !existingActionQuery.empty) {
            errors.push(
              `Action "${translation.title || "Unknown"}" is already submitted, approved, or exists for this project`,
            );
            continue;
          }

          // Use calculated reduction if provided, otherwise use template reduction
          const finalReduction =
            calculatedReduction !== undefined
              ? calculatedReduction
              : Number(actionTemplate?.reduction) || 0;
          const finalActionType =
            actionType || actionTemplate?.type || "Direct";

          const actionId_generated = uuidv4();
          const currentDate = new Date().toISOString();

          if (isTeacherAction) {
            // For teachers, add directly to project actions
            const projectAction: ProjectAction = {
              id: actionId_generated,
              actionTemplateId: actionId,
              projectId,
              studentId: studentId || "",
              studentName: studentName.trim(),
              title:
                translation.title || actionTemplate?.title || "Untitled Action",
              description:
                translation.description || actionTemplate?.description || "",
              category: actionTemplate?.category || "",
              reduction: Number(actionTemplate?.reduction) || 0,
              calculatedReduction: finalReduction,
              effort: actionTemplate?.effort || "",
              manager: studentName.trim(),
              nature: actionTemplate?.nature || "",
              objectives: actionTemplate?.objectives || "",
              keyContacts: actionTemplate?.keyContacts || "",
              steps: actionTemplate?.steps || "",
              calendar: actionTemplate?.calendar || "",
              indicators: actionTemplate?.indicators || "",
              monitoring: actionTemplate?.monitoring || "",
              performance: actionTemplate?.performance || "",
              date: currentDate,
              timeline: Number(actionTemplate?.timeline) || 1,
              type: finalActionType as "Direct" | "Indirect",
              status: "Available",
              selected: false,
              dateAdded: currentDate,
              categoryContext: categoryData
                ? {
                    categoryId: categoryData.categoryId,
                    categoryName: categoryData.categoryName,
                    subcategoryData:
                      categoryData.subcategoryData?.map((sub) => ({
                        id: sub.subcategoryId,
                        name: sub.subcategoryName,
                        value: sub.value,
                      })) || [],
                  }
                : undefined,
            };

            // Add to project's actions subcollection
            await adminDb
              .collection("projects")
              .doc(projectId)
              .collection("actions")
              .doc(actionId_generated)
              .set(projectAction);

            approvedActions.push(projectAction);
          } else {
            // For students, create pending action for teacher approval
            const pendingActionData = createPendingAction({
              projectId,
              studentId: studentId || "",
              studentName: studentName.trim(),
              actionId,
              actionTitle:
                translation.title || actionTemplate?.title || "Untitled Action",
              actionDescription:
                translation.description || actionTemplate?.description || "",
              actionType: finalActionType,
              calculatedReduction: finalReduction,
              categoryData: categoryData || {
                categoryId: actionTemplate?.category || "",
                categoryName: actionTemplate?.category || "",
              },
            });

            const pendingAction: PendingAction = {
              id: actionId_generated,
              submittedAt: currentDate,
              ...pendingActionData,
            };

            // Add to project's pending actions subcollection
            await adminDb
              .collection("projects")
              .doc(projectId)
              .collection("pendingActions")
              .doc(actionId_generated)
              .set(pendingAction);

            pendingActions.push(pendingAction);
          }
        } catch (error) {
          console.error(`Error processing action ${actionId}:`, error);
          errors.push(`Failed to submit action ${actionId}`);
        }
      }
    }

    // Return results
    const totalProcessed = pendingActions.length + approvedActions.length;
    const isTeacher = isTeacherAction;

    return NextResponse.json({
      success: true,
      pendingActions: pendingActions.length > 0 ? pendingActions : undefined,
      approvedActions: approvedActions.length > 0 ? approvedActions : undefined,
      submittedCount: totalProcessed,
      errors: errors.length > 0 ? errors : undefined,
      message: isTeacher
        ? `Successfully added ${totalProcessed} action(s) to monitoring`
        : `Successfully submitted ${totalProcessed} action(s) for teacher approval`,
    });
  } catch (error) {
    console.error("Error submitting actions to project:", error);
    return NextResponse.json(
      { error: "Failed to submit actions to project. Please try again." },
      { status: 500 },
    );
  }
}

// Get actions for a project
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleGet(req: NextRequest, _context: SecurityContext) {
  try {
    // Extract project ID from URL since we're not using auth context
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const projectId = pathParts[pathParts.length - 2]; // Get the project ID from the URL

    // Get all actions for this project
    const actionsSnapshot = await adminDb
      .collection("projects")
      .doc(projectId)
      .collection("actions")
      .orderBy("dateAdded", "desc")
      .get();

    const actions: ProjectAction[] = actionsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ProjectAction,
    );

    return NextResponse.json({
      success: true,
      actions,
      count: actions.length,
    });
  } catch (error) {
    console.error("Error fetching project actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch project actions" },
      { status: 500 },
    );
  }
}

// Update a specific action in a project
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handlePut(req: NextRequest, _context: SecurityContext) {
  try {
    // Extract project ID from URL since we're not using auth context
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const projectId = pathParts[pathParts.length - 2]; // Get the project ID from the URL

    const updateData = await req.json();
    const sanitizedData = sanitizeInput(updateData) as { id?: string };

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    if (!sanitizedData.id) {
      return NextResponse.json(
        { error: "Action ID is required" },
        { status: 400 },
      );
    }

    // Verify project exists
    const projectDoc = await adminDb
      .collection("projects")
      .doc(projectId)
      .get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if action exists in project
    const actionDoc = await adminDb
      .collection("projects")
      .doc(projectId)
      .collection("actions")
      .doc(updateData.id)
      .get();

    if (!actionDoc.exists) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    // Update the action in the project
    await adminDb
      .collection("projects")
      .doc(projectId)
      .collection("actions")
      .doc(updateData.id)
      .update(updateData);

    return NextResponse.json({
      success: true,
      message: "Action updated successfully",
      action: updateData,
    });
  } catch (error) {
    console.error("Error updating project action:", error);
    return NextResponse.json(
      { error: "Failed to update action" },
      { status: 500 },
    );
  }
}

// Delete a specific action from a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(req.url);
    const actionId = searchParams.get("actionId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    if (!actionId) {
      return NextResponse.json(
        { error: "Action ID is required" },
        { status: 400 },
      );
    }

    // Verify project exists
    const projectDoc = await adminDb
      .collection("projects")
      .doc(projectId)
      .get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if action exists in project
    const actionDoc = await adminDb
      .collection("projects")
      .doc(projectId)
      .collection("actions")
      .doc(actionId)
      .get();

    if (!actionDoc.exists) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    // Delete the action from the project
    await adminDb
      .collection("projects")
      .doc(projectId)
      .collection("actions")
      .doc(actionId)
      .delete();

    return NextResponse.json({
      success: true,
      message: "Action deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project action:", error);
    return NextResponse.json(
      { error: "Failed to delete action" },
      { status: 500 },
    );
  }
}

// Export handlers with security middleware
export async function POST(req: NextRequest) {
  const securityHandler = withSecurity(handlePost, {
    requireAuth: false, // Temporarily disabled for testing
    rateLimit: { maxRequests: 20, windowMs: 60000 },
  });

  // Create a mock SecurityContext since we're not using auth
  const mockContext: SecurityContext = {
    uid: "mock",
    email: "mock@example.com",
  };

  return securityHandler(req, mockContext);
}

export async function GET(req: NextRequest) {
  const securityHandler = withSecurity(handleGet, {
    requireAuth: false, // Temporarily disabled for testing
    rateLimit: { maxRequests: 100, windowMs: 60000 },
  });

  // Create a mock SecurityContext since we're not using auth
  const mockContext: SecurityContext = {
    uid: "mock",
    email: "mock@example.com",
  };

  return securityHandler(req, mockContext);
}

export async function PUT(req: NextRequest) {
  const securityHandler = withSecurity(handlePut, {
    requireAuth: false, // Temporarily disabled for testing
    requireTeacherAccess: false,
    rateLimit: { maxRequests: 50, windowMs: 60000 },
  });

  // Create a mock SecurityContext since we're not using auth
  const mockContext: SecurityContext = {
    uid: "mock",
    email: "mock@example.com",
  };

  return securityHandler(req, mockContext);
}
