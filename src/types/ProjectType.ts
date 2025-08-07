type Action = {
  name: string;
  date: string;
  reduction: number;
};

type Project = {
  id: string;
  name: string;
  schoolId: string;
  startDate: string;
  subGoalDeadline: string;
  subGoalReductionAmount: number;
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
