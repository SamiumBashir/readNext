"use client";

import { useState, useRef } from "react";
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
  UploadCloud,
  Trash2,
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

  const [previewUrl, setPreviewUrl] = useState(initialUser.image || "");
  const [imgError, setImgError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: initialUser.name || "",
      imageUrl: initialUser.image || "",
    },
  });

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.88);
          setPreviewUrl(compressed);
          setImgError(false);
          setValue("imageUrl", compressed, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setFileName(file.name);
          toast.success("Photo selected and preview updated!");
        } else {
          setPreviewUrl(dataUrl);
          setImgError(false);
          setValue("imageUrl", dataUrl, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setFileName(file.name);
          toast.success("Photo selected and preview updated!");
        }
      };
      img.onerror = () => {
        toast.error("Failed to process image file");
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl("");
    setFileName(null);
    setImgError(false);
    setValue("imageUrl", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Profile photo removed. Click 'Update Information' to save.");
  };

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
            {previewUrl && !imgError ? (
              <Image
                src={previewUrl}
                alt="Avatar Preview"
                fill
                className="object-cover"
                unoptimized
                onError={() => setImgError(true)}
              />
            ) : initialUser.image && !imgError ? (
              <Image
                src={initialUser.image}
                alt="Current Avatar"
                fill
                className="object-cover"
                unoptimized
                onError={() => setImgError(true)}
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
              {previewUrl && !imgError
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

          {/* Profile Photo Upload Option */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#183D33]">
                Profile Photo
              </label>
              <span className="text-[11px] text-[#839189]">Device upload</span>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Upload Area / Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processFile(file);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#183D33] bg-[#EBF1ED]"
                  : "border-[#CBD9D0] hover:border-[#183D33] bg-[#FAF8F5] hover:bg-[#F4EFE6]/60"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E2D8] flex items-center justify-center text-[#183D33] shadow-2xs">
                  <UploadCloud className="w-6 h-6 text-[#183D33]" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#183D33]">
                    Click to upload photo <span className="font-normal text-[#586860]">or drag and drop</span>
                  </p>
                  <p className="text-[11px] text-[#839189]">
                    PNG, JPG, or WebP (max. 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Action pill if image selected / uploaded */}
            {(previewUrl || fileName) && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs">
                <div className="flex items-center gap-2 text-[#183D33] truncate max-w-[200px] sm:max-w-xs">
                  <ImageIcon className="w-4 h-4 text-[#C88A3B] shrink-0" />
                  <span className="truncate font-medium">
                    {fileName || "Profile photo ready"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#183D33] hover:bg-[#EBF1ED] border border-[#CBD9D0] transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            )}

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
