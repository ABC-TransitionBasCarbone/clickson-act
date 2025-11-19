// Types for student actions pending teacher approval

export interface PendingAction {
  id: string;
  projectId: string;
  studentId: string;
  studentName: string;
  actionId: string; // Reference to the action template
  actionTitle: string;
  actionDescription: string;
  actionType: "Direct" | "Indirect" | "Custom";
  calculatedReduction: number;
  subcategory?: string;

  // Category and subcategory selection data
  categoryData: {
    categoryId: string;
    categoryName: string;
    subcategoryData?: {
      subcategoryId: string;
      subcategoryName: string;
      value: string; // User-entered percentage value
    }[];
  };

  // Custom action data (if actionType is "Custom")
  customActionData?: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    reduction: number;
    effort: string;
    manager?: string;
    assignedTo?: string;
    nature?: string;
    objectives?: string;
    keyContacts?: string;
    steps?: string;
    calendar?: string;
    indicators?: string;
    monitoring?: string;
    performance?: string;
    timeline: number;
    type?: "Direct" | "Indirect";
  };

  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // Teacher ID who reviewed
  reviewNotes?: string;
}

// Helper function to create a pending action from student submission
export function createPendingAction(data: {
  projectId: string;
  studentId: string;
  studentName: string;
  actionId: string;
  actionTitle: string;
  actionDescription: string;
  actionType: "Direct" | "Indirect" | "Custom";
  calculatedReduction: number;
  categoryData: PendingAction["categoryData"];
  customActionData?: PendingAction["customActionData"];
  subcategory?: string;
}): Omit<PendingAction, "id" | "submittedAt"> {
  return {
    ...data,
    status: "pending",
  };
}
