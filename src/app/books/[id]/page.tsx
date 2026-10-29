import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getBookById } from "@/services/book.service";
import { checkUserHasActiveBorrow } from "@/services/borrow.service";
import BookDetailClient from "@/components/books/BookDetailClient";

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BookDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    return {
      title: "Book Not Found — ReadNest",
      description: "The requested volume could not be located in our archives.",
    };
  }

  return {
    title: `${book.title} — ReadNest Library`,
    description: book.description,
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;

  // 1. Verify authenticated session on server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    // Redirect unauthenticated readers to /login with safe return destination
    redirect(`/login?callbackUrl=${encodeURIComponent(`/books/${id}`)}`);
  }

  // 2. Validate book existence
  const book = await getBookById(id);
  if (!book) {
    notFound();
  }

  // 3. Check if user already holds an active loan
  const hasActiveBorrow = await checkUserHasActiveBorrow(
    session.user.id,
    book.id
  );

  return (
    <BookDetailClient
      book={book}
      initialHasActiveBorrow={hasActiveBorrow}
    />
  );
}
