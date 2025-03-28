import { motion } from "motion/react";

const BurgerButton = ({
  isOpen,
  toggleMenu,
}: {
  isOpen: boolean;
  toggleMenu: () => void;
}) => {
  return (
    <button
      onClick={toggleMenu}
      className="relative flex h-5 w-6 flex-col items-center justify-between lg:hidden"
    >
      <motion.div
        className="bg-secondary h-1 w-full rounded-full"
        animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="bg-secondary h-1 w-full rounded-full"
        animate={{ opacity: isOpen ? 0 : 1 }}
      />
      <motion.div
        className="bg-secondary h-1 w-full rounded-full"
        animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </button>
  );
};

export default BurgerButton;
