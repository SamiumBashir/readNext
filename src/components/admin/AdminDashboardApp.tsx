"use client";

import { useState } from "react";
import { AdminTab } from "./AdminSidebar";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import OverviewTab from "./tabs/OverviewTab";
import BooksTab from "./tabs/BooksTab";
import UsersTab from "./tabs/UsersTab";
import BorrowsTab from "./tabs/BorrowsTab";
import ReturnsOverdueTab from "./tabs/ReturnsOverdueTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import NotificationsTab from "./tabs/NotificationsTab";
import SettingsTab from "./tabs/SettingsTab";

import BookFormModal from "./modals/BookFormModal";
import BookDetailsModal from "./modals/BookDetailsModal";
import UserDetailsModal from "./modals/UserDetailsModal";
import DeleteBookModal from "./modals/DeleteBookModal";

import {
  Book,
  AdminUser,
  BorrowRecord,
  DashboardStats,
  NotificationItem,
} from "@/types";
import { toast } from "sonner";

interface AdminDashboardAppProps {
  initialBooks: Book[];
  initialUsers: AdminUser[];
  initialBorrows: BorrowRecord[];
  initialStats: DashboardStats;
  initialAnalytics: {
    activityTrend: {
      weekly: { label: string; borrowed: number; returned: number }[];
      monthly: { label: string; borrowed: number; returned: number }[];
      yearly: { label: string; borrowed: number; returned: number }[];
    };
    mostBorrowedBooks: {
      id: string;
      title: string;
      author: string;
      image_url: string;
      category: string;
      borrowCount: number;
      available_quantity: number;
    }[];
    recentBorrows: BorrowRecord[];
    overdueBorrows: BorrowRecord[];
  };
  user: {
    name?: string | null;
    email?: string | null;
  };
  adminEmails: string[];
}

