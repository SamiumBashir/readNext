import { getDb } from "@/lib/mongodb";
import { Book, BookCategory } from "@/types";
import { INITIAL_BOOKS } from "@/lib/seed-data";

export async function ensureBookIndexes(): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection<Book>("books");
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ title: 1 });
  } catch (error) {
    console.warn("Failed to ensure book indexes:", error);
  }
}

export async function seedBooks(force = false): Promise<{ count: number; seeded: boolean }> {
  const db = await getDb();
  const collection = db.collection<Book>("books");

  await ensureBookIndexes();

  const count = await collection.countDocuments();
  if (count > 0 && !force) {
    return { count, seeded: false };
  }

  // Idempotent upsert of all initial books
  for (const book of INITIAL_BOOKS) {
    await collection.updateOne(
      { id: book.id },
      {
        $set: {
          ...book,
          created_at: new Date(),
        },
      },
      { upsert: true }
    );
  }

  const finalCount = await collection.countDocuments();
  return { count: finalCount, seeded: true };
}

export async function getFeaturedBooks(limit = 4): Promise<Book[]> {
  try {
    const db = await getDb();
    const collection = db.collection<Book>("books");

    // Ensure database has data
    const count = await collection.countDocuments();
    if (count === 0) {
      await seedBooks();
    }

    // Try finding books marked as featured first, fallback to first 4
    let books = await collection
      .find({ featured: true })
      .limit(limit)
      .toArray();

    if (books.length < limit) {
      books = await collection.find({}).limit(limit).toArray();
    }

    return books.map((doc) => ({
      ...doc,
      _id: doc._id?.toString(),
    }));
  } catch (error) {
    console.error("Error fetching featured books from MongoDB:", error);
    // If DB is unreachable during build or without credentials, return empty or fallback
    return [];
  }
}

export interface GetBooksParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface GetBooksResult {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getBooks({
  search,
  category,
  page = 1,
  limit = 9,
}: GetBooksParams = {}): Promise<GetBooksResult> {
  try {
    const db = await getDb();
    const collection = db.collection<Book>("books");

    // Ensure database has data
    const count = await collection.countDocuments();
    if (count === 0) {
      await seedBooks();
    }

    const query: Record<string, unknown> = {};

    // Filter by category if specified and not "All" / "All Books"
    if (
      category &&
      category.toLowerCase() !== "all" &&
      category.toLowerCase() !== "all books"
    ) {
      // Capitalize first letter to match "Story" | "Tech" | "Science"
      const normalizedCategory = (category.charAt(0).toUpperCase() +
        category.slice(1).toLowerCase()) as BookCategory;
      query.category = normalizedCategory;
    }

    // Search by title (case-insensitive substring)
    if (search && search.trim() !== "") {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.title = { $regex: sanitized, $options: "i" };
    }

    const total = await collection.countDocuments(query);
    const skip = (Math.max(1, page) - 1) * limit;

    const books = await collection
      .find(query)
      .sort({ title: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const formattedBooks = books.map((doc) => ({
      ...doc,
      _id: doc._id?.toString(),
    }));

    return {
      books: formattedBooks,
      total,
      page: Math.max(1, page),
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  } catch (error) {
    console.error("Error querying books from MongoDB:", error);
    return {
      books: [],
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
    };
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const db = await getDb();
    const collection = db.collection<Book>("books");

    // Ensure database has data
    const count = await collection.countDocuments();
    if (count === 0) {
      await seedBooks();
    }

    const book = await collection.findOne({ id });
    if (!book) return null;

    return {
      ...book,
      _id: book._id?.toString(),
    };
  } catch (error) {
    console.error(`Error fetching book ${id} from MongoDB:`, error);
    return null;
  }
}

export function generateBookId(title: string, category: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 30);
  const cat = category.toLowerCase().slice(0, 5);
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${cat}-${cleanTitle || "volume"}-${randomSuffix}`;
}

export async function createBook(
  input: Omit<Book, "_id" | "id" | "created_at"> & { id?: string }
): Promise<Book> {
  const db = await getDb();
  const collection = db.collection<Book>("books");

  await ensureBookIndexes();

  const count = await collection.countDocuments();
  if (count === 0) {
    await seedBooks();
  }

  const id = input.id || generateBookId(input.title, input.category);

  const newBook: Book = {
    ...input,
    id,
    created_at: new Date(),
  };

  const result = await collection.insertOne(newBook as any);

  return {
    ...newBook,
    _id: result.insertedId.toString(),
  };
}

export async function deleteBook(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    const collection = db.collection<Book>("books");
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting book ${id} from MongoDB:`, error);
    return false;
  }
}
