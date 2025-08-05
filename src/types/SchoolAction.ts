// Separate file for SchoolAction type for better organization
export interface SchoolAction {
  id: string;
  adminActionId: string; // Reference to the original admin action
  schoolId: string;
  // School-specific implementation fields
  manager: string;
  keyContacts: string;
  calendar: string;
  indicators: string;
  monitoring: string;
  performance: string;
  status: "Available" | "Selected" | "Completed";
  assignedTo?: string;
  selected: boolean;
  dateAssigned: string;
  dateCompleted?: string;
  // Optional notes from the school
  notes?: string;
}

// Helper function to create a new school action from an admin action
export function createSchoolActionFromAdmin(
  adminActionId: string,
  schoolId: string,
): Omit<SchoolAction, "id" | "dateAssigned"> {
  return {
    adminActionId,
    schoolId,
    manager: "",
    keyContacts: "",
    calendar: "",
    indicators: "",
    monitoring: "",
    performance: "",
    status: "Available",
    selected: false,
    notes: "",
  };
}