export default function AdminDashboardApp({
  initialBooks,
  initialUsers,
  initialBorrows,
  initialStats,
  initialAnalytics,
  user,
  adminEmails,
}: AdminDashboardAppProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Data states
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [borrows, setBorrows] = useState<BorrowRecord[]>(initialBorrows);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [analytics, setAnalytics] = useState(initialAnalytics);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const list: NotificationItem[] = [];

    // Add overdue alerts
    const overdueList = initialBorrows.filter((b) => {
      if (b.status !== "active") return false;
      const d = b.dueDate
        ? new Date(b.dueDate).getTime()
        : new Date(b.borrowedAt).getTime() + 14 * 86400000;
      return Date.now() > d;
    });

    if (overdueList.length > 0) {
      list.push({
        id: "alert-overdue-1",
        type: "overdue",
        title: `${overdueList.length} Overdue Loans Detected`,
        message: `${overdueList[0]?.bookTitle || "Volume"} has exceeded the 14-day loan duration.`,
        timestamp: new Date(),
        read: false,
      });
    }

    // Add low stock warnings
    const lowStock = initialBooks.filter(
      (b) => b.available_quantity > 0 && b.available_quantity <= 2
    );
    if (lowStock.length > 0) {
      list.push({
        id: "alert-stock-1",
        type: "stock",
        title: "Low Inventory Alert",
        message: `“${lowStock[0]?.title}” only has ${lowStock[0]?.available_quantity} copies left.`,
        timestamp: new Date(),
        read: false,
      });
    }

    // Add latest reader registration
    if (initialUsers.length > 0) {
      list.push({
        id: "alert-user-1",
        type: "user",
        title: "New Reader Joined",
        message: `${initialUsers[0]?.name || "New member"} joined ReadNext library catalog.`,
        timestamp: initialUsers[0]?.createdAt || new Date(),
        read: true,
      });
    }

    return list;
  });

  // Modal triggers
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  const [isBookDetailsOpen, setIsBookDetailsOpen] = useState(false);
  const [selectedBookForDetails, setSelectedBookForDetails] =
    useState<Book | null>(null);

  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] =
    useState<AdminUser | null>(null);
  const [selectedUserBorrows, setSelectedUserBorrows] = useState<
    BorrowRecord[]
  >([]);

  const [isDeleteBookOpen, setIsDeleteBookOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Return Book Handler (Admin one-click return)
  const handleProcessReturn = async (recordId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/borrows", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to process return.");
      }

      const returnedRecord = data.record;
      const returnedBookId = returnedRecord?.bookId;

      // Update borrows state
      setBorrows((prev) =>
        prev.map((b) =>
          b.id === recordId
            ? { ...b, status: "returned", returnedAt: new Date() }
            : b
        )
      );

      // Update user modal borrows state if open
      setSelectedUserBorrows((prev) =>
        prev.map((b) =>
          b.id === recordId
            ? { ...b, status: "returned", returnedAt: new Date() }
            : b
        )
      );

      // Update book stock in books state
      if (returnedBookId) {
        setBooks((prev) =>
          prev.map((b) =>
            b.id === returnedBookId
              ? {
                  ...b,
                  available_quantity:
                    typeof data.available_quantity === "number"
                      ? data.available_quantity
                      : b.available_quantity + 1,
                }
              : b
          )
        );
      }

      // Update user counts
      setUsers((prev) =>
        prev.map((u) => {
          if (
            u.id === returnedRecord?.userId ||
            (returnedRecord?.userEmail &&
              u.email.toLowerCase() ===
                returnedRecord.userEmail.toLowerCase())
          ) {
            return {
              ...u,
              currentlyBorrowed: Math.max(0, u.currentlyBorrowed - 1),
              returnedCount: u.returnedCount + 1,
              overdueCount: Math.max(0, u.overdueCount - 1),
            };
          }
          return u;
        })
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        currentlyBorrowed: Math.max(0, prev.currentlyBorrowed - 1),
        availableBooks: prev.availableBooks + 1,
        overdueBooks: Math.max(0, prev.overdueBooks - 1),
      }));

      // Update analytics
      setAnalytics((prev) => ({
        ...prev,
        overdueBorrows: prev.overdueBorrows.filter((b) => b.id !== recordId),
        recentBorrows: prev.recentBorrows.map((b) =>
          b.id === recordId
            ? { ...b, status: "returned", returnedAt: new Date() }
            : b
        ),
      }));

      return true;
    } catch (err: any) {
      toast.error(err.message || "Could not process return.");
      return false;
    }
  };

  // Toggle User Status Handler
  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: "active" | "suspended"
  ) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update member status.");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );

      if (selectedUserForDetails && selectedUserForDetails.id === userId) {
        setSelectedUserForDetails((prev) =>
          prev ? { ...prev, status: nextStatus } : null
        );
      }

      toast.success(
        `User account successfully ${
          nextStatus === "active" ? "activated" : "suspended"
        }.`
      );
    } catch (err: any) {
      toast.error(err.message || "Could not update user status.");
    }
  };

  // Open User Details and fetch their exact borrow history
  const handleSelectUser = async (userItem: AdminUser) => {
    setSelectedUserForDetails(userItem);
    setIsUserDetailsOpen(true);

    try {
      const res = await fetch(`/api/admin/users?userId=${userItem.id}`);
      const data = await res.json();
      if (res.ok && data.success && data.borrows) {
        setSelectedUserBorrows(data.borrows);
      } else {
        // Fallback: match from local borrows
        const matched = borrows.filter(
          (b) =>
            b.userId === userItem.id ||
            b.userEmail?.toLowerCase() === userItem.email.toLowerCase()
        );
        setSelectedUserBorrows(matched);
      }
    } catch {
      const matched = borrows.filter(
        (b) =>
          b.userId === userItem.id ||
          b.userEmail?.toLowerCase() === userItem.email.toLowerCase()
      );
      setSelectedUserBorrows(matched);
    }
  };

  // Book Add/Edit success callback
  const handleBookSuccess = (book: Book, isEdit: boolean) => {
    if (isEdit) {
      setBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
    } else {
      setBooks((prev) => [book, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalBooks: prev.totalBooks + 1,
        availableBooks: prev.availableBooks + (book.available_quantity || 0),
        totalCopies:
          prev.totalCopies +
          (book.total_copies || book.available_quantity || 0),
      }));
    }
  };

  // Book Delete callback
  const handleDeleteBookConfirm = async (bookId: string) => {
    try {
      const res = await fetch(`/api/books?id=${bookId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove book.");
      }

      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      setStats((prev) => ({
        ...prev,
        totalBooks: Math.max(0, prev.totalBooks - 1),
      }));
      toast.success("Volume successfully removed from archive.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete volume.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F0] text-stone-900 font-sans selection:bg-[#F4A623]/30">
      {/* 1. Collapsible Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        overdueCount={stats.overdueBooks}
      />

      {/* 2. Main Administration Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddBookModal={() => {
            setBookToEdit(null);
            setIsBookFormOpen(true);
          }}
          user={user}
          notifications={notifications}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <OverviewTab
              stats={stats}
              analytics={analytics}
              onNavigateTab={setActiveTab}
              onProcessReturn={handleProcessReturn}
              onSelectBook={(bookId) => {
                const b = books.find((item) => item.id === bookId);
                if (b) {
                  setSelectedBookForDetails(b);
                  setIsBookDetailsOpen(true);
                }
              }}
            />
          )}

          {activeTab === "books" && (
            <BooksTab
              books={books}
              onOpenAddModal={() => {
                setBookToEdit(null);
                setIsBookFormOpen(true);
              }}
              onEditBook={(book) => {
                setBookToEdit(book);
                setIsBookFormOpen(true);
              }}
              onDeleteBook={(book) => {
                setBookToDelete(book);
                setIsDeleteBookOpen(true);
              }}
              onViewDetails={(book) => {
                setSelectedBookForDetails(book);
                setIsBookDetailsOpen(true);
              }}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              users={users}
              onSelectUser={handleSelectUser}
              onToggleStatus={handleToggleUserStatus}
            />
          )}

          {activeTab === "borrows" && (
            <BorrowsTab
              borrows={borrows}
              onProcessReturn={handleProcessReturn}
            />
          )}

          {activeTab === "returns" && (
            <ReturnsOverdueTab
              borrows={borrows}
              onProcessReturn={handleProcessReturn}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsTab stats={stats} books={books} borrows={borrows} />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab
              notifications={notifications}
              onMarkAllAsRead={() => {
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, read: true }))
                );
                toast.success("All notifications marked as read.");
              }}
              onClearNotifications={() => {
                setNotifications([]);
                toast.success("Notifications cleared.");
              }}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab adminEmails={adminEmails} />
          )}
        </main>
      </div>

      {/* 3. Global Modal Overlays */}
      <BookFormModal
        isOpen={isBookFormOpen}
        onClose={() => {
          setIsBookFormOpen(false);
          setBookToEdit(null);
        }}
        bookToEdit={bookToEdit}
        onSuccess={handleBookSuccess}
      />

      <BookDetailsModal
        book={selectedBookForDetails}
        isOpen={isBookDetailsOpen}
        onClose={() => {
          setIsBookDetailsOpen(false);
          setSelectedBookForDetails(null);
        }}
        onEdit={(book) => {
          setBookToEdit(book);
          setIsBookFormOpen(true);
        }}
        onDelete={(book) => {
          setBookToDelete(book);
          setIsDeleteBookOpen(true);
        }}
      />

      <UserDetailsModal
        user={selectedUserForDetails}
        borrows={selectedUserBorrows}
        isOpen={isUserDetailsOpen}
        onClose={() => {
          setIsUserDetailsOpen(false);
          setSelectedUserForDetails(null);
          setSelectedUserBorrows([]);
        }}
        onProcessReturn={handleProcessReturn}
        onToggleStatus={handleToggleUserStatus}
      />

      <DeleteBookModal
        book={bookToDelete}
        isOpen={isDeleteBookOpen}
        onClose={() => {
          setIsDeleteBookOpen(false);
          setBookToDelete(null);
        }}
        onConfirm={handleDeleteBookConfirm}
      />
    </div>
  );
}

