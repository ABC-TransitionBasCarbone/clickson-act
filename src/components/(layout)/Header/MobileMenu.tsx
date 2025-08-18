import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/context/UserContext";
import { User, LogOut, LayoutDashboard, Users } from "lucide-react";
import NavLinks from "./NavLinks";

const MobileMenu = ({
  isOpen,
  onClose,
  setShowLogoutModal,
}: {
  isOpen: boolean;
  onClose: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
}) => {
  const { user } = useUser();

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, display: "none" }}
        transition={{ duration: 0.5 }}
        className="absolute top-12 left-0 z-50 m-2.5 w-[calc(100vw-20px)] rounded-xl bg-gray-100 p-4 lg:hidden"
        onClick={onClose}
      >
        <div className="flex h-full flex-col">
          <NavLinks className="flex-col" />

          {/* User/Auth section at bottom */}
          {user ? (
            <div className="mt-5 rounded-lg border border-gray-200 bg-white">
              {/* User info */}
              <div className="flex items-center gap-2 p-3 py-3">
                <User size={16} className="text-primary" />
                <span className="text-primary font-bold">{user.username}</span>
              </div>

              {/* User actions */}
              <div className="space-y-1s pb-2.5">
                {(user.role === "teacher" || user.role === "admin") && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                    onClick={() => onClose()}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                    onClick={() => onClose()}
                  >
                    <LayoutDashboard size={16} />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setShowLogoutModal(true);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-gray-200 bg-white">
              {/* Auth options */}
              <div className="p-3">
                <h3 className="mb-3 text-sm font-medium text-gray-700">
                  Login/Connect
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const modal = document.getElementById(
                        "login",
                      ) as HTMLDialogElement;
                      if (modal) modal.showModal();
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <User size={16} />
                    Teacher
                  </button>
                  <button
                    onClick={() => {
                      const modal = document.getElementById(
                        "passcode",
                      ) as HTMLDialogElement;
                      if (modal) modal.showModal();
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Users size={16} />
                    Student
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      {/* Backdrop to close menu */}
      <div
        onClick={onClose}
        className="fixed top-0 left-0 z-40 h-full w-full bg-black/30 lg:hidden"
      />
    </>
  );
};

export default MobileMenu;
