import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { AdminUser, BorrowRecord } from "@/types";

const LOAN_PERIOD_DAYS = 14;
const LOAN_PERIOD_MS = LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000;

/**
 * Normalizes a borrow record with computed due date and overdue status
 */
export function enrichBorrowRecord(doc: any): BorrowRecord {
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

/**
 * Retrieve all registered users along with aggregated borrowing stats
 */
export async function getAllUsersAdmin(): Promise<AdminUser[]> {
  try {
    const db = await getDb();
    const userCollection = db.collection("user");
    const borrowCollection = db.collection<BorrowRecord>("borrow_records");

    const users = await userCollection.find({}).sort({ createdAt: -1 }).toArray();
    const now = Date.now();

    // Fetch all borrow records to aggregate per user efficiently in memory
    const allBorrows = await borrowCollection.find({}).toArray();

    return users.map((u) => {
      const userIdStr = u._id?.toString() || u.id || "";
      const userEmail = (u.email || "").toLowerCase();

      // Match borrows by either userId or userEmail
      const userLoans = allBorrows.filter(
        (b) =>
          b.userId === userIdStr ||
          b.userId === u.id ||
          (b.userEmail && b.userEmail.toLowerCase() === userEmail)
      );

      const totalBorrowed = userLoans.length;
      const currentlyBorrowed = userLoans.filter((b) => b.status === "active").length;
      const returnedCount = userLoans.filter((b) => b.status === "returned").length;

      const overdueCount = userLoans.filter((b) => {
        if (b.status !== "active") return false;
        const bDate = b.borrowedAt ? new Date(b.borrowedAt).getTime() : 0;
        const dDate = b.dueDate ? new Date(b.dueDate).getTime() : bDate + LOAN_PERIOD_MS;
        return now > dDate;
      }).length;

      return {
        id: userIdStr,
        _id: userIdStr,
        name: u.name || "Library Reader",
        email: u.email || "unknown@readnest.org",
        image: u.image || null,
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        role: u.role || "reader",
        status: (u.status as "active" | "suspended") || "active",
        totalBorrowed,
        currentlyBorrowed,
        returnedCount,
        overdueCount,
      };
    });
  } catch (error) {
    console.error("Error fetching all users for admin:", error);
    return [];
  }
}

/**
 * Retrieve detailed profile for an individual user along with ALL their borrow records
 */
export async function getUserDetailsWithBorrows(
  userId: string
): Promise<{ user: AdminUser | null; borrows: BorrowRecord[] }> {
  try {
    const db = await getDb();
    const userCollection = db.collection("user");
    const borrowCollection = db.collection<BorrowRecord>("borrow_records");

    // Match user by ObjectId or string id
    let userDoc: any = null;
    try {
      if (ObjectId.isValid(userId)) {
        userDoc = await userCollection.findOne({ _id: new ObjectId(userId) });
      }
    } catch {
      // not a valid ObjectId
    }

    if (!userDoc) {
      userDoc = await userCollection.findOne({
        $or: [{ id: userId }, { _id: userId as any }],
      });
    }

    if (!userDoc) {
      return { user: null, borrows: [] };
    }

    const userIdStr = userDoc._id?.toString() || userDoc.id || userId;
    const userEmail = (userDoc.email || "").toLowerCase();

    // Query all borrow records for this user
    const rawBorrows = await borrowCollection
      .find({
        $or: [
          { userId: userIdStr },
          { userId: userDoc.id },
          { userEmail: userEmail },
        ],
      })
      .sort({ borrowedAt: -1 })
      .toArray();

    const borrows = rawBorrows.map(enrichBorrowRecord);

    const now = Date.now();
    const totalBorrowed = borrows.length;
    const currentlyBorrowed = borrows.filter((b) => b.status === "active").length;
    const returnedCount = borrows.filter((b) => b.status === "returned").length;
    const overdueCount = borrows.filter((b) => {
      if (b.status !== "active") return false;
      const dDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return now > dDate;
    }).length;

    const user: AdminUser = {
      id: userIdStr,
      _id: userIdStr,
      name: userDoc.name || "Library Reader",
      email: userDoc.email || "",
      image: userDoc.image || null,
      createdAt: userDoc.createdAt ? new Date(userDoc.createdAt) : new Date(),
      role: userDoc.role || "reader",
      status: (userDoc.status as "active" | "suspended") || "active",
      totalBorrowed,
      currentlyBorrowed,
      returnedCount,
      overdueCount,
    };

    return { user, borrows };
  } catch (error) {
    console.error(`Error fetching user details with borrows for ${userId}:`, error);
    return { user: null, borrows: [] };
  }
}

/**
 * Toggle user account status (active <-> suspended)
 */
export async function toggleUserStatus(
  userId: string,
  status: "active" | "suspended"
): Promise<boolean> {
  try {
    const db = await getDb();
    const userCollection = db.collection("user");

    let filter: any = { id: userId };
    if (ObjectId.isValid(userId)) {
      filter = { $or: [{ _id: new ObjectId(userId) }, { id: userId }] };
    }

    const result = await userCollection.updateOne(filter, {
      $set: {
        status,
        updatedAt: new Date(),
      },
    });

    return result.matchedCount > 0;
  } catch (error) {
    console.error(`Error updating user status for ${userId}:`, error);
    return false;
  }
}

