"use client";
import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { locales } from "@/i18n/config";

const LanguageSelector = () => {
  const pathname = usePathname();
  const currentLang = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className="bg-secondary border-secondary rounded-3xl font-normal text-white btn-primary btn"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {currentLang.toUpperCase()}
      </button>

      {isOpen && (
        <ul className="right-0 absolute bg-secondary shadow-md mt-1.5 rounded-2xl w-full text-white">
          {locales.map((lang, index) => {
            const isFirst = index === 0;
            const isLast = index === locales.length - 1;

            return (
              <li key={lang}>
                <Link
                  href={pathname}
                  locale={lang}
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
