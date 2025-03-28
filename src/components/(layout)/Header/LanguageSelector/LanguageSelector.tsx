"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/i18n/config";

const LanguageSelector = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathSegment = pathname.split("/")[1];
  const currentLang = locales.includes(pathSegment) ? pathSegment : locales[0];

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="btn-primary btn border-secondary bg-secondary rounded-3xl font-normal text-white"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {currentLang.toUpperCase()}
      </button>

      {isOpen && (
        <ul className="bg-secondary absolute right-0 mt-1.5 w-full rounded-2xl text-white shadow-md">
          {locales.map((lang, index) => {
            const newPath = `/${lang.toLowerCase()}${pathname.replace(/^\/\w+/, "")}`;
            const isFirst = index === 0;
            const isLast = index === locales.length - 1;

            return (
              <li key={lang}>
                <Link
                  href={newPath}
                  className={`block px-4 py-2 transition hover:bg-white/20 ${
                    currentLang === lang ? "font-bold" : ""
                  } ${isFirst ? "rounded-t-2xl" : ""} ${isLast ? "rounded-b-2xl" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  {lang.toUpperCase()}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
