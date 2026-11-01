import { getDb } from "@/lib/mongodb";
import { Book, BorrowRecord, BorrowOperationResponse, DashboardStats } from "@/types";

const LOAN_PERIOD_DAYS = 14;
const LOAN_PERIOD_MS = LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export async function ensureBorrowIndexes(): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection<BorrowRecord>("borrow_records");
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ bookId: 1 });
    await collection.createIndex({ userId: 1, bookId: 1, status: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ borrowedAt: -1 });
  } catch (error) {
    console.warn("Failed to ensure borrow indexes:", error);
  }
}

/**
 * Normalizes borrow record with computed due date
 */
export function formatBorrowRecord(doc: any): BorrowRecord {
  const borrowedAtDate = doc.borrowedAt ? new Date(doc.borrowedAt) : new Date();
  const dueDate = doc.dueDate
    ? new Date(doc.dueDate)
    : new Date(borrowedAtDate.getTime() + LOAN_PERIOD_MS);

  return {
    ...doc,
    _id: doc._id?.toString(),
    id: doc.id || doc._id?.toString(),
    borrowedAt: borrowedAtDate,
    dueDate,
    returnedAt: doc.returnedAt ? new Date(doc.returnedAt) : undefined,
    status: doc.status || "active",
  };
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

  const now = new Date();
  const dueDate = new Date(now.getTime() + LOAN_PERIOD_MS);

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
    borrowedAt: now,
    dueDate,
    status: "active",
  };

  await borrowCollection.insertOne(newRecord as any);

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

/**
 * Admin action to process a return for any user record
 * Enforces atomic state update and inventory restoration
 */
