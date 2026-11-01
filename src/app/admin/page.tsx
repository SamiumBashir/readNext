import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { isUserAdmin, getAdminEmails } from "@/lib/admin";
import { getAllBooksAdmin } from "@/services/book.service";
import { getAllUsersAdmin } from "@/services/user.service";
import {
  getAllBorrowRecordsAdmin,
  getDashboardAnalytics,
} from "@/services/borrow.service";
import AdminDashboardApp from "@/components/admin/AdminDashboardApp";

export const metadata: Metadata = {
  title: "Admin Dashboard & Curator Console — ReadNext",
  description:
    "Professional SaaS administration panel for managing books, readers, loans, returns, and library analytics.",
};

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Unauthenticated visitors cannot access /admin
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/admin");
  }

  // 2. Normal readers (non-admin) are strictly blocked from accessing /admin - immediately redirected to home
  if (!isUserAdmin(session.user)) {
    redirect("/");
  }

  // 3. Fetch comprehensive data concurrently from MongoDB
  const [books, users, borrowsData, analytics] = await Promise.all([
    getAllBooksAdmin(),
    getAllUsersAdmin(),
    getAllBorrowRecordsAdmin({ limit: 100 }),
    getDashboardAnalytics(),
  ]);

  const adminEmails = getAdminEmails();

  // Extract core stats
  const stats = {
    totalBooks: analytics.totalBooks,
    registeredUsers: analytics.registeredUsers,
    totalBorrowed: analytics.totalBorrowed,
    currentlyBorrowed: analytics.currentlyBorrowed,
    overdueBooks: analytics.overdueBooks,
    availableBooks: analytics.availableBooks,
    totalCopies: analytics.totalCopies,
    returnRate: analytics.returnRate,
    categoryCounts: analytics.categoryCounts,
  };

  return (
    <AdminDashboardApp
      initialBooks={books}
      initialUsers={users}
      initialBorrows={borrowsData.records}
      initialStats={stats}
      initialAnalytics={analytics}
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
      adminEmails={adminEmails}
    />
  );
}
