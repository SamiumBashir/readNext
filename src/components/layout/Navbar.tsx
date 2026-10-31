"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import {
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("You have been signed out.");
      setUserDropdownOpen(false);
      setMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Books", href: "/books" },
    { name: "My Profile", href: "/profile", protected: true },
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#183D33] rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#183D33] flex items-center justify-center text-[#FAF8F5] shadow-sm group-hover:bg-[#122E26] transition-colors">
              <BookOpen className="w-5 h-5 text-[#FAF8F5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#183D33]">
                ReadNest
              </span>
              <span className="text-[10px] tracking-widest uppercase font-sans font-semibold text-[#839189]">
                Curated Library
              </span>
            </div>
          </Link>

          {/* Center Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F4EFE6]/60 p-1.5 rounded-full border border-[#E8E2D8]">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#183D33] text-[#FAF8F5] shadow-sm"
                      : "text-[#586860] hover:text-[#183D33] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isPending ? (
              <div className="h-10 w-28 bg-[#E8E2D8]/60 animate-pulse rounded-full" />
            ) : session?.user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-[#F4EFE6] border border-transparent hover:border-[#E8E2D8] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#183D33]"
                  aria-expanded={userDropdownOpen}
                >
                  {session.user.image && !imgError ? (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#C88A3B]/40">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User Avatar"}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={() => setImgError(true)}
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#183D33] text-[#FAF8F5] flex items-center justify-center text-xs font-semibold tracking-wider">
                      {getInitials(session.user.name)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#1D2622] max-w-[120px] truncate">
                    {session.user.name || "Member"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#839189]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-[#E8E2D8] py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                      <div className="px-4 py-3 border-b border-[#F4EFE6]">
                        <p className="text-sm font-semibold text-[#183D33] truncate">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-[#839189] truncate">
                          {session.user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1D2622] hover:bg-[#F4EFE6] transition-colors"
                        >
                          <User className="w-4 h-4 text-[#52796F]" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/profile/edit"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1D2622] hover:bg-[#F4EFE6] transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-[#C88A3B]" />
                          <span>Edit Profile</span>
                        </Link>
                      </div>

                      <div className="border-t border-[#F4EFE6] pt-1 mt-1">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[#183D33] hover:text-[#122E26] hover:bg-[#F4EFE6] rounded-full transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-[#FAF8F5] bg-[#183D33] hover:bg-[#122E26] rounded-full shadow-sm hover:shadow transition-all"
                >
                  Join ReadNest
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#183D33] hover:bg-[#F4EFE6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#183D33]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Collapse */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E2D8] bg-[#FAF8F5] px-4 pt-4 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between ${
                    isActive
                      ? "bg-[#183D33] text-[#FAF8F5]"
                      : "text-[#1D2622] hover:bg-[#F4EFE6]"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.protected && (
                    <Bookmark className="w-4 h-4 opacity-70" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#E8E2D8]">
            {session?.user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2 py-1">
                  {session.user.image && !imgError ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C88A3B]/40">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={() => setImgError(true)}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#183D33] text-[#FAF8F5] flex items-center justify-center font-semibold">
                      {getInitials(session.user.name)}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-sm font-semibold text-[#183D33]">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-[#839189] truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/profile/edit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#F4EFE6] text-[#183D33]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
                    Edit Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-red-50 text-red-600"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-[#183D33] bg-[#F4EFE6]"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-[#FAF8F5] bg-[#183D33]"
                >
                  Join ReadNest
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
