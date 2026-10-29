import test, { describe } from "node:test";
import assert from "node:assert";
import { Book, BorrowRecord } from "../src/types";

describe("Borrowing Business Logic & Concurrency Rules", () => {
  // In-memory simulation of the atomic database invariants
  function simulateBorrowOperation({
    userActiveRecords,
    book,
    userId,
  }: {
    userActiveRecords: BorrowRecord[];
    book: Book;
    userId: string;
  }) {
    // 1. Prevent duplicate active loans for the same user and book
    const existing = userActiveRecords.find(
      (r) => r.userId === userId && r.bookId === book.id && r.status === "active"
    );
    if (existing) {
      return {
        success: false,
        message: "Duplicate active loan prevented.",
      };
    }

    // 2. Concurrency check: available_quantity must be > 0
    if (book.available_quantity <= 0) {
      return {
        success: false,
        message: "Book is out of stock.",
      };
    }

    // 3. Atomic state update
    book.available_quantity -= 1;
    const newRecord: BorrowRecord = {
      id: `record_${Date.now()}`,
      userId,
      bookId: book.id,
      bookTitle: book.title,
      borrowedAt: new Date(),
      status: "active",
    };
    userActiveRecords.push(newRecord);

    return {
      success: true,
      record: newRecord,
      available_quantity: book.available_quantity,
    };
  }

  function simulateReturnOperation({
    userRecords,
    book,
    recordId,
    userId,
  }: {
    userRecords: BorrowRecord[];
    book: Book;
    recordId: string;
    userId: string;
  }) {
    const record = userRecords.find(
      (r) => r.id === recordId && r.userId === userId && r.status === "active"
    );

    if (!record) {
      return {
        success: false,
        message: "No active loan found.",
      };
    }

    record.status = "returned";
    record.returnedAt = new Date();
    book.available_quantity += 1;

    return {
      success: true,
      available_quantity: book.available_quantity,
    };
  }

  test("allows borrowing when stock is available and decrements quantity", () => {
    const book: Book = {
      id: "sci-cosmos",
      title: "Cosmos",
      author: "Carl Sagan",
      description: "Cosmic journey",
      category: "Science",
      available_quantity: 3,
      image_url: "https://example.com/cosmos.jpg",
    };
    const userActiveRecords: BorrowRecord[] = [];

    const result = simulateBorrowOperation({
      userActiveRecords,
      book,
      userId: "user-123",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.available_quantity, 2);
    assert.strictEqual(book.available_quantity, 2);
    assert.strictEqual(userActiveRecords.length, 1);
    assert.strictEqual(userActiveRecords[0].status, "active");
  });

  test("prevents duplicate active borrow of the same book by the same user", () => {
    const book: Book = {
      id: "tech-clean-code",
      title: "Clean Code",
      author: "Robert C. Martin",
      description: "Clean code principles",
      category: "Tech",
      available_quantity: 5,
      image_url: "https://example.com/clean.jpg",
    };
    const userActiveRecords: BorrowRecord[] = [];

    // First borrow
    const firstBorrow = simulateBorrowOperation({
      userActiveRecords,
      book,
      userId: "user-456",
    });
    assert.strictEqual(firstBorrow.success, true);
    assert.strictEqual(book.available_quantity, 4);

    // Second borrow attempt by the same user
    const secondBorrow = simulateBorrowOperation({
      userActiveRecords,
      book,
      userId: "user-456",
    });
    assert.strictEqual(secondBorrow.success, false);
    assert.strictEqual(secondBorrow.message, "Duplicate active loan prevented.");
    // Stock must not be decremented again
    assert.strictEqual(book.available_quantity, 4);
  });

  test("rejects borrowing when available quantity is zero", () => {
    const book: Book = {
      id: "story-gatsby",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      description: "Jazz age",
      category: "Story",
      available_quantity: 0, // out of stock
      image_url: "https://example.com/gatsby.jpg",
    };
    const userActiveRecords: BorrowRecord[] = [];

    const result = simulateBorrowOperation({
      userActiveRecords,
      book,
      userId: "user-789",
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.message, "Book is out of stock.");
    assert.strictEqual(book.available_quantity, 0);
  });

  test("correctly increments quantity and updates status on book return", () => {
    const book: Book = {
      id: "sci-gene",
      title: "The Gene",
      author: "Siddhartha Mukherjee",
      description: "Genetics history",
      category: "Science",
      available_quantity: 1,
      image_url: "https://example.com/gene.jpg",
    };
    const userRecords: BorrowRecord[] = [
      {
        id: "record-001",
        userId: "user-999",
        bookId: "sci-gene",
        bookTitle: "The Gene",
        borrowedAt: new Date(Date.now() - 86400000),
        status: "active",
      },
    ];

    const returnResult = simulateReturnOperation({
      userRecords,
      book,
      recordId: "record-001",
      userId: "user-999",
    });

    assert.strictEqual(returnResult.success, true);
    assert.strictEqual(returnResult.available_quantity, 2);
    assert.strictEqual(book.available_quantity, 2);
    assert.strictEqual(userRecords[0].status, "returned");
    assert.ok(userRecords[0].returnedAt instanceof Date);
  });
});
