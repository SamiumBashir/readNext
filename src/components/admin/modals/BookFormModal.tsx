"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookSchema, CreateBookInput } from "@/lib/validations";
import { Book, BookCategory } from "@/types";
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  Hash,
  Calendar,
  Layers,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
  onSuccess: (book: Book, isEdit: boolean) => void;
}

export default function BookFormModal({
  isOpen,
  onClose,
  bookToEdit,
  onSuccess,
}: BookFormModalProps) {
  const isEdit = Boolean(bookToEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [previewImage, setPreviewImage] = useState<string>(
    bookToEdit?.image_url || "/images/hero-showcase.jpg"
  );
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateBookInput>({
    resolver: zodResolver(createBookSchema),
    defaultValues: {
      title: "",
      author: "",
      category: "Tech",
      available_quantity: 5,
      total_copies: 5,
      description: "",
      image_url: "/images/hero-showcase.jpg",
      featured: false,
      pages: 320,
      published_year: new Date().getFullYear(),
      isbn: "",
    },
  });

  const watchedValues = watch();

  // Reset or pre-fill form when modal opens or bookToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (bookToEdit) {
        reset({
          title: bookToEdit.title,
          author: bookToEdit.author,
          category: bookToEdit.category,
          available_quantity: bookToEdit.available_quantity,
          total_copies: bookToEdit.total_copies || bookToEdit.available_quantity,
          description: bookToEdit.description,
          image_url: bookToEdit.image_url,
          featured: Boolean(bookToEdit.featured),
          pages: bookToEdit.pages,
          published_year: bookToEdit.published_year,
          isbn: bookToEdit.isbn || "",
        });
        setPreviewImage(bookToEdit.image_url);
        setImageMode(
          bookToEdit.image_url.startsWith("data:image/") ? "upload" : "url"
        );
      } else {
        reset({
          title: "",
          author: "",
          category: "Tech",
          available_quantity: 5,
          total_copies: 5,
          description: "",
          image_url: "/images/hero-showcase.jpg",
          featured: false,
          pages: 320,
          published_year: new Date().getFullYear(),
          isbn: "",
        });
        setPreviewImage("/images/hero-showcase.jpg");
        setImageMode("upload");
      }
      setFileName(null);
    }
  }, [isOpen, bookToEdit, reset]);

  if (!isOpen) return null;

  // Process and downscale local device image upload using HTML Canvas
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Original file size exceeds 8MB. Please choose a smaller file.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/webp", 0.85);
          setPreviewImage(compressedDataUrl);
          setValue("image_url", compressedDataUrl, { shouldValidate: true });
          toast.success("Cover photo optimized and ready for catalog.");
        }
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const onSubmit = async (data: CreateBookInput) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        id: bookToEdit?.id,
        total_copies: data.total_copies || data.available_quantity,
      };

      const url = "/api/books";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Operation failed.");
      }

      toast.success(
        isEdit
          ? `Volume “${result.book?.title || data.title}” updated successfully!`
          : `New book “${result.book?.title || data.title}” added to archive!`
      );

      onSuccess(result.book, isEdit);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#E7E0D3] bg-[#FAF7F0] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174B32] text-[#F4A623]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                {isEdit ? "Edit Book Record" : "Upload New Book to Catalog"}
              </h2>
              <p className="text-xs text-stone-500">
                {isEdit
                  ? "Update literary details, stock inventory, and metadata"
                  : "Publish an architectural literary volume into the library archive"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="space-y-5 lg:col-span-7">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Book Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="e.g. Sapiens: A Brief History of Humankind"
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden focus:ring-2 focus:ring-[#174B32]/10"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Author & ISBN */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Author <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("author")}
                    placeholder="e.g. Yuval Noah Harari"
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden focus:ring-2 focus:ring-[#174B32]/10"
                  />
                  {errors.author && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {errors.author.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    ISBN (Optional)
                  </label>
                  <input
                    type="text"
                    {...register("isbn")}
                    placeholder="978-0-06-231609-7"
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden focus:ring-2 focus:ring-[#174B32]/10"
                  />
                </div>
              </div>

              {/* Category, Available Quantity, Total Copies */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("category")}
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden focus:ring-2 focus:ring-[#174B32]/10"
                  >
                    <option value="Story">Story</option>
                    <option value="Tech">Tech</option>
                    <option value="Science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Available Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={isEdit ? 0 : 1}
                    max={500}
                    {...register("available_quantity", { valueAsNumber: true })}
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden focus:ring-2 focus:ring-[#174B32]/10"
                  />
                  {errors.available_quantity && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {errors.available_quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Total Copies
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    {...register("total_copies", { valueAsNumber: true })}
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden focus:ring-2 focus:ring-[#174B32]/10"
                  />
                </div>
              </div>

              {/* Pages & Published Year */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Pages Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    {...register("pages", { valueAsNumber: true })}
                    placeholder="350"
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden focus:ring-2 focus:ring-[#174B32]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Published Year
                  </label>
                  <input
                    type="number"
                    min={1000}
                    max={new Date().getFullYear() + 2}
                    {...register("published_year", { valueAsNumber: true })}
                    placeholder="2024"
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden focus:ring-2 focus:ring-[#174B32]/10"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Synopsis / Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  {...register("description")}
                  placeholder="Provide an architectural synopsis of this volume detailing its intellectual and literary significance..."
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white p-3.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden focus:ring-2 focus:ring-[#174B32]/10"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Featured Checkbox */}
              <label className="flex items-center gap-3 rounded-xl border border-stone-200/80 bg-white p-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("featured")}
                  className="h-4 w-4 rounded-sm border-stone-300 text-[#174B32] focus:ring-[#174B32]"
                />
                <div>
                  <span className="text-xs font-semibold text-stone-900">
                    Feature in Showcase
                  </span>
                  <p className="text-[11px] text-stone-500">
                    Display prominently on the public library hero showcase section
                  </p>
                </div>
              </label>
            </div>

            {/* Right Column: Cover Image & Preview (5 cols) */}
            <div className="space-y-5 lg:col-span-5">
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-xs font-bold text-stone-800">
                    Cover Image
                  </span>
                  <div className="flex rounded-lg bg-stone-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        imageMode === "upload"
                          ? "bg-white text-stone-900 shadow-xs"
                          : "text-stone-500 hover:text-stone-900"
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        imageMode === "url"
                          ? "bg-white text-stone-900 shadow-xs"
                          : "text-stone-500 hover:text-stone-900"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageMode === "upload" ? (
                  <div className="mt-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-[#174B32] bg-emerald-50/50"
                          : "border-stone-200 hover:border-stone-400 bg-stone-50/50"
                      }`}
                    >
                      <UploadCloud className="h-8 w-8 text-[#174B32] mb-2" />
                      <p className="text-xs font-semibold text-stone-800">
                        {fileName ? fileName : "Click to select or drag photo"}
                      </p>
                      <p className="text-[10px] text-stone-500 mt-1">
                        PNG, JPG, WebP up to 8MB. Auto-optimized for crisp catalog display.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <input
                      type="url"
                      {...register("image_url")}
                      onChange={(e) => {
                        setValue("image_url", e.target.value);
                        if (e.target.value.trim()) {
                          setPreviewImage(e.target.value.trim());
                        }
                      }}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 shadow-2xs focus:border-[#174B32] focus:outline-hidden"
                    />
                  </div>
                )}

                {/* Preview Box */}
                <div className="mt-4">
                  <p className="text-[11px] font-semibold text-stone-500 mb-2 uppercase tracking-wider">
                    Cover Preview
                  </p>
                  <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-stone-100 shadow-inner">
                    <Image
                      src={previewImage || "/images/hero-showcase.jpg"}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                      unoptimized={previewImage?.startsWith("data:")}
                      onError={() => setPreviewImage("/images/hero-showcase.jpg")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                      <span className="text-[10px] font-bold text-[#F4A623] uppercase">
                        {watchedValues.category || "General"}
                      </span>
                      <h4 className="font-serif text-xs font-bold line-clamp-1">
                        {watchedValues.title || "Untitled Work"}
                      </h4>
                      <p className="text-[10px] text-stone-300 line-clamp-1">
                        By {watchedValues.author || "Unknown Author"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-stone-200/80 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#174B32] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#103B29] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#F4A623]" />
                  <span>Saving to Archive...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-[#F4A623]" />
                  <span>{isEdit ? "Update Volume" : "Publish to Archive"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

