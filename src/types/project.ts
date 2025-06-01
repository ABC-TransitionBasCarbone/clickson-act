type Action = {
  name: string;
  date: string;
  reduction: number;
};

type Project = {
  id: string;
  name: string;
  school: string;
  students: number;
  startDate: string;
  subGoalDate: string;
  finalGoalDate: string;
  subgoal: number;
  finalGoal: number;
  status: "active" | "completed" | "pending";
  emissions: number;
  reduction: number;
  description: string;
  actions: Action[];
};

export default Project;
