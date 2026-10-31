import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import { getBooks } from "@/services/book.service";
import AdminStudioClient from "@/components/admin/AdminStudioClient";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Book Studio — ReadNest Library",
  description:
    "Curator administration interface for uploading, publishing, and managing library books and stock.",
};

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Unauthenticated users are redirected to login
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/admin");
  }

  // 2. Normal readers (non-admin) are blocked with access restriction
  if (!isUserAdmin(session.user)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8E2D8] shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-2xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-[#183D33]">
              Curator Access Restricted
            </h1>
            <p className="text-xs sm:text-sm text-[#586860] leading-relaxed">
              Your account (<span className="font-semibold text-[#183D33]">{session.user.email}</span>) is registered as a general Reader Member. Only designated library administrators can access the Book Upload Studio.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold bg-[#183D33] hover:bg-[#122E26] text-[#FAF8F5] transition-all shadow-sm hover:shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Library</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Retrieve initial catalog of books for inventory management
  const booksResult = await getBooks({
    limit: 100,
  });

  return (
    <AdminStudioClient
      initialBooks={booksResult.books}
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}

