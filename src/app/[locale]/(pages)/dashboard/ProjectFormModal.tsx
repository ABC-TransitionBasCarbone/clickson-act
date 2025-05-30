import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import ProjectForm from "@/types/ProjectForm";

interface ProjectFormModalProps {
  form: ProjectForm;
  setForm: React.Dispatch<React.SetStateAction<ProjectForm>>;
  onClose: () => void;
  onSubmit: () => void;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  form,
  setForm,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations("TeacherDashboard");
  const [showSubGoals, setShowSubGoals] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold">{t("createNewProject")}</h3>
        <div className="space-y-4 py-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="label">
              <span className="label-text">{t("projectNameLabel")}</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder={t("projectNamePlaceholder")}
            />
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="label">
              <span className="label-text">{t("startDateLabel")}</span>
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          {/* Final Goal */}
          <div>
            <label htmlFor="finalGoal" className="label">
              <span className="label-text">{t("finalGoalLabel")}</span>
            </label>
            <input
              id="finalGoal"
              name="finalGoal"
              type="date"
              value={form.finalGoal}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          {/* Goals Reduction Amount */}
          <div>
            <label htmlFor="goalReductionAmount" className="label">
              <span className="label-text">
                {t("goalReductionAmountLabel")}
              </span>
            </label>
            <input
              id="goalReductionAmount"
              name="goalReductionAmount"
              type="text"
              value={form.goalReductionAmount}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder={t("goalReductionAmountPlaceholder")}
            />
          </div>

          {/* Toggle Sub Goals Button */}
          <button
            type="button"
            className="text-primary-600 flex items-center hover:underline"
            onClick={() => setShowSubGoals(!showSubGoals)}
            aria-expanded={showSubGoals}
          >
            <ChevronDown
              className={`mr-1 transition-transform ${showSubGoals ? "rotate-180" : ""}`}
            />
            {t("addSubGoal")}
          </button>

          {/* Sub Goal Fields - both together */}
          {showSubGoals && (
            <div className="mt-2 space-y-4">
              <div>
                <label htmlFor="subGoal" className="label">
                  <span className="label-text">{t("subGoalLabel")}</span>
                </label>
                <input
                  id="subGoal"
                  name="subGoal"
                  type="date"
                  value={form.subGoal}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label htmlFor="reductionSubGoal" className="label">
                  <span className="label-text">
                    {t("subGoalReductionLabel")}
                  </span>
                </label>
                <input
                  id="reductionSubGoal"
                  name="reductionSubGoal"
                  type="text"
                  value={form.reductionSubGoal}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder={t("subGoalReductionPlaceholder")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn">
            {t("cancel")}
          </button>
          <button onClick={onSubmit} className="btn btn-primary">
            {t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
};
