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
    setForm((prev) => ({ ...prev, [name]: value }));
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
      const response = await fetch("http://localhost:3000/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        onSubmit();
        onClose();
      } else {
        const errorData = await response.json();
        alert(
          `Error creating project: ${errorData.message || "Unknown error"}`,
        );
      }
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
              className="input-bordered input w-full"
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
              className="input-bordered input w-full"
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
              className="input-bordered input w-full"
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
              className="input-bordered input w-full"
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
