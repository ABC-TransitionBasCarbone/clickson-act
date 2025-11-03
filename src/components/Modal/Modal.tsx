"use client";

import React from "react";

const Modal = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box flex flex-col gap-5">
        <h3 className="text-lg font-bold">{title}</h3>
        <fieldset className="fieldset flex flex-col">{children}</fieldset>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default Modal;
