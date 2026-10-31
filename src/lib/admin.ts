/**
 * ReadNest Admin & Role-Based Access Control Utility
 *
 * Enforces curator privileges so only authorized library administrators
 * can access the book upload studio and modify library inventory.
 */

// Designated default administrator emails for ReadNest
const DEFAULT_ADMIN_EMAILS = [
  "samaufa36@gmail.com",
  "samiumbashirbosunia@gmail.com",
];

export function getAdminEmails(): string[] {
  const envAdmins = (
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    ""
  )
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envAdmins]));
}

export function isUserAdmin(
  user?: {
    email?: string | null;
    role?: string | null;
  } | null
): boolean {
  if (!user || !user.email) return false;

  // 1. Explicit admin role in user profile
  if (user.role === "admin") return true;

  // 2. Verified admin email whitelist check
  const normalizedEmail = user.email.trim().toLowerCase();
  const adminEmails = getAdminEmails();

  return adminEmails.includes(normalizedEmail);
}
