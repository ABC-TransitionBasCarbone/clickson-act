"use client";
import Image from "next/image";
import { motion } from "motion/react";
import React, { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import BurgerButton from "./BurgerButton";
import LanguageSelector from "./LanguageSelector";

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

          {/* Language Selector */}
          <LanguageSelector />

          {/* Mobile Menu Button */}
          <BurgerButton
            isOpen={isMenuOpen}
            toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>
      </motion.header>

      {/* Mobile Dropdown Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
