import { useEffect, useState } from "react";
import Link from "next/link";
import { classNames } from "@/utils/helpers";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  name: string;
  className?: string;
  href?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  isCollapsed?: boolean;
};
export default function NavLink({
  name,
  href,
  Icon,
  isCollapsed = false,
}: NavLinkProps) {
  const currentPath = usePathname();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(currentPath === href);
  }, [currentPath, href]);

  const content = (
    <span
      className={classNames(
        isActive
          ? "bg-gray-50 text-amber-600"
          : "text-gray-700 hover:text-amber-600 hover:bg-gray-50",

        "group flex gap-x-3 rounded-md py-1 px-5 text-sm leading-6 font-semibold",
        isCollapsed ? "justify-center" : ""
      )}
    >
      <Icon
        className={classNames(
          isActive
            ? "text-amber-600"
            : "text-gray-400 group-hover:text-amber-600",
          "h-5 w-5 shrink-0"
        )}
        aria-hidden="true"
      />

      {!isCollapsed && name}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : <span>{content}</span>;
}
