"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog } from "@headlessui/react";
import {
  HomeIcon,
  UserCircleIcon,
  UserGroupIcon,
  FolderIcon,
  ArrowLeftEndOnRectangleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import NavLink from "./nav-link";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { fetchAllTopics } from "@/app/_api/topics";
import { Topic } from "@/app/_types";

const loggedInNav = [
  { name: "Search", href: "/dashboard/search", icon: MagnifyingGlassIcon },
  { name: "Doctors", href: "/dashboard/doctors", icon: UserGroupIcon },
  { name: "Account", href: "/dashboard/account", icon: UserCircleIcon },
  { name: "History", href: "/dashboard/history", icon: FolderIcon },
];
const loggedOutNav = [
  { name: "Search", href: "/dashboard/search", icon: MagnifyingGlassIcon },
  { name: "Doctors", href: "/dashboard/doctors", icon: UserGroupIcon },
];

export default function SideBar() {
  const pathname = usePathname();
  const [navigation, setNavigation] = useState(loggedOutNav);
  const [shouldHideSidebar, setShouldHideSidebar] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [openHome, setOpenHome] = useState(false);
  const [openBodyParts, setOpenBodyParts] = useState<Record<string, boolean>>(
    {}
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkIfPrivatePage = async () => {
      try {
        if (!pathname) {
          setShouldHideSidebar(false);
          return;
        }
        if (pathname.startsWith("/dashboard/topics/info/")) {
          const topicId = pathname.split("/").pop();
          if (!topicId) {
            setShouldHideSidebar(false);
            return;
          }
          const { data } = await supabase
            .from("detailed_topics")
            .select("is_private")
            .eq("id", topicId)
            .single();
          setShouldHideSidebar(data?.is_private === true);
        } else {
          setShouldHideSidebar(false);
        }
      } catch (error) {
        setShouldHideSidebar(false);
      }
    };
    checkIfPrivatePage();
  }, [pathname]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Check if user has a complete profile (not a guest)
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, zip_code")
          .eq("id", data.session.user.id)
          .single();

        // If user has first_name, last_name, and zip_code, they're authenticated
        // If missing any of these, they're a guest
        const isGuest =
          !profile ||
          !profile.first_name ||
          !profile.last_name ||
          !profile.zip_code;

        if (isGuest) {
          setNavigation(loggedOutNav);
          setIsAuthenticated(false);
          setIsLoggedIn(false);
        } else {
          setNavigation(loggedInNav);
          setIsAuthenticated(true);
          setIsLoggedIn(true);
        }
      } else {
        setNavigation(loggedOutNav);
        setIsAuthenticated(false);
        setIsLoggedIn(false);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    fetchAllTopics().then(setTopics);
  }, []);

  const grouped: Record<string, { name: string; topics: Topic[] }> =
    topics.reduce((acc, topic) => {
      const group = topic.body_parts?.name || "Other";
      const groupId = topic.body_part_id || "other";
      if (!acc[groupId]) acc[groupId] = { name: group, topics: [] };
      acc[groupId].topics.push(topic);
      return acc;
    }, {} as Record<string, { name: string; topics: Topic[] }>);

  const toggleBodyPart = (bodyPartId: string) => {
    setOpenBodyParts((prev) => ({ ...prev, [bodyPartId]: !prev[bodyPartId] }));
  };

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        window.location.reload();
      }
    });
    return () => {
      data?.subscription?.unsubscribe && data.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (shouldHideSidebar) return null;

  // Sidebar content as a component for reuse (desktop and mobile)
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo and collapse/hamburger */}
      <div className="h-16 flex items-center justify-between px-4  bg-white flex-shrink-0 py-5">
        <Link href="/" className="flex items-center">
          <span
            className={`font-semibold text-amber-500 transition-all duration-300 ${
              isCollapsed ? "text-lg" : "text-5xl"
            }`}
          >
            {isCollapsed ? "m" : "medoh"}
          </span>
        </Link>
      </div>
      {/* Navigation content */}
      <nav className="flex-1 overflow-y-auto">
        <div className="py-2">
          {/* Home with dropdown */}
          <div className="px-5">
            <div className="flex items-center">
              <Link
                href="/dashboard/home"
                className={`flex items-center flex-1 px-5 py-2 rounded hover:bg-gray-100 transition-colors ${
                  pathname === "/dashboard/home"
                    ? "bg-gray-50 text-amber-600"
                    : "text-gray-700 hover:text-amber-600"
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">Home</span>
                )}
              </Link>
              {!isCollapsed && (
                <button
                  className={`ml-1 p-1 rounded hover:bg-gray-100 transition-colors ${
                    openHome ? "bg-amber-50 text-amber-700" : "text-gray-500"
                  } hover:text-amber-600`}
                  onClick={() => setOpenHome((v) => !v)}
                  type="button"
                >
                  {openHome ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            {/* Body parts dropdown */}
            {openHome && !isCollapsed && (
              <div className="ml-4 mt-1 space-y-1">
                {Object.entries(grouped).map(
                  ([bodyPartId, { name, topics }]) => (
                    <div key={bodyPartId} className="flex flex-col">
                      <div
                        className={`flex items-center rounded ${
                          openBodyParts[bodyPartId]
                            ? "bg-amber-50 text-amber-700"
                            : ""
                        }`}
                      >
                        <button
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                            openBodyParts[bodyPartId]
                              ? "text-amber-700"
                              : "text-gray-500"
                          } hover:text-amber-600`}
                          onClick={() => toggleBodyPart(bodyPartId)}
                          type="button"
                          aria-label={
                            openBodyParts[bodyPartId]
                              ? `Collapse ${name}`
                              : `Expand ${name}`
                          }
                        >
                          {openBodyParts[bodyPartId] ? (
                            <ChevronDownIcon className="w-3 h-3" />
                          ) : (
                            <ChevronRightIcon className="w-3 h-3" />
                          )}
                        </button>
                        <Link
                          href={`/dashboard/body-part/${bodyPartId}`}
                          className={`ml-2 text-sm font-medium hover:underline hover:text-amber-600 transition-colors py-1 flex-1 ${
                            openBodyParts[bodyPartId] ? "text-amber-700" : ""
                          }`}
                        >
                          {name}
                        </Link>
                      </div>
                      {openBodyParts[bodyPartId] && (
                        <div className="ml-6 mt-1 space-y-1">
                          {topics.map((topic) => (
                            <Link
                              key={topic.id}
                              href={
                                topic.is_detailed
                                  ? `/dashboard/topics/${topic.id}`
                                  : `/dashboard/home/${topic.id}`
                              }
                              className="block px-2 py-5 rounded hover:bg-gray-50 hover:text-amber-600 transition-colors text-sm text-gray-600"
                            >
                              {topic.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
          {/* Other navigation links */}
          <div className="px-5 mt-2">
            {navigation.map((item) => (
              <div key={item.name} className="mb-1">
                <NavLink
                  href={item.href}
                  name={item.name}
                  Icon={item.icon}
                  isCollapsed={isCollapsed}
                />
              </div>
            ))}
          </div>
        </div>
      </nav>
      {/* Sign out button */}
      {isLoggedIn ? (
        <div className=" bg-white">
          <div className="py-2 flex justify-center">
            <button
              onClick={handleSignOut}
              className="w-auto bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white">
          <div className="px-5 py-3">
            <Link href="/auth/login" className="w-full block">
              <button className="orange-button w-full font-normal">
                Login
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile sidebar content (without duplicate logo)
  const mobileSidebarContent = (
    <div className="flex flex-col h-full">
      {/* Navigation content */}
      <nav className="flex-1 overflow-y-auto">
        <div className="py-2">
          {/* Home with dropdown */}
          <div className="px-2">
            <div className="flex items-center">
              <Link
                href="/dashboard/home"
                className={`flex items-center flex-1 px-5 py-2 rounded hover:bg-gray-100 transition-colors ${
                  pathname === "/dashboard/home"
                    ? "bg-gray-50 text-amber-600"
                    : "text-gray-700 hover:text-amber-600"
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                <span className="ml-3 text-sm font-medium">Home</span>
              </Link>
              {/* <button
                className={`ml-1 p-1 rounded hover:bg-gray-100 transition-colors ${
                  openHome ? "bg-amber-50 text-amber-700" : "text-gray-500"
                } hover:text-amber-600`}
                onClick={() => setOpenHome((v) => !v)}
                type="button"
              >
                {openHome ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button> */}
            </div>
            {/* Body parts dropdown */}
            {openHome && (
              <div className="ml-4 mt-1 space-y-1">
                {Object.entries(grouped).map(
                  ([bodyPartId, { name, topics }]) => (
                    <div key={bodyPartId} className="flex flex-col">
                      <div
                        className={`flex items-center rounded ${
                          openBodyParts[bodyPartId]
                            ? "bg-amber-50 text-amber-700"
                            : ""
                        }`}
                      >
                        <button
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                            openBodyParts[bodyPartId]
                              ? "text-amber-700"
                              : "text-gray-500"
                          } hover:text-amber-600`}
                          onClick={() => toggleBodyPart(bodyPartId)}
                          type="button"
                          aria-label={
                            openBodyParts[bodyPartId]
                              ? `Collapse ${name}`
                              : `Expand ${name}`
                          }
                        >
                          {openBodyParts[bodyPartId] ? (
                            <ChevronDownIcon className="w-3 h-3" />
                          ) : (
                            <ChevronRightIcon className="w-3 h-3" />
                          )}
                        </button>
                        <Link
                          href={`/dashboard/body-part/${bodyPartId}`}
                          className={`ml-2 text-sm font-medium hover:underline hover:text-amber-600 transition-colors py-1 flex-1 ${
                            openBodyParts[bodyPartId] ? "text-amber-700" : ""
                          }`}
                        >
                          {name}
                        </Link>
                      </div>
                      {openBodyParts[bodyPartId] && (
                        <div className="ml-6 mt-1 space-y-1">
                          {topics.map((topic) => (
                            <Link
                              key={topic.id}
                              href={
                                topic.is_detailed
                                  ? `/dashboard/topics/${topic.id}`
                                  : `/dashboard/home/${topic.id}`
                              }
                              className="block px-2 py-1 rounded hover:bg-gray-50 hover:text-amber-600 transition-colors text-sm text-gray-600"
                            >
                              {topic.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
          {/* Other navigation links */}
          <div className="px-2 mt-2">
            {navigation.map((item) => (
              <div key={item.name} className="mb-1">
                <NavLink
                  href={item.href}
                  name={item.name}
                  Icon={item.icon}
                  isCollapsed={false}
                />
              </div>
            ))}
          </div>
        </div>
      </nav>
      {/* Sign out button */}
      {isLoggedIn ? (
        <div className="border-t bg-white">
          <div className="px-4 py-2 flex justify-center">
            <button
              onClick={handleSignOut}
              className="w-auto bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t bg-white">
          <div className="px-2 py-2">
            <Link href="/auth/login" className="w-full block">
              <NavLink
                name="Sign in"
                Icon={UserCircleIcon}
                isCollapsed={false}
              />
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="h-full bg-white border-r flex-col hidden md:flex w-64">
        {sidebarContent}
      </div>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center h-16 px-4 border-b bg-white w-full fixed z-30">
        <button
          className="p-1 rounded hover:bg-gray-100"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" x2="20" y1="7" y2="7" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="17" y2="17" />
          </svg>
        </button>
      </div>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b bg-white">
              <Link href="/" className="flex items-center">
                <span className="font-semibold text-amber-500 text-2xl">
                  medoh
                </span>
              </Link>
              <button
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="6" x2="18" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="18" y2="6" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{mobileSidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
