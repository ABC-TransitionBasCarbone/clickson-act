import { useState } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "students" || name === "goalReductionAmount"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.startDate ||
      !form.finalGoal ||
      !form.goalReductionAmount
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit();
      onClose();
    } catch (error) {
      console.error("Error submitting project:", error);
      alert("Error creating project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{t("createNewProject")}</h3>
        <div className="space-y-4 py-4">
          {/* Project Name */}
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
              className="input-bordered w-full input"
              placeholder={t("projectNamePlaceholder")}
              required
            />
          </div>

          {/* School Name */}
          <div>
            <label htmlFor="school" className="label">
              <span className="label-text">{t("schoolNameLabel")}</span>
            </label>
            <input
              id="school"
              name="school"
              type="text"
              value={form.school}
              onChange={handleChange}
              className="input-bordered w-full input"
              placeholder={t("schoolNamePlaceholder")}
              required
            />
          </div>

          {/* Number of Students */}
          <div>
            <label htmlFor="students" className="label">
              <span className="label-text">{t("numberOfStudentsLabel")}</span>
            </label>
            <input
              id="students"
              name="students"
              type="number"
              value={form.students}
              onChange={handleChange}
              className="input-bordered w-full input"
              placeholder={t("numberOfStudentsPlaceholder")}
              min="0"
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
              className="input-bordered w-full input"
            />
          </div>

          {/* Final Goal */}
          <div>
            <label htmlFor="finalGoal" className="label">
              <span className="label-text">{t("subGoalDateLabel")}</span>
            </label>
            <input
              id="finalGoal"
              name="finalGoal"
              type="date"
              value={form.finalGoal}
              onChange={handleChange}
              className="input-bordered w-full input"
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
              type="number"
              value={form.goalReductionAmount}
              onChange={handleChange}
              className="input-bordered w-full input"
              placeholder={t("goalReductionAmountPlaceholder")}
            />
          </div>
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn" disabled={isSubmitting}>
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
};
