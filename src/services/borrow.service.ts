import { getDb } from "@/lib/mongodb";
import { Book, BorrowRecord, BorrowOperationResponse } from "@/types";

export async function ensureBorrowIndexes(): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection<BorrowRecord>("borrow_records");
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ bookId: 1 });
    await collection.createIndex({ userId: 1, bookId: 1, status: 1 });
  } catch (error) {
    console.warn("Failed to ensure borrow indexes:", error);
  }
}

export async function borrowBook(
  userId: string,
  bookId: string,
  userMeta?: { email?: string; name?: string }
): Promise<BorrowOperationResponse> {
  const db = await getDb();
  const booksCollection = db.collection<Book>("books");
  const borrowCollection = db.collection<BorrowRecord>("borrow_records");

  await ensureBorrowIndexes();

  // 1. Check if user already has an active borrow record for this book
  const existingActive = await borrowCollection.findOne({
    userId,
    bookId,
    status: "active",
  });

  if (existingActive) {
    return {
      success: false,
      message:
        "You already have an active loan for this book. Please return your current copy before borrowing another.",
    };
  }

  // 2. Atomic decrement with concurrency protection (available_quantity > 0)
  const updatedBook = await booksCollection.findOneAndUpdate(
    { id: bookId, available_quantity: { $gt: 0 } },
    { $inc: { available_quantity: -1 } },
    { returnDocument: "after" }
  );

  if (!updatedBook) {
    // Check if book exists at all or if stock is 0
    const exists = await booksCollection.findOne({ id: bookId });
    if (!exists) {
      return {
        success: false,
        message: "The requested book was not found in the library catalogue.",
      };
    }

    return {
      success: false,
      message:
        "All copies of this volume are currently checked out. Please check back later.",
    };
  }

  // 3. Create persistent borrow record
  const recordId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `borrow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const newRecord: BorrowRecord = {
    id: recordId,
    userId,
    userEmail: userMeta?.email,
    userName: userMeta?.name,
    bookId,
    bookTitle: updatedBook.title,
    bookAuthor: updatedBook.author,
    bookImage: updatedBook.image_url,
    category: updatedBook.category,
    borrowedAt: new Date(),
    status: "active",
  };

  await borrowCollection.insertOne(newRecord);

  return {
    success: true,
    message: `“${updatedBook.title}” has been successfully added to your active borrowed books.`,
    record: newRecord,
    available_quantity: updatedBook.available_quantity,
  };
}

export async function returnBook(
  userId: string,
  recordId: string
): Promise<BorrowOperationResponse> {
  const db = await getDb();
  const booksCollection = db.collection<Book>("books");
  const borrowCollection = db.collection<BorrowRecord>("borrow_records");

  // 1. Locate the active record for this user
  const record = await borrowCollection.findOne({
    id: recordId,
    userId,
    status: "active",
  });

  if (!record) {
    return {
      success: false,
      message: "No active loan record found for this transaction.",
    };
  }

  // 2. Mark record as returned
  await borrowCollection.updateOne(
    { id: recordId },
    {
      $set: {
        status: "returned",
        returnedAt: new Date(),
      },
    }
  );

  // 3. Restore inventory count
  const updatedBook = await booksCollection.findOneAndUpdate(
    { id: record.bookId },
    { $inc: { available_quantity: 1 } },
    { returnDocument: "after" }
  );

  return {
    success: true,
    message: `“${record.bookTitle || "The book"}” has been successfully returned to the library.`,
    available_quantity: updatedBook ? updatedBook.available_quantity : undefined,
  };
}

export async function getUserBorrowRecords(
  userId: string
): Promise<BorrowRecord[]> {
  try {
    const db = await getDb();
    const borrowCollection = db.collection<BorrowRecord>("borrow_records");

    const records = await borrowCollection
      .find({ userId })
      .sort({ borrowedAt: -1 })
      .toArray();

    return records.map((doc) => ({
      ...doc,
      _id: doc._id?.toString(),
    }));
  } catch (error) {
    console.error("Error fetching user borrow records:", error);
    return [];
  }
}

export async function checkUserHasActiveBorrow(
  userId: string,
  bookId: string
): Promise<boolean> {
  try {
    const db = await getDb();
    const borrowCollection = db.collection<BorrowRecord>("borrow_records");

    const record = await borrowCollection.findOne({
      userId,
      bookId,
      status: "active",
    });

    return !!record;
  } catch (error) {
    console.error("Error checking active borrow status:", error);
    return false;
  }
}
