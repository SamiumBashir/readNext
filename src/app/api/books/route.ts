import { NextRequest, NextResponse } from "next/server";
import { getBooks } from "@/services/book.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "9", 10);

    const result = await getBooks({
      search,
      category,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("API GET /api/books error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve books from database" },
      { status: 500 }
    );
  }
}
