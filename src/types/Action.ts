import { ReactNode } from "react";

export interface Action {
  id: string;
  title: string;
  description: string;
  reduction: number;
  icon: ReactNode;
  category: string;
  selected: false;
}
