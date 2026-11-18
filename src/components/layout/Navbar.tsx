"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { isUserAdmin } from "@/lib/admin";
import {
  BookOpen,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("You have been signed out.");
      setUserDropdownOpen(false);
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
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D8]/80 transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo - Minimalist & Compact */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#183D33] rounded-lg py-1 shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#183D33] flex items-center justify-center text-[#FAF8F5] shadow-xs group-hover:bg-[#122E26] transition-all group-hover:scale-105">
              <BookOpen className="w-4 h-4 text-[#FAF8F5]" />
            </div>
            <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#183D33]">
              ReadNest
            </span>
          </Link>

          {/* Center Navigation Links - Floating Pill (Clean & Always Visible) */}
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-[#F4EFE6]/70 p-1 rounded-full border border-[#E8E2D8]/70 backdrop-blur-xs">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-[#183D33] text-[#FAF8F5] shadow-xs"
                      : "text-[#586860] hover:text-[#183D33] hover:bg-[#FAF8F5]/80"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area: Direct Log In or User Profile / Name (NO hamburger icon) */}
          <div className="flex items-center gap-2 shrink-0">
            {isPending ? (
              <div className="h-8 w-20 bg-[#E8E2D8]/50 animate-pulse rounded-full" />
            ) : session?.user ? (
              /* State A: User is SIGNED IN -> Show Admin button (if admin) + User Profile Avatar & Name */
              <div className="flex items-center gap-2">
                {isUserAdmin(session.user) && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#183D33] hover:bg-[#122E26] text-[#FAF8F5] text-xs font-semibold shadow-2xs hover:shadow-xs transition-all border border-emerald-900/30"
                    title="Curator Administration Panel"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F4A623]" />
                    <span className="hidden md:inline">Admin Dashboard</span>
                    <span className="md:hidden">Admin</span>
                  </Link>
                )}

                {/* Profile Pill with Avatar & User Name */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-1.5 sm:pr-3 rounded-full bg-white/70 hover:bg-[#F4EFE6] border border-[#E8E2D8]/80 hover:border-[#E8E2D8] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#183D33] cursor-pointer shadow-2xs"
                    aria-expanded={userDropdownOpen}
                    aria-label="User account menu"
                  >
                    {session.user.image && !imgError ? (
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-[#C88A3B]/40 ring-1 ring-white/60 shrink-0">
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
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#183D33] text-[#FAF8F5] flex items-center justify-center text-[11px] font-bold tracking-wider shrink-0">
                        {getInitials(session.user.name)}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-[#1D2622] max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                      {session.user.name || "Member"}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#839189]" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-[#E8E2D8] py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                        <div className="px-3.5 py-2.5 border-b border-[#F4EFE6]">
                          <p className="text-xs font-bold text-[#183D33] truncate">
                            {session.user.name}
                          </p>
                          <p className="text-[11px] text-[#839189] truncate">
                            {session.user.email}
                          </p>
                        </div>

                        <div className="py-1">
                          {isUserAdmin(session.user) && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#174B32] bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors border-b border-emerald-100/50"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#F4A623]" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#1D2622] hover:bg-[#F4EFE6] transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-[#52796F]" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            href="/profile/edit"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#1D2622] hover:bg-[#F4EFE6] transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
                            <span>Edit Profile</span>
                          </Link>
                        </div>

                        <div className="border-t border-[#F4EFE6] pt-1 mt-0.5">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-red-500" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* State B: User is NOT logged in -> Direct Log In button (NO hamburger menu) */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-[#183D33] hover:text-[#122E26] hover:bg-[#F4EFE6] rounded-full transition-colors border border-transparent hover:border-[#E8E2D8]"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex px-4 py-1.5 text-xs font-semibold text-[#FAF8F5] bg-[#183D33] hover:bg-[#122E26] rounded-full shadow-2xs hover:shadow-xs transition-all"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
