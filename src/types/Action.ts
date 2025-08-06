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
  type?: "Fixed" | "Dynamic"; // Type from action template
}
