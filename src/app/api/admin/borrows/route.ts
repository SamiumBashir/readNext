import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import {
  getAllBorrowRecordsAdmin,
  adminReturnBook,
} from "@/services/borrow.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    if (!isUserAdmin(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Curator administrator privilege required.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await getAllBorrowRecordsAdmin({
      status,
      search,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("API GET /api/admin/borrows error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve borrow records." },
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
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    if (!isUserAdmin(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Curator administrator privilege required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const recordId = body?.recordId;

    if (!recordId || typeof recordId !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid borrow record ID is required." },
        { status: 400 }
      );
    }

    const result = await adminReturnBook(recordId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    revalidatePath("/admin");
    revalidatePath("/books");
    revalidatePath("/profile");

    return NextResponse.json({
      success: true,
      message: result.message,
      record: result.record,
      available_quantity: result.available_quantity,
    });
  } catch (error) {
    console.error("API PUT /api/admin/borrows error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error occurred while processing return.",
      },
      { status: 500 }
    );
  }
}

