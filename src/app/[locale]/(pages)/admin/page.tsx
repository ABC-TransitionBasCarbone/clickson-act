"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Edit, School, Trash2, Users } from "lucide-react";
import { useTranslations } from "next-intl";

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface SchoolData {
  id: string;
  name: string;
  address: string;
  teacherInCharge: Teacher | null;
  studentCount: number;
}

const AdminDashboard: React.FC = () => {
  const t = useTranslations("AdminDashboard");

  const [schools, setSchools] = useState<SchoolData[]>([
    {
      id: "1",
      name: "Greenwood Elementary",
      address: "123 Oak Street, Springfield",
      teacherInCharge: {
        id: "t1",
        name: "Mrs. Johnson",
        email: "johnson@greenwood.edu",
      },
      studentCount: 245,
    },
    {
      id: "2",
      name: "Riverside High School",
      address: "456 River Road, Springfield",
      teacherInCharge: {
        id: "t2",
        name: "Mr. Davis",
        email: "davis@riverside.edu",
      },
      studentCount: 890,
    },
    {
      id: "3",
      name: "Sunset Middle School",
      address: "789 Sunset Avenue, Springfield",
      teacherInCharge: null,
      studentCount: 567,
    },
  ]);

  const [teachers] = useState<Teacher[]>([
    { id: "t1", name: "Mrs. Johnson", email: "johnson@greenwood.edu" },
    { id: "t2", name: "Mr. Davis", email: "davis@riverside.edu" },
    { id: "t3", name: "Ms. Rodriguez", email: "rodriguez@schools.edu" },
    { id: "t4", name: "Mr. Thompson", email: "thompson@schools.edu" },
    { id: "t5", name: "Mrs. Wilson", email: "wilson@schools.edu" },
  ]);

  const [editingSchool, setEditingSchool] = useState<SchoolData | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openEditModal = (school: SchoolData) => {
    setEditingSchool(school);
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
    setEditingSchool(null);
  };

  const handleDeleteSchool = (id: string) => {
    setSchools((prev) => prev.filter((s) => s.id !== id));
  };

  const handleEditSchool = () => {
    if (!editingSchool) return;
    setSchools((prev) =>
      prev.map((s) => (s.id === editingSchool.id ? editingSchool : s)),
    );
    closeModal();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
            <p className="mt-2 text-gray-600">{t("description")}</p>
          </div>
        </div>

        {/* Modal */}
        <dialog ref={dialogRef} className="modal">
          <form method="dialog" className="modal-box">
            <h3 className="mb-4 text-lg font-bold">{t("editTitle")}</h3>

            {editingSchool && (
              <>
                <div className="mb-4">
                  <label className="mb-1 block">{t("name")}</label>
                  <input
                    type="text"
                    value={editingSchool.name}
                    onChange={(e) =>
                      setEditingSchool({
                        ...editingSchool,
                        name: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1 block">{t("address")}</label>
                  <input
                    type="text"
                    value={editingSchool.address}
                    onChange={(e) =>
                      setEditingSchool({
                        ...editingSchool,
                        address: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1 block">{t("teacher")}</label>
                  <select
                    value={editingSchool.teacherInCharge?.id || "none"}
                    onChange={(e) => {
                      const teacher =
                        teachers.find((t) => t.id === e.target.value) || null;
                      setEditingSchool({
                        ...editingSchool,
                        teacherInCharge: teacher,
                      });
                    }}
                    className="select select-bordered w-full"
                  >
                    <option value="none">{t("none")}</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="mb-1 block">{t("studentCount")}</label>
                  <input
                    type="number"
                    value={editingSchool.studentCount}
                    onChange={(e) =>
                      setEditingSchool({
                        ...editingSchool,
                        studentCount: Number(e.target.value),
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={closeModal}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleEditSchool}
                  >
                    {t("update")}
                  </button>
                </div>
              </>
            )}
          </form>
        </dialog>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full bg-white">
            <thead>
              <tr className="text-left">
                <th className="p-3 font-medium text-gray-400">{t("name")}</th>
                <th className="p-3 font-medium text-gray-400">
                  {t("address")}
                </th>
                <th className="p-3 font-medium text-gray-400">
                  {t("students")}
                </th>
                <th className="p-3 font-medium text-gray-400">
                  {t("teacher")}
                </th>
                <th className="p-3 font-medium text-gray-400">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id} className="border-t border-gray-200">
                  <td className="p-3">
                    <span className="flex items-center justify-start gap-2.5">
                      <School className="text-primary h-5 w-5" />
                      {school.name}
                    </span>
                  </td>
                  <td className="p-3">{school.address}</td>
                  <td className="p-3">
                    <span className="flex items-center justify-start gap-2.5">
                      <Users className="h-5 w-5 text-gray-400" />
                      {school.studentCount}
                    </span>
                  </td>
                  <td className="p-3">{school.teacherInCharge?.name || "-"}</td>
                  <td className="p-3">
                    <span className="flex items-center justify-start gap-2.5">
                      <button
                        onClick={() => openEditModal(school)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={t("edit")}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteSchool(school.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={t("delete")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
