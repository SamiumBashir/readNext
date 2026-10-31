import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getBooks } from "@/services/book.service";
import AdminStudioClient from "@/components/admin/AdminStudioClient";

export const metadata: Metadata = {
  title: "Admin Book Studio — ReadNest Library",
  description:
    "Curator administration interface for uploading, publishing, and managing library books and stock.",
};

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/admin");
  }

  // Retrieve initial catalog of books for inventory management
  const booksResult = await getBooks({
    limit: 100,
  });

  return (
    <AdminStudioClient
      initialBooks={booksResult.books}
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}
