import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import { getBooks, createBook, deleteBook, updateBook } from "@/services/book.service";
import { createBookSchema, updateBookSchema } from "@/lib/validations";

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

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required to publish books into the archive.",
        },
        { status: 401 }
      );
    }

    if (!isUserAdmin(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Forbidden: Only verified library administrators can publish new volumes.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const formattedBody = {
      ...body,
      available_quantity:
        typeof body.available_quantity === "string"
          ? parseInt(body.available_quantity, 10)
          : body.available_quantity,
      pages:
        typeof body.pages === "string" && body.pages.trim() !== ""
          ? parseInt(body.pages, 10)
          : body.pages || undefined,
      published_year:
        typeof body.published_year === "string" && body.published_year.trim() !== ""
          ? parseInt(body.published_year, 10)
          : body.published_year || undefined,
    };
    const parsed = createBookSchema.safeParse(formattedBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Validation failed",
          errors: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      title,
      author,
      description,
      category,
      available_quantity,
      image_url,
      featured = false,
      pages,
      published_year,
      isbn,
    } = parsed.data;

    const newBook = await createBook({
      title,
      author,
      description,
      category,
      available_quantity,
      image_url,
      featured: Boolean(featured),
      pages: pages ?? undefined,
      published_year: published_year ?? undefined,
      isbn: isbn ?? undefined,
    });

    revalidatePath("/books");
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json(
      {
        success: true,
        message: `Book "${newBook.title}" successfully added to archive.`,
        book: newBook,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST /api/books error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error occurred while publishing book.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required to remove books from the archive.",
        },
        { status: 401 }
      );
    }

    if (!isUserAdmin(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Forbidden: Only verified library administrators can remove volumes.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const id = searchParams.get("id") || body?.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid book ID is required for deletion." },
        { status: 400 }
      );
    }

    const deleted = await deleteBook(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Book not found or could not be removed." },
        { status: 404 }
      );
    }

    revalidatePath("/books");
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Volume removed successfully from archive.",
    });
  } catch (error) {
    console.error("API DELETE /api/books error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error occurred while deleting book.",
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
          message: "Authentication required to modify book archive.",
        },
        { status: 401 }
      );
    }

    if (!isUserAdmin(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Forbidden: Only verified library administrators can modify volumes.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const formattedBody = {
      ...body,
      available_quantity:
        typeof body.available_quantity === "string"
          ? parseInt(body.available_quantity, 10)
          : body.available_quantity,
      total_copies:
        typeof body.total_copies === "string"
          ? parseInt(body.total_copies, 10)
          : body.total_copies,
      pages:
        typeof body.pages === "string" && body.pages.trim() !== ""
          ? parseInt(body.pages, 10)
          : body.pages,
      published_year:
        typeof body.published_year === "string" && body.published_year.trim() !== ""
          ? parseInt(body.published_year, 10)
          : body.published_year,
    };

    const parsed = updateBookSchema.safeParse(formattedBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Validation failed",
          errors: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { id, ...updates } = parsed.data;

    // Filter out undefined values
    const cleanUpdates: any = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        cleanUpdates[key] = val;
      }
    }

    const updated = await updateBook(id, cleanUpdates);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Book was not found or could not be updated." },
        { status: 404 }
      );
    }

    revalidatePath("/books");
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: `Book “${updated.title}” updated successfully.`,
      book: updated,
    });
  } catch (error) {
    console.error("API PUT /api/books error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error occurred while updating book.",
      },
      { status: 500 }
    );
  }
}

