"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations";
import { authClient } from "@/lib/auth-client";
import { isUserAdmin } from "@/lib/admin";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Library,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(
    searchParams.get("error") === "unauthorized"
      ? "Access Denied: Your current account does not have administrator privileges. Please sign in with an authorized curator account."
      : null
  );

  const { data: session } = authClient.useSession();

  // If already signed in as an admin, allow one-click entry to /admin
  const alreadyAdmin = session?.user && isUserAdmin(session.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const response = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (response.error) {
        const errorMsg =
          response.error.message ||
          "Invalid administrator credentials. Please verify your email and password.";
        setAuthError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Verify that the authenticated user is an authorized curator / admin
      const loggedInUser = response.data?.user || { email: data.email };
      const isAdmin = isUserAdmin(loggedInUser);

      if (!isAdmin) {
        // Immediately revoke session for non-admin on the admin portal
        await authClient.signOut();
        const msg =
          "Access Denied: This account is registered as a regular reader and does not possess administrator privileges.";
        setAuthError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Administrator authentication verified. Accessing Console...");
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during administrator authentication.";
      setAuthError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#174B32] to-[#103B29] text-[#F4A623] shadow-xl ring-1 ring-emerald-500/30">
          <ShieldCheck className="h-8 w-8 stroke-[2.2]" />
        </div>
        <div className="pt-2">
          <span className="rounded-full bg-emerald-900/60 px-3 py-1 text-[11px] font-bold tracking-widest text-emerald-300 uppercase ring-1 ring-emerald-500/30">
            Administrative Access Only
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white">
            Curator Portal
          </h1>
          <p className="mt-1.5 text-xs text-emerald-200/70">
            Sign in with authorized administrator credentials to manage library inventory, members, and loans.
          </p>
        </div>
      </div>

      {/* Already Signed In Banner (if already admin) */}
      {alreadyAdmin && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs text-emerald-200 backdrop-blur-md">
          <div className="flex items-center gap-2 font-bold text-white">
            <CheckCircle2 className="h-4 w-4 text-[#F4A623]" />
            <span>Currently Authenticated as Administrator</span>
          </div>
          <p className="mt-1 text-emerald-300/80">
            Signed in as <strong>{session?.user.email}</strong>.
          </p>
          <Link
            href="/admin"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F4A623] px-4 py-2.5 text-xs font-bold text-stone-950 shadow-md hover:bg-[#e09214]"
          >
            <span>Proceed to Admin Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Login Card */}
      <div className="rounded-3xl border border-emerald-900/60 bg-[#0d2f21]/90 p-8 shadow-2xl backdrop-blur-md">
        {authError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-800/60 bg-rose-950/50 p-4 text-xs text-rose-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <p className="leading-relaxed">{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-emerald-200/90">
              Administrator Email
            </label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400/60" />
              <input
                type="email"
                {...register("email")}
                placeholder="admin@readnest.org"
                autoComplete="email"
                className="w-full rounded-xl border border-emerald-800/80 bg-[#082218] pl-10 pr-4 py-3 text-xs text-white placeholder-emerald-400/40 shadow-inner focus:border-[#F4A623] focus:outline-hidden focus:ring-2 focus:ring-[#F4A623]/20"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11px] font-medium text-rose-400 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-emerald-200/90">
              Security Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400/60" />
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-emerald-800/80 bg-[#082218] pl-10 pr-4 py-3 text-xs text-white placeholder-emerald-400/40 shadow-inner focus:border-[#F4A623] focus:outline-hidden focus:ring-2 focus:ring-[#F4A623]/20"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] font-medium text-rose-400 pl-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F4A623] to-[#e09214] py-3.5 px-4 text-xs font-bold text-stone-950 shadow-lg transition-all hover:opacity-95 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Curator Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Admin Console</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 rounded-xl border border-emerald-900/40 bg-emerald-950/30 p-3 text-center text-[11px] text-emerald-300/60">
          This portal is restricted to authorized ReadNext personnel. All access attempts are monitored and recorded.
        </div>
      </div>

      {/* Public Navigation Links */}
      <div className="flex items-center justify-between text-xs text-emerald-300/80 px-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Library</span>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-[#F4A623] hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Reader Login Portal</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#071c14] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#F4A623] selection:text-stone-950">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial from-emerald-600/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#F4A623]" />
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
