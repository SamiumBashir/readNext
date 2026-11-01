import { test, describe } from "node:test";
import assert from "node:assert";
import { updateBookSchema } from "../src/lib/validations";
import { BorrowRecord } from "../src/types";

const LOAN_PERIOD_DAYS = 14;
const LOAN_PERIOD_MS = LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000;

function computeDueDate(borrowedAt: Date, existingDueDate?: Date): Date {
  return existingDueDate
    ? new Date(existingDueDate)
    : new Date(borrowedAt.getTime() + LOAN_PERIOD_MS);
}

function isLoanOverdue(record: { borrowedAt: Date; dueDate?: Date; status: string }): boolean {
  if (record.status !== "active") return false;
  const due = record.dueDate
    ? new Date(record.dueDate).getTime()
    : new Date(record.borrowedAt).getTime() + LOAN_PERIOD_MS;
  return Date.now() > due;
}

describe("Admin Dashboard & Loan Calculations", () => {
  test("computes standard 14-day due date for borrow records without explicit dueDate", () => {
    const borrowedAt = new Date("2026-10-01T10:00:00.000Z");
    const dueDate = computeDueDate(borrowedAt);

    assert.ok(dueDate, "Due date must be defined");
    const diffDays = Math.round(
      (dueDate.getTime() - borrowedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    assert.strictEqual(diffDays, 14, "Standard loan period must be exactly 14 days");
  });

  test("accurately flags overdue loans that have exceeded the 14-day loan window", () => {
    const oldBorrowedAt = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000); // 16 days ago
    const isOverdue = isLoanOverdue({
      borrowedAt: oldBorrowedAt,
      status: "active",
    });

    assert.strictEqual(isOverdue, true, "Active loan older than 14 days must be overdue");
  });

  test("does not flag returned books as overdue even if returned after due date", () => {
    const oldBorrowedAt = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const isOverdue = isLoanOverdue({
      borrowedAt: oldBorrowedAt,
      status: "returned",
    });

    assert.strictEqual(isOverdue, false, "Returned loans must not be marked overdue");
  });

  test("validates book update schema with partial fields", () => {
    const validUpdate = {
      id: "book-123",
      title: "Updated Title of Novel",
      available_quantity: 0, // 0 is valid for existing book when all checked out
    };

    const result = updateBookSchema.safeParse(validUpdate);
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.title, "Updated Title of Novel");
      assert.strictEqual(result.data.available_quantity, 0);
    }
  });

  test("rejects updateBookSchema when id is missing", () => {
    const invalidUpdate = {
      title: "Missing ID",
    };

    const result = updateBookSchema.safeParse(invalidUpdate);
    assert.strictEqual(result.success, false);
  });
});
