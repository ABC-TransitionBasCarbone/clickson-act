import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/context/UserContext";
import { User, LogOut, LayoutDashboard, LogIn } from "lucide-react";
import NavLinks from "./NavLinks";

const MobileMenu = ({
  isOpen,
  onClose,
  setShowLogoutModal,
  onOpenAuthModal,
}: {
  isOpen: boolean;
  onClose: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  onOpenAuthModal: () => void;
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
        className="lg:hidden top-22 left-0 z-50 fixed bg-gray-100 m-2.5 p-4 rounded-xl w-[calc(100vw-20px)]"
        onClick={onClose}
      >
        <div className="flex flex-col h-full">
          <NavLinks className="flex-col" />

          {/* User/Auth section at bottom */}
          {user ? (
            <div className="bg-white mt-5 border border-gray-200 rounded-lg">
              {/* User info */}
              <div className="flex items-center gap-2 p-3 py-3">
                <User size={16} className="text-primary" />
                <span className="font-bold text-primary">{user.username}</span>
              </div>

              {/* User actions */}
              <div className="space-y-1s pb-2.5">
                {(user.role === "teacher" || user.role === "admin") && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 hover:bg-gray-100 px-4 py-2 rounded-lg text-gray-700 text-sm transition-colors"
                    onClick={() => onClose()}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 hover:bg-gray-100 px-4 py-2 rounded-lg text-gray-700 text-sm transition-colors"
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
                  className="flex items-center gap-3 hover:bg-red-50 px-4 py-2 rounded-lg w-full text-red-600 text-sm text-left transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white mt-5 border border-gray-200 rounded-lg">
              {/* Auth options */}
              <div className="p-3">
                <button
                  onClick={() => {
                    onOpenAuthModal();
                    onClose();
                  }}
                  className="flex items-center gap-3 hover:bg-gray-100 px-4 py-2 rounded-lg w-full text-gray-700 text-sm transition-colors"
                >
                  <LogIn size={16} />
                  Login/Connect
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      {/* Backdrop to close menu */}
      <div
        onClick={onClose}
        className="lg:hidden top-0 left-0 z-40 fixed bg-black/30 w-full h-full"
      />
    </>
  );
};

export default MobileMenu;
