"use client";

import React from "react";

interface AdminModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({
  id,
  title,
  children,
  onClose,
}) => {
  const handleClose = () => {
    const modal = document.getElementById(id) as HTMLDialogElement;
    if (modal) {
      modal.close();
      onClose?.();
    }
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  );
};

export default AdminModal;
