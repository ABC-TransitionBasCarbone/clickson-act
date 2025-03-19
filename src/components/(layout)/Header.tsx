"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import LanguageSelector from "./LanguageSelector";
import { Link, usePathname } from "@/i18n/navigation";
import { motion } from "motion/react";

const Header = () => {
  const pathname = usePathname();
  const t = useTranslations();

  const navLinks = [
    { key: "Header.home", path: "/" },
    { key: "Header.calculator", path: "/calculator" },
    { key: "Header.monitoring", path: "/monitoring" },
  ];

  return (
    <motion.header
      key={pathname}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, display: "none" }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 z-50 w-full bg-white p-4 text-black"
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/">
          <Image
            src={"/images/logo.png"}
            alt={"ClicksOnAct"}
            width={100}
            height={50}
          />
        </Link>
        <nav>
          <ul className="flex items-center gap-4">
            {navLinks.map(({ key, path }) => (
              <li
                key={path}
                className="group transition-300 relative cursor-pointer"
              >
                <Link
                  href={path}
                  className={`select-none ${
                    path === "/"
                      ? pathname === path
                        ? "text-primary font-bold"
                        : "group-hover:text-primary"
                      : pathname.startsWith(path)
                        ? "text-primary font-bold"
                        : "group-hover:text-primary"
                  }`}
                >
                  {t(key)}
                </Link>
                <span
                  className={`bg-primary transition-300 absolute bottom-0 left-0 h-0.5 w-full ${
                    pathname === path
                      ? "visible"
                      : "invisible group-hover:visible"
                  }`}
                />
              </li>
            ))}
          </ul>
        </nav>
        <LanguageSelector />
      </div>
    </motion.header>
  );
};

export default Header;
