"use client";
import Image from "next/image";
import { motion } from "motion/react";
import React, { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "@/context/UserContext";
import { User, LogOut } from "lucide-react";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import BurgerButton from "./BurgerButton";
import LanguageSelector from "./LanguageSelector";

const Header = () => {
  const pathname = usePathname();
  const t = useTranslations("User");
  const { user, setUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setShowLogoutModal(false);
  };

  return (
    <>
      <motion.header
        key={pathname}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, display: "none" }}
        transition={{ duration: 0.5 }}
        className="top-0 z-50 fixed bg-white p-4 w-full text-black"
      >
        <div className="flex justify-between lg:justify-center items-center gap-5 mx-auto container">
          {/* Logo */}
          <Link href="/" className="max-lg:mr-auto">
            <Image
              src={"/images/logo.png"}
              alt={"ClicksOnAct"}
              width={150}
              height={75}
            />
          </Link>

          {/* Desktop Navigation */}
          <NavLinks className="hidden lg:flex justify-center w-full" />

          {/* Right side items */}
          <div className="flex items-center gap-3">
            {/* User Profile */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg font-medium text-gray-700 text-sm transition-colors"
                  title={
                    user.passcode
                      ? `Student: ${user.username} (${user.passcode})`
                      : `Teacher: ${user.username}`
                  }
                >
                  <User size={16} />
                  <div className="hidden sm:inline w-max">
                    <span>{user.username}</span>
                  </div>
                </button>
              </div>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {/* Mobile Menu Button */}
            <BurgerButton
              isOpen={isMenuOpen}
              toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        </div>
      </motion.header>

      {/* Mobile Dropdown Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50">
          <div className="bg-white shadow-xl mx-4 p-6 rounded-lg max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <LogOut className="text-red-500" size={24} />
              <h3 className="font-semibold text-lg">{t("logout")}</h3>
            </div>
            <p className="mb-6 text-gray-600">{t("logoutConfirm")}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="hover:bg-gray-100 px-4 py-2 rounded-lg text-gray-600 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition-colors"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
