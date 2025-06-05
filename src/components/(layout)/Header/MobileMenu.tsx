import { motion } from "motion/react";
import NavLinks from "./NavLinks";

const MobileMenu = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, display: "none" }}
        transition={{ duration: 0.5 }}
        className="absolute top-12 left-0 z-50 m-2.5 w-[calc(100vw-20px)] rounded-xl bg-white p-4 lg:hidden"
        onClick={onClose}
      >
        <NavLinks className="flex-col" />
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
