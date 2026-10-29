export type BookCategory = "Story" | "Tech" | "Science";

export interface Book {
  _id?: string;
  id: string;
  title: string;
  author: string;
  description: string;
  category: BookCategory;
  available_quantity: number;
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
  status: BorrowStatus;
  returnedAt?: Date;
}

export interface BorrowOperationResponse {
  success: boolean;
  message: string;
  record?: BorrowRecord;
  available_quantity?: number;
}
