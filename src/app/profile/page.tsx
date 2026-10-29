import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserBorrowRecords } from "@/services/borrow.service";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "My Profile — ReadNest Library",
  description:
    "Manage your reader account, view active borrowed books, and track reading history.",
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/profile");
  }

  const records = await getUserBorrowRecords(session.user.id);

  return (
    <ProfileClient
      user={{
        id: session.user.id,
        name: session.user.name || "Reader Member",
        email: session.user.email,
        image: session.user.image,
        createdAt: session.user.createdAt,
      }}
      initialRecords={records}
    />
  );
}
