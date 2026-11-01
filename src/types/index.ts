export type BookCategory = "Story" | "Tech" | "Science";

export interface Book {
  _id?: string;
  id: string;
  title: string;
  author: string;
  description: string;
  category: BookCategory;
  available_quantity: number;
  total_copies?: number;
  image_url: string;
  featured?: boolean;
  pages?: number;
  published_year?: number;
  isbn?: string;
  created_at?: Date;
}

export type BorrowStatus = "active" | "returned";

export interface BorrowRecord {
  _id?: string;
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  bookId: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookImage?: string;
  category?: BookCategory;
  borrowedAt: Date;
  dueDate?: Date;
  status: BorrowStatus;
  returnedAt?: Date;
}

export interface BorrowOperationResponse {
  success: boolean;
  message: string;
  record?: BorrowRecord;
  available_quantity?: number;
}

export interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date | string;
  role?: string;
  status: "active" | "suspended";
  totalBorrowed: number;
  currentlyBorrowed: number;
  returnedCount: number;
  overdueCount: number;
}

export interface DashboardStats {
  totalBooks: number;
  registeredUsers: number;
  totalBorrowed: number;
  currentlyBorrowed: number;
  overdueBooks: number;
  availableBooks: number;
  totalCopies: number;
  returnRate: number;
  categoryCounts: {
    story: number;
    tech: number;
    science: number;
  };
}

export interface NotificationItem {
  id: string;
  type: "overdue" | "stock" | "user" | "system";
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  link?: string;
}
