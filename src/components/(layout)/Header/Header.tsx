"use client";
import Image from "next/image";
import { motion } from "motion/react";
import React, { useState, useRef, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "@/context/UserContext";
import {
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  LogIn,
  Users,
} from "lucide-react";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import BurgerButton from "./BurgerButton";
import LanguageSelector from "./LanguageSelector";
import LoginForm from "../../User/LoginForm ";
import PassCodeForm from "../../User/PassCodeForm ";
import SignUpForm from "../../User/SignUpForm";
import Modal from "../../Modal";

const Header = () => {
  const pathname = usePathname();
  const t = useTranslations("User");
  const { user, setUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setUser(null);
    setShowLogoutModal(false);
    setShowUserDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
      if (
        authDropdownRef.current &&
        !authDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAuthDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <motion.header
        key={pathname}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, display: "none" }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 z-50 w-full bg-white p-4 text-black"
      >
        <div className="container mx-auto flex items-center justify-between gap-5 lg:justify-center">
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
          <NavLinks className="hidden w-full justify-center lg:flex" />

          {/* Right side items */}
          <div className="flex items-center gap-3">
            {/* Authentication/User Profile */}
            {user ? (
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  title={
                    user.passcode
                      ? `Student: ${user.username} (${user.passcode})`
                      : `Teacher: ${user.username}`
                  }
                >
                  <User size={16} />
                  <div className="hidden w-max sm:inline">
                    <span>{user.username}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showUserDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {(user.role === "teacher" || user.role === "admin") && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowLogoutModal(true);
                        setShowUserDropdown(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative hidden lg:block" ref={authDropdownRef}>
                <button
                  onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <LogIn size={16} />
                  <span>Login/Connect</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showAuthDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Auth Dropdown Menu */}
                {showAuthDropdown && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      onClick={() => {
                        const modal = document.getElementById(
                          "login",
                        ) as HTMLDialogElement;
                        if (modal) modal.showModal();
                        setShowAuthDropdown(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
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
                        setShowAuthDropdown(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <Users size={16} />
                      Student
                    </button>
                  </div>
                )}
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
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <LogOut className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold">{t("logout")}</h3>
            </div>
            <p className="mb-6 text-gray-600">{t("logoutConfirm")}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal id="login" title="Teacher Login">
        <LoginForm />
      </Modal>
      <Modal id="signup" title="Teacher Registration">
        <SignUpForm />
      </Modal>
      <Modal id="passcode" title="Student Connect">
        <PassCodeForm />
      </Modal>
    </>
  );
};

export default Header;
