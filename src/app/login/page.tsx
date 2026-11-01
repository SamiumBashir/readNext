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
  BookOpen,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const registered = searchParams.get("registered") === "true";
  const rawCallbackUrl = searchParams.get("callbackUrl") || searchParams.get("returnUrl") || "/";
  // Safe redirect validation: only allow internal relative paths
  const safeCallbackUrl =
    rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/";

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
          "Invalid email or password. Please verify your credentials.";
        setAuthError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Check if logged-in account is an administrator
      const loggedInUser = response.data?.user || { email: data.email };
      const isAdmin = isUserAdmin(loggedInUser);

      if (isAdmin && safeCallbackUrl === "/") {
        toast.success("Welcome back, Administrator! Directing to Curator Console...");
        router.push("/admin");
        router.refresh();
        return;
      }

      toast.success("Welcome back to ReadNest!");
      router.push(safeCallbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed.";
      setAuthError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + safeCallbackUrl,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not initiate Google authentication.";
      setAuthError(message);
      toast.error(message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 p-2 rounded-2xl group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#183D33] text-[#FAF8F5] flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5 text-[#FAF8F5]" />
          </div>
          <span className="font-serif text-2xl font-bold text-[#183D33]">
            ReadNest
          </span>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#1D2622]">
          Sign In to Your Account
        </h1>
        <p className="text-xs sm:text-sm text-[#586860]">
          Enter your reader credentials to access borrowing records and collections.
        </p>
      </div>

      {/* Card Box */}
      <div className="bg-white rounded-3xl p-8 border border-[#E8E2D8] shadow-sm space-y-6">
        {/* Post-Registration Success Banner */}
        {registered && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>
              Registration successful! Please sign in with your email and password.
            </span>
          </div>
        )}

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full py-3 px-4 rounded-2xl border border-[#E8E2D8] bg-[#FAF8F5] hover:bg-[#F4EFE6] text-xs font-semibold text-[#183D33] flex items-center justify-center gap-3 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#183D33]" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E8E2D8] w-full" />
          <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#839189] font-medium">
            or continue with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#183D33]"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[#839189]" />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border text-xs text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all ${
                  errors.email ? "border-red-400" : "border-[#E8E2D8]"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-600 font-medium pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#183D33]"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#839189]" />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border text-xs text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all ${
                  errors.password ? "border-red-400" : "border-[#E8E2D8]"
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-600 font-medium pl-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#183D33] hover:bg-[#122E26] text-[#FAF8F5] text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to ReadNest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-[#F4EFE6] text-center space-y-2">
          <p className="text-xs text-[#586860]">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-[#183D33] hover:text-[#C88A3B] transition-colors underline underline-offset-4"
            >
              Register here
            </Link>
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#839189] hover:text-[#183D33] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C88A3B]" />
              <span>Library Curator &amp; Admin Sign In →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 rounded-3xl bg-white border border-[#E8E2D8] animate-pulse" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
