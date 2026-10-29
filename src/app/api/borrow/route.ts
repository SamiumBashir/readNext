import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  borrowBook,
  returnBook,
  getUserBorrowRecords,
} from "@/services/borrow.service";
import { borrowSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required. Please sign in to borrow books.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = borrowSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request payload. Book ID is required.",
          errors: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const result = await borrowBook(session.user.id, parsed.data.bookId, {
      email: session.user.email,
      name: session.user.name,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API POST /api/borrow error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal database error occurred while processing the borrow request.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const recordId = body.recordId;

    if (!recordId) {
      return NextResponse.json(
        {
          success: false,
          message: "Record ID is required for returning a book.",
        },
        { status: 400 }
      );
    }

    const result = await returnBook(session.user.id, recordId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API PUT /api/borrow error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while processing book return.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const records = await getUserBorrowRecords(session.user.id);
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("API GET /api/borrow error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load borrow records.",
      },
      { status: 500 }
    );
  }
}
