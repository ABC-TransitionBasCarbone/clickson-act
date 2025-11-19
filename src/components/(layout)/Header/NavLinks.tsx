import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useUser } from "@/context/UserContext";

const NavLinks = ({
  className,
  onProtectedRouteClick,
}: {
  className?: string;
  onProtectedRouteClick?: () => void;
}) => {
  const pathname = usePathname();
  const t = useTranslations();
  const { user } = useUser();

  const navLinks = [
    { key: "Header.home", path: "/" },
    { key: "Header.dataReporting", path: "/data-reporting" },
    { key: "Header.monitoring", path: "/monitoring" },
  ];

  return (
    <nav className={className}>
      <ul className="flex flex-col items-start gap-5 lg:flex-row">
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
              onClick={(e) => {
                // If user is not logged in and clicks a protected route,
                // prevent navigation and open the auth modal instead.
                if (!user && path !== "/") {
                  e.preventDefault();
                  onProtectedRouteClick?.();
                }
              }}
            >
              {t(key)}
            </Link>
            <span
              className={`bg-secondary transition-300 absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full ${
                path === "/"
                  ? pathname === path
                    ? "visible"
                    : "invisible group-hover:visible"
                  : pathname.startsWith(path)
                    ? "visible"
                    : "invisible group-hover:visible"
              }`}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavLinks;
