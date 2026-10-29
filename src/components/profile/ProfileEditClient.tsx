"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema, ProfileUpdateInput } from "@/lib/validations";
import { authClient } from "@/lib/auth-client";
import {
  User,
  Image as ImageIcon,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileEditClientProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function ProfileEditClient({
  initialUser,
}: ProfileEditClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: initialUser.name || "",
      imageUrl: initialUser.image || "",
    },
  });

  const watchedImageUrl = watch("imageUrl");

  const onSubmit = async (data: ProfileUpdateInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Official Better Auth update user mechanism:
      // https://better-auth.com/docs/concepts/users-accounts#update-user
      const response = await authClient.updateUser({
        name: data.name,
        image: data.imageUrl ? data.imageUrl : undefined,
      });

      if (response?.error) {
        const errorMsg =
          response.error.message ||
          "Failed to update profile. Please verify your connection.";
        setServerError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("Profile updated successfully!");
      // Refresh to update Navbar session and redirect to /profile
      router.push("/profile");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error updating profile.";
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#586860] hover:text-[#183D33] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Profile</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E2D8] shadow-sm space-y-8">
        <div className="space-y-1 pb-6 border-b border-[#F4EFE6]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF6EC] text-[#C88A3B] border border-[#F1D4A8] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Member Account Settings
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D33]">
            Update Profile Information
          </h1>
          <p className="text-xs sm:text-sm text-[#586860]">
            Edit your reader display name and profile photograph.
          </p>
        </div>

        {serverError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Live Avatar Preview */}
        <div className="flex items-center gap-5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#F4EFE6] border border-[#CBD9D0] shrink-0">
            {watchedImageUrl ? (
              <Image
                src={watchedImageUrl}
                alt="Avatar Preview"
                fill
                className="object-cover"
                unoptimized
              />
            ) : initialUser.image ? (
              <Image
                src={initialUser.image}
                alt="Current Avatar"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-lg font-bold text-[#183D33]">
                {initialUser.name?.slice(0, 2).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div className="text-xs space-y-0.5">
            <span className="font-semibold text-[#183D33] block">
              Avatar Preview
            </span>
            <span className="text-[#839189]">
              {watchedImageUrl
                ? "Live preview of updated photo"
                : "Current profile avatar"}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email (Read Only) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#839189]">
              Account Email (Protected)
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[#839189]" />
              <input
                type="email"
                value={initialUser.email}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-[#839189] cursor-not-allowed shadow-inner"
              />
            </div>
            <p className="text-[11px] text-[#839189] pl-1">
              Authentication email is tied to your primary reader account.
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-[#183D33]"
            >
              Reader Name <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-[#839189]" />
              <input
                id="name"
                type="text"
                placeholder="Your full name"
                {...register("name")}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border text-xs text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all ${
                  errors.name ? "border-red-400" : "border-[#E8E2D8]"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-red-600 font-medium pl-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Image URL Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="imageUrl"
                className="block text-xs font-semibold text-[#183D33]"
              >
                Profile Image URL
              </label>
              <span className="text-[11px] text-[#839189]">Web link</span>
            </div>
            <div className="relative flex items-center">
              <ImageIcon className="absolute left-3.5 w-4 h-4 text-[#839189]" />
              <input
                id="imageUrl"
                type="url"
                placeholder="https://images.unsplash.com/..."
                {...register("imageUrl")}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border text-xs text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all ${
                  errors.imageUrl ? "border-red-400" : "border-[#E8E2D8]"
                }`}
              />
            </div>
            {errors.imageUrl && (
              <p className="text-[11px] text-red-600 font-medium pl-1">
                {errors.imageUrl.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href="/profile"
              className="px-6 py-3 rounded-full text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#586860] border border-[#E8E2D8] transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-full text-xs font-semibold bg-[#183D33] hover:bg-[#122E26] text-[#FAF8F5] flex items-center gap-2 shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#C88A3B]" />
                  <span>Update Information</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
