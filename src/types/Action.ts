export interface Action {
  id: string;
  category: string;
  title: string;
  description: string;
  reduction: number;
  effort: string;
  manager: string;
  nature: string;
  objectives: string;
  keyContacts: string;
  steps: string;
  calendar: string;
  indicators: string;
  monitoring: string;
  performance: string;
  date: string;
  type?: "Direct" | "Indirect"; // Type of impact from action template
  timeline?: number; // Number of years the action will take place
  pendingChanges?: {
    steps?: string;
    monitoring?: string;
    performance?: string;
    keyContacts?: string;
    changedBy?: string;
    changedAt?: string;
  };
  needsApproval?: boolean;
}