export async function adminReturnBook(
  recordId: string
): Promise<BorrowOperationResponse> {
  const db = await getDb();
  const booksCollection = db.collection<Book>("books");
  const borrowCollection = db.collection<BorrowRecord>("borrow_records");

  // 1. Find record and ensure it is currently active to prevent double-returns
  const record = await borrowCollection.findOne({
    id: recordId,
    status: "active",
  });

  if (!record) {
    return {
      success: false,
      message:
        "Loan record was not found or has already been marked as returned.",
    };
  }

  const now = new Date();

  // 2. Mark record as returned
  await borrowCollection.updateOne(
    { id: recordId },
    {
      $set: {
        status: "returned",
        returnedAt: now,
      },
    }
  );

  // 3. Atomically restore book inventory
  const updatedBook = await booksCollection.findOneAndUpdate(
    { id: record.bookId },
    { $inc: { available_quantity: 1 } },
    { returnDocument: "after" }
  );

  return {
    success: true,
    message: `Book “${record.bookTitle || "Volume"}” returned successfully. Stock incremented.`,
    record: {
      ...record,
      status: "returned",
      returnedAt: now,
    },
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

    return records.map(formatBorrowRecord);
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

export interface GetAllBorrowsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Retrieve all borrow records with filtering and search for admin table
 */
export async function getAllBorrowRecordsAdmin({
  status,
  search,
  page = 1,
  limit = 50,
}: GetAllBorrowsParams = {}): Promise<{
  records: BorrowRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    const db = await getDb();
    const collection = db.collection<BorrowRecord>("borrow_records");

    const filter: any = {};

    if (status && status !== "all") {
      if (status === "overdue") {
        const overdueCutoff = new Date(Date.now() - LOAN_PERIOD_MS);
        filter.status = "active";
        filter.borrowedAt = { $lt: overdueCutoff };
      } else if (status === "ongoing" || status === "active") {
        filter.status = "active";
      } else if (status === "returned") {
        filter.status = "returned";
      }
    }

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { bookTitle: regex },
        { bookAuthor: regex },
        { userName: regex },
        { userEmail: regex },
      ];
    }

    const total = await collection.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;

    const rawRecords = await collection
      .find(filter)
      .sort({ borrowedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const records = rawRecords.map(formatBorrowRecord);

    return {
      records,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching all borrow records for admin:", error);
    return {
      records: [],
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
    };
  }
}

/**
 * Compile high-fidelity dashboard metrics, historical trends, and activity lists
 */
export async function getDashboardAnalytics(): Promise<
  DashboardStats & {
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
  }
> {
  try {
    const db = await getDb();
    const booksCollection = db.collection<Book>("books");
    const userCollection = db.collection("user");
    const borrowCollection = db.collection<BorrowRecord>("borrow_records");

    const now = Date.now();
    const overdueCutoff = new Date(now - LOAN_PERIOD_MS);

    // 1. Core Counts
    const [
      totalBooks,
      registeredUsers,
      totalBorrowed,
      currentlyBorrowed,
      overdueCount,
      allBooks,
      rawBorrows,
    ] = await Promise.all([
      booksCollection.countDocuments(),
      userCollection.countDocuments(),
      borrowCollection.countDocuments(),
      borrowCollection.countDocuments({ status: "active" }),
      borrowCollection.countDocuments({
        status: "active",
        borrowedAt: { $lt: overdueCutoff },
      }),
      booksCollection.find({}).toArray(),
      borrowCollection.find({}).sort({ borrowedAt: -1 }).toArray(),
    ]);

    // Available copies sum
    const availableBooks = allBooks.reduce(
      (sum, b) => sum + (b.available_quantity || 0),
      0
    );

    const totalCopies = allBooks.reduce((sum, b) => {
      if (typeof b.total_copies === "number" && b.total_copies > 0) {
        return sum + b.total_copies;
      }
      return sum + (b.available_quantity || 0);
    }, 0);

    const returnRate =
      totalBorrowed > 0
        ? Math.round(((totalBorrowed - currentlyBorrowed) / totalBorrowed) * 100)
        : 100;

    // Category breakdown
    const categoryCounts = {
      story: allBooks.filter((b) => b.category === "Story").length,
      tech: allBooks.filter((b) => b.category === "Tech").length,
      science: allBooks.filter((b) => b.category === "Science").length,
    };

    // 2. Most Borrowed Books Ranking
    const borrowCountsByBook: Record<string, number> = {};
    for (const b of rawBorrows) {
      if (b.bookId) {
        borrowCountsByBook[b.bookId] = (borrowCountsByBook[b.bookId] || 0) + 1;
      }
    }

    const mostBorrowedBooks = Object.entries(borrowCountsByBook)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([bookId, count]) => {
        const book = allBooks.find((item) => item.id === bookId);
        return {
          id: bookId,
          title: book?.title || "Archived Volume",
          author: book?.author || "Curated Author",
          image_url: book?.image_url || "/images/hero-showcase.jpg",
          category: book?.category || "Tech",
          borrowCount: count,
          available_quantity: book?.available_quantity || 0,
        };
      });

    // 3. Recent Borrows & Overdue Borrows
    const formattedBorrows = rawBorrows.map(formatBorrowRecord);
    const recentBorrows = formattedBorrows.slice(0, 8);
    const overdueBorrows = formattedBorrows
      .filter((b) => {
        if (b.status !== "active") return false;
        const bDate = b.borrowedAt ? new Date(b.borrowedAt).getTime() : 0;
        const dDate = b.dueDate ? new Date(b.dueDate).getTime() : bDate + LOAN_PERIOD_MS;
        return now > dDate;
      })
      .slice(0, 10);

    // 4. Generate Activity Trend Data (Weekly, Monthly, Yearly)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData: { label: string; borrowed: number; returned: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const label = days[d.getDay()];

      const borrowed = rawBorrows.filter((b) => {
        const t = new Date(b.borrowedAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;

      const returned = rawBorrows.filter((b) => {
        if (!b.returnedAt) return false;
        const t = new Date(b.returnedAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;

      weeklyData.push({ label, borrowed, returned });
    }

    // Monthly data (last 4 weeks)
    const monthlyData: { label: string; borrowed: number; returned: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
      const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000;
      const label = `Week ${4 - i}`;

      const borrowed = rawBorrows.filter((b) => {
        const t = new Date(b.borrowedAt).getTime();
        return t >= weekStart && t < weekEnd;
      }).length;

      const returned = rawBorrows.filter((b) => {
        if (!b.returnedAt) return false;
        const t = new Date(b.returnedAt).getTime();
        return t >= weekStart && t < weekEnd;
      }).length;

      monthlyData.push({ label, borrowed, returned });
    }

    // Yearly data (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearlyData: { label: string; borrowed: number; returned: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const label = monthNames[m];

      const borrowed = rawBorrows.filter((b) => {
        const bt = new Date(b.borrowedAt);
        return bt.getMonth() === m && bt.getFullYear() === y;
      }).length;

      const returned = rawBorrows.filter((b) => {
        if (!b.returnedAt) return false;
        const rt = new Date(b.returnedAt);
        return rt.getMonth() === m && rt.getFullYear() === y;
      }).length;

      yearlyData.push({ label, borrowed, returned });
    }

    return {
      totalBooks,
      registeredUsers,
      totalBorrowed,
      currentlyBorrowed,
      overdueBooks: overdueCount,
      availableBooks,
      totalCopies: Math.max(totalCopies, availableBooks + currentlyBorrowed),
      returnRate,
      categoryCounts,
      mostBorrowedBooks,
      recentBorrows,
      overdueBorrows,
      activityTrend: {
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData,
      },
    };
  } catch (error) {
    console.error("Error computing dashboard analytics:", error);
    return {
      totalBooks: 0,
      registeredUsers: 0,
      totalBorrowed: 0,
      currentlyBorrowed: 0,
      overdueBooks: 0,
      availableBooks: 0,
      totalCopies: 0,
      returnRate: 100,
      categoryCounts: { story: 0, tech: 0, science: 0 },
      mostBorrowedBooks: [],
      recentBorrows: [],
      overdueBorrows: [],
      activityTrend: {
        weekly: [],
        monthly: [],
        yearly: [],
      },
    };
  }
}
