import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import ProfileEditClient from "@/components/profile/ProfileEditClient";

export const metadata: Metadata = {
  title: "Edit Profile — ReadNest Library",
  description: "Update your reader profile name and avatar image.",
};

export default async function ProfileEditPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/profile/edit");
  }

  return (
    <ProfileEditClient
      initialUser={{
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email,
        image: session.user.image,
      }}
    />
  );
}
