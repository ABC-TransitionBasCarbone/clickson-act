import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

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
  type: "Fixed" | "Dynamic"; // Type from the action template
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

// Add actions to a project
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const {
      actionIds,
      studentName,
      studentId,
      calculatedReduction,
      actionType,
      categoryData,
    } = body;

    // Validate input
    if (
      !projectId ||
      !actionIds ||
      !Array.isArray(actionIds) ||
      actionIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, actionIds" },
        { status: 400 },
      );
    }

    if (!studentName || studentName.trim().length === 0) {
      return NextResponse.json(
        { error: "Student name is required" },
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

    const addedActions: ProjectAction[] = [];
    const errors: string[] = [];

    // Process each action ID
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

        // Check if this action is already added to the project
        const existingActionQuery = await adminDb
          .collection("projects")
          .doc(projectId)
          .collection("actions")
          .where("actionTemplateId", "==", actionId)
          .limit(1)
          .get();

        if (!existingActionQuery.empty) {
          errors.push(
            `Action "${translation.title || "Unknown"}" is already added to this project`,
          );
          continue;
        }

        // Create project action with all required fields
        const projectActionId = uuidv4();
        const currentDate = new Date().toISOString();

        // Use calculated reduction if provided, otherwise use template reduction
        const finalReduction =
          calculatedReduction !== undefined
            ? calculatedReduction
            : Number(actionTemplate?.reduction) || 0;
        const finalActionType = actionType || actionTemplate?.type || "Fixed";

        const projectAction: ProjectAction = {
          id: projectActionId,
          actionTemplateId: actionId,
          projectId,
          studentId: studentId || undefined,
          studentName: studentName.trim(),

          // Core action fields (from Action type)
          title: translation.title || "Untitled Action",
          description: translation.description || "",
          category: actionTemplate?.category || "",
          reduction: Number(actionTemplate?.reduction) || 0, // Original template reduction
          calculatedReduction: finalReduction, // Calculated reduction based on category/subcategory
          effort: actionTemplate?.effort || "Medium",
          manager: studentName.trim(), // Student name as manager
          nature: translation.nature || actionTemplate?.category || "",
          objectives: translation.objectives || "",
          keyContacts: translation.keyContacts || "",
          steps: translation.steps || "",
          calendar: translation.calendar || "",
          indicators: translation.indicators || "",
          monitoring: translation.monitoring || "",
          performance: translation.performance || "",
          date: currentDate.split("T")[0], // Date in YYYY-MM-DD format
          timeline: Number(actionTemplate?.timeline) || 1, // Number of years the action will take place

          // Project-specific fields
          type: finalActionType,
          status: "Available",
          selected: false,
          dateAdded: currentDate,
          notes: "",

          // Store category context if provided
          categoryContext: categoryData
            ? {
                categoryId: categoryData.categoryId,
                categoryName: categoryData.categoryName,
                categoryPercentage: categoryData.categoryPercentage,
                subcategoryData: categoryData.subcategoryData,
              }
            : undefined,
        };

        // Add to project's actions subcollection
        await adminDb
          .collection("projects")
          .doc(projectId)
          .collection("actions")
          .doc(projectActionId)
          .set(projectAction);

        addedActions.push(projectAction);
      } catch (error) {
        console.error(`Error processing action ${actionId}:`, error);
        errors.push(`Failed to add action ${actionId}`);
      }
    }

    // Return results
    return NextResponse.json({
      success: true,
      addedActions,
      addedCount: addedActions.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully added ${addedActions.length} action(s) to monitoring screen`,
    });
  } catch (error) {
    console.error("Error adding actions to project:", error);
    return NextResponse.json(
      { error: "Failed to add actions to project. Please try again." },
      { status: 500 },
    );
  }
}

// Get actions for a project
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
