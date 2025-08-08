"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsPerson, BsList } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import "./components.css";

interface NavLink {
  label: string;
  href: string;
}

const Header: React.FC = () => {
  const pathname: string = usePathname();
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const navLinks: NavLink[] = [
    // { label: "About Us", href: "/" },
    { label: "For Patients", href: "/" },
    { label: "For Doctors", href: "/for-doctors" },
    { label: "Services", href: "/services" },
  ];

  const handleMenuToggle = (): void => {
    setShowMenu(!showMenu);
  };

  const handleCloseMenu = (): void => {
    setShowMenu(false);
  };

  return (
    <>
      <header className="main-header py-3 px-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              height={54}
              width={161}
              alt="Website Logo"
              className="w-auto h-auto"
            />
          </Link>

          <ul className="flex list-none mb-0 nav-links-main">
            {navLinks.map((link: NavLink, index: number) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className={pathname === link.href ? "active" : ""}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 right-menu">
            <a href="/auth/login" className="icon-bg">
              <BsPerson aria-label="User Profile" size={20} />
            </a>
            <BsList aria-label="Menu" size={20} onClick={handleMenuToggle} />
          </div>
        </nav>
      </header>
      {showMenu && (
        <div className="responsive-menu">
          <div className="flex gap-2 justify-between items-center border-b p-3">
            <Image
              src="/logo.png"
              height={10}
              width={100}
              alt="Website Logo"
              className="w-auto h-auto"
            />
            <IoMdClose className="text-2xl" onClick={handleCloseMenu} />
          </div>
          <div className="side-bar-body">
            <ul className="flex flex-col gap-3 list-none mb-0 p-3 nav-links-main">
              {navLinks.map((link: NavLink, index: number) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className={pathname === link.href ? "active" : ""}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
