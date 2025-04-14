import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const NavLinks = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const t = useTranslations();

  const navLinks = [
    { key: "Header.home", path: "/" },
    { key: "Header.calculator", path: "/calculator" },
    { key: "Header.monitoring", path: "/monitoring" },
  ];

  return (
    <nav className={className}>
      <ul className="flex flex-col items-center gap-10 lg:flex-row">
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
                    ? "text-secondary font-bold"
                    : "group-hover:text-primary"
                  : pathname.startsWith(path)
                    ? "text-secondary font-bold"
                    : "group-hover:text-primary"
              }`}
            >
              {t(key)}
            </Link>
            <span
              className={`bg-secondary transition-300 absolute bottom-0 left-0 h-0.5 w-full ${
                pathname === path ? "visible" : "invisible group-hover:visible"
              }`}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavLinks;
