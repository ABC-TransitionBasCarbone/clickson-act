// School document structure in the "schools" collection
// Each school is a document with a random ID containing name, goal, and deadline
export interface School {
  id: string;
  name: string;
  goal: number;
  deadlineYear: string;
  createdAt: string;
}
