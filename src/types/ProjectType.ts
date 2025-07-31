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
  subGoalDate?: string;
  finalGoalDate?: string;
  subGoal?: string;
  finalGoal?: string;
  subgoal?: number;
  goalReductionAmount: number;
  status: "active" | "completed" | "pending";
  emissions?: number;
  reduction?: number;
  description?: string;
  actions?: Action[];
  teacherId?: string;
  teacherName?: string;
  passcode?: string;
  createdAt?: string;
};

export default Project;
