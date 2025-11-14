"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import LoginForm from "./LoginForm ";
import SignUpForm from "./SignUpForm";
import PassCodeForm from "./PassCodeForm ";

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"teacher" | "student">("teacher");
  const [showRegister, setShowRegister] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
      // Reset state when opening
      setShowRegister(false);
      setActiveTab("teacher");
    } else if (!isOpen && dialogRef.current) {
      dialogRef.current.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    // Reset state when closing
    setShowRegister(false);
    setActiveTab("teacher");
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      id="unified-auth-modal"
      className="modal"
      onClose={handleClose}
    >
      <div className="modal-box flex flex-col gap-5 max-w-md">
        <h3 className="text-lg font-bold">Login / Register</h3>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 -mb-px">
            <button
              onClick={() => {
                setActiveTab("teacher");
                setShowRegister(false);
              }}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "teacher"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => {
                setActiveTab("student");
                setShowRegister(false);
              }}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "student"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Student
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex flex-col gap-4">
          {activeTab === "teacher" ? (
            <>
              {!showRegister ? (
                <>
                  <LoginForm
                    onStayOnPage={true}
                    onLoginSuccess={() => {
                      // Close modal after successful login
                      handleClose();
                    }}
                  />
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link capitalize text-sm"
                      onClick={() => setShowRegister(true)}
                    >
                      Don't have an account? Register
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <SignUpForm
                    onStayOnPage={true}
                    onSignupSuccess={() => {
                      // Close modal after successful registration
                      handleClose();
                    }}
                  />
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link capitalize text-sm"
                      onClick={() => setShowRegister(false)}
                    >
                      Already have an account? Login
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <PassCodeForm
              onStayOnPage={true}
              onLoginSuccess={() => {
                // Close modal after successful login
                handleClose();
              }}
            />
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  );
};

export default UnifiedAuthModal;

