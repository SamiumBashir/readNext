"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookSchema, CreateBookInput } from "@/lib/validations";
import { Book, BookCategory } from "@/types";
import BookCard from "@/components/books/BookCard";
import {
  BookPlus,
  Layers,
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Hash,
  Calendar,
  Search,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

interface AdminStudioClientProps {
  initialBooks: Book[];
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AdminStudioClient({
  initialBooks,
  user,
}: AdminStudioClientProps) {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [activeTab, setActiveTab] = useState<"upload" | "inventory">("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Cover image upload state
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [previewImage, setPreviewImage] = useState<string>("/images/hero-showcase.jpg");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Inventory table search
  const [tableSearch, setTableSearch] = useState("");
  const [tableCategory, setTableCategory] = useState<string>("All");

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
      description: "",
      image_url: "/images/hero-showcase.jpg",
      featured: false,
      pages: 350,
      published_year: new Date().getFullYear(),
      isbn: "",
    },
  });

  const watchedValues = watch();

  // Construct a live book preview object
  const previewBook: Book = {
    id: "preview-id",
    title: watchedValues.title?.trim() || "Untitled Literary Work",
    author: watchedValues.author?.trim() || "Distinguished Author",
    category: (watchedValues.category as BookCategory) || "Tech",
    available_quantity: Number(watchedValues.available_quantity) || 5,
    description:
      watchedValues.description?.trim() ||
      "A rich, architectural synopsis of this volume detailing its intellectual depth, historical scope, and literary significance.",
    image_url: previewImage || "/images/hero-showcase.jpg",
    featured: Boolean(watchedValues.featured),
    pages: watchedValues.pages ? Number(watchedValues.pages) : undefined,
    published_year: watchedValues.published_year
      ? Number(watchedValues.published_year)
      : undefined,
    isbn: watchedValues.isbn || undefined,
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file size should be less than 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

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
          const compressed = canvas.toDataURL("image/jpeg", 0.88);
          setPreviewImage(compressed);
          setValue("image_url", compressed, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setFileName(file.name);
          toast.success("Cover image optimized and attached!");
        } else {
          setPreviewImage(dataUrl);
          setValue("image_url", dataUrl, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setFileName(file.name);
          toast.success("Cover image attached!");
        }
      };
      img.onerror = () => {
        toast.error("Could not parse image file.");
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleResetImage = () => {
    setPreviewImage("/images/hero-showcase.jpg");
    setFileName(null);
    setValue("image_url", "/images/hero-showcase.jpg", {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: CreateBookInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        const errorMsg = resData.message || "Failed to publish book.";
        setServerError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success(`"${data.title}" successfully added to the catalog!`);

      if (resData.book) {
        setBooks((prev) => [resData.book, ...prev]);
      }

      // Reset form fields
      reset({
        title: "",
        author: "",
        category: "Tech",
        available_quantity: 5,
        description: "",
        image_url: "/images/hero-showcase.jpg",
        featured: false,
        pages: 350,
        published_year: new Date().getFullYear(),
        isbn: "",
      });
      setPreviewImage("/images/hero-showcase.jpg");
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Switch to inventory to let admin review the landing
      setActiveTab("inventory");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error publishing book.";
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the library?`)) {
      return;
    }

    setDeletingId(bookId);
    try {
      const response = await fetch(`/api/books?id=${encodeURIComponent(bookId)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to delete volume.");
        return;
      }

      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      toast.success(`"${title}" has been removed.`);
      router.refresh();
    } catch (err: unknown) {
      console.error("Delete error:", err);
      toast.error("Network error while deleting volume.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered books for table
  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(tableSearch.toLowerCase()) ||
      (b.isbn && b.isbn.toLowerCase().includes(tableSearch.toLowerCase()));
    const matchCat =
      tableCategory === "All" || b.category.toLowerCase() === tableCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  // Calculate statistics
  const totalQuantity = books.reduce((acc, b) => acc + (b.available_quantity || 0), 0);
  const storyCount = books.filter((b) => b.category === "Story").length;
  const techCount = books.filter((b) => b.category === "Tech").length;
  const scienceCount = books.filter((b) => b.category === "Science").length;
  const featuredCount = books.filter((b) => b.featured).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Studio Header */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E2D8] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#EBF1ED] text-[#183D33] border border-[#CBD9D0] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
              <span>Curator Studio & Archive Studio</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#183D33] tracking-tight">
              Admin Book Upload & Inventory
            </h1>
            <p className="text-sm text-[#586860] max-w-2xl font-sans">
              Publish new literary masterworks, technical treatises, and scientific volumes into the ReadNest database with instant catalog synchronization.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold text-[#183D33] bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-[#E8E2D8] transition-colors shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-[#C88A3B]" />
              <span>View Public Library</span>
            </Link>
          </div>
        </div>

        {/* Studio Metrics Grid */}
        <div className="mt-8 pt-8 border-t border-[#F4EFE6] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
            <span className="text-[11px] font-semibold text-[#839189] block uppercase tracking-wider">
              Total Volumes
            </span>
            <span className="font-serif text-2xl font-bold text-[#183D33] mt-1 block">
              {books.length}
            </span>
            <span className="text-[11px] text-[#586860]">
              {featuredCount} curated showcase
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
            <span className="text-[11px] font-semibold text-[#839189] block uppercase tracking-wider">
              Inventory In Stock
            </span>
            <span className="font-serif text-2xl font-bold text-[#183D33] mt-1 block">
              {totalQuantity} Copies
            </span>
            <span className="text-[11px] text-[#586860]">Ready for loan hold</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
            <span className="text-[11px] font-semibold text-[#839189] block uppercase tracking-wider">
              Categories
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-[#C88A3B]">
                {storyCount} Story
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-semibold text-[#183D33]">
                {techCount} Tech
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-semibold text-[#2C5D88]">
                {scienceCount} Sci
              </span>
            </div>
            <span className="text-[11px] text-[#586860]">Even genre balance</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
            <span className="text-[11px] font-semibold text-[#839189] block uppercase tracking-wider">
              Admin Operator
            </span>
            <span className="text-sm font-semibold text-[#183D33] mt-1 block truncate">
              {user.name || "Curator Member"}
            </span>
            <span className="text-[11px] text-[#839189] truncate block">
              {user.email || "Active Session"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#F4EFE6]/60 border border-[#E8E2D8] w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "upload"
              ? "bg-[#183D33] text-[#FAF8F5] shadow-sm"
              : "text-[#586860] hover:text-[#183D33] hover:bg-[#FAF8F5]"
          }`}
        >
          <BookPlus className="w-4 h-4" />
          <span>Upload New Book</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "inventory"
              ? "bg-[#183D33] text-[#FAF8F5] shadow-sm"
              : "text-[#586860] hover:text-[#183D33] hover:bg-[#FAF8F5]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catalog Inventory ({books.length})</span>
        </button>
      </div>

      {/* 3. Tab: Upload New Book */}
      {activeTab === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Container (7 Columns) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D8] shadow-sm space-y-6">
            <div className="border-b border-[#F4EFE6] pb-4">
              <h2 className="font-serif text-2xl font-bold text-[#183D33]">
                Publish New Volume
              </h2>
              <p className="text-xs text-[#586860] mt-1">
                Fill in the bibliographic details below. Your book will become immediately available in search and loan queues.
              </p>
            </div>

            {serverError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#183D33]">
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Pragmatic Programmer"
                    {...register("title")}
                    className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border text-xs text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all ${
                      errors.title ? "border-red-400" : "border-[#E8E2D8]"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-[11px] text-red-600 font-medium pl-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#183D33]">
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. David Thomas & Andrew Hunt"
                    {...register("author")}
                    className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border text-xs text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all ${
                      errors.author ? "border-red-400" : "border-[#E8E2D8]"
                    }`}
                  />
                  {errors.author && (
                    <p className="text-[11px] text-red-600 font-medium pl-1">
                      {errors.author.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Category & Available Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#183D33]">
                    Archive Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("category")}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-[#1D2622] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Story">Story (Fiction & Classics)</option>
                    <option value="Tech">Tech (Software & Engineering)</option>
                    <option value="Science">Science (Cosmology & Ecology)</option>
                  </select>
                  {errors.category && (
                    <p className="text-[11px] text-red-600 font-medium pl-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#183D33]">
                    Available Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    placeholder="5"
                    {...register("available_quantity", { valueAsNumber: true })}
                    className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border text-xs text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all ${
                      errors.available_quantity ? "border-red-400" : "border-[#E8E2D8]"
                    }`}
                  />
                  {errors.available_quantity && (
                    <p className="text-[11px] text-red-600 font-medium pl-1">
                      {errors.available_quantity.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Cover Image Upload Area */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#183D33]">
                    Book Cover Image <span className="text-red-500">*</span>
                  </label>

                  {/* Mode Toggle */}
                  <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        imageMode === "upload"
                          ? "bg-[#183D33] text-[#FAF8F5]"
                          : "text-[#586860] hover:text-[#183D33]"
                      }`}
                    >
                      Device Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        imageMode === "url"
                          ? "bg-[#183D33] text-[#FAF8F5]"
                          : "text-[#586860] hover:text-[#183D33]"
                      }`}
                    >
                      Web Link URL
                    </button>
                  </div>
                </div>

                {imageMode === "upload" ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />

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
                            Click to upload book cover <span className="font-normal text-[#586860]">or drag and drop</span>
                          </p>
                          <p className="text-[11px] text-[#839189]">
                            PNG, JPG, or WebP (recommended 3:4 portrait ratio, max 8MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <div className="relative flex items-center">
                      <ImageIcon className="absolute left-3.5 w-4 h-4 text-[#839189]" />
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        {...register("image_url", {
                          onChange: (e) => setPreviewImage(e.target.value),
                        })}
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border text-xs text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all ${
                          errors.image_url ? "border-red-400" : "border-[#E8E2D8]"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Attached file status banner */}
                {(fileName || previewImage) && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs">
                    <div className="flex items-center gap-2 text-[#183D33] truncate max-w-[200px] sm:max-w-xs">
                      <ImageIcon className="w-4 h-4 text-[#C88A3B] shrink-0" />
                      <span className="truncate font-medium">
                        {fileName || (previewImage.startsWith("data:") ? "Uploaded image attached" : "Custom cover URL")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {imageMode === "upload" && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#183D33] hover:bg-[#EBF1ED] border border-[#CBD9D0] transition-colors cursor-pointer"
                        >
                          Change
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleResetImage}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#839189] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>
                )}

                {errors.image_url && (
                  <p className="text-[11px] text-red-600 font-medium pl-1">
                    {errors.image_url.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#183D33]">
                  Book Description / Editorial Synopsis <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide an engaging summary, themes explored, and target audience for this volume..."
                  {...register("description")}
                  className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border text-xs text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all ${
                    errors.description ? "border-red-400" : "border-[#E8E2D8]"
                  }`}
                />
                {errors.description && (
                  <p className="text-[11px] text-red-600 font-medium pl-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Additional Metadata: Pages, Year, ISBN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#183D33] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#839189]" />
                    <span>Pages</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 320"
                    {...register("pages", { valueAsNumber: true })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-[#1D2622] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#183D33] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#839189]" />
                    <span>Published Year</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2024"
                    {...register("published_year", { valueAsNumber: true })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-[#1D2622] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#183D33] flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-[#839189]" />
                    <span>ISBN Number</span>
                  </label>
                  <input
                    type="text"
                    placeholder="978-0..."
                    {...register("isbn")}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-[#1D2622] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Featured Showcase Toggle */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#183D33] block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
                    Featured Curated Volume
                  </span>
                  <span className="text-[11px] text-[#839189]">
                    Showcase this book on the homepage interactive carousel & curated banner
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("featured")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#CBD9D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#183D33]"></div>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F4EFE6]">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-6 py-3 rounded-full text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#586860] border border-[#E8E2D8] transition-colors cursor-pointer"
                >
                  Clear Form
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-full text-xs font-semibold bg-[#183D33] hover:bg-[#122E26] text-[#FAF8F5] flex items-center gap-2 shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing Volume...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#C88A3B]" />
                      <span>Publish to ReadNest</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Column (5 Columns) */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#839189] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
                Live Catalog Preview
              </span>
              <span className="text-[11px] text-[#586860]">
                Exact reader card rendering
              </span>
            </div>

            {/* The Live Book Card */}
            <div className="max-w-sm mx-auto w-full">
              <BookCard book={previewBook} featured={Boolean(watchedValues.featured)} />
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-[#586860] space-y-1.5">
              <p className="font-semibold text-[#183D33] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#C88A3B]" />
                Automated Library Ingestion
              </p>
              <p className="text-[11px] text-[#839189] leading-relaxed">
                Upon publishing, an indexed slug ID is generated, MongoDB atomic stock counters are initialized, and the cache is immediately revalidated for all verified members.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab: Inventory Management Table */}
      {activeTab === "inventory" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4EFE6] pb-5">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#183D33]">
                Archive Catalog ({filteredBooks.length} of {books.length} volumes)
              </h2>
              <p className="text-xs text-[#586860] mt-0.5">
                Manage all books registered in the ReadNest database. Inspect current availability and remove decommissioned titles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#183D33] hover:bg-[#122E26] text-[#FAF8F5] transition-colors self-start sm:self-auto cursor-pointer"
            >
              <BookPlus className="w-4 h-4 text-[#C88A3B]" />
              <span>Add New Book</span>
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 w-4 h-4 text-[#839189]" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Filter by book title, author, or ISBN..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {["All", "Story", "Tech", "Science"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTableCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    tableCategory === cat
                      ? "bg-[#183D33] text-[#FAF8F5]"
                      : "bg-[#FAF8F5] text-[#586860] hover:text-[#183D33] border border-[#E8E2D8]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto border border-[#E8E2D8] rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#839189] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Book Title & Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Quantity</th>
                  <th className="py-3 px-4">Showcase</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFE6]">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#839189]">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#183D33]" />
                      <p className="font-semibold text-sm text-[#183D33]">No volumes found</p>
                      <p className="text-xs">Adjust your search or category filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-[#F4EFE6] border border-[#E8E2D8] shrink-0">
                            <Image
                              src={b.image_url}
                              alt={b.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="space-y-0.5 max-w-xs sm:max-w-md">
                            <p className="font-semibold text-[#183D33] line-clamp-1">
                              {b.title}
                            </p>
                            <p className="text-[11px] text-[#839189]">
                              By {b.author} {b.isbn && `• ISBN: ${b.isbn}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            b.category === "Story"
                              ? "bg-[#FEF3EB] text-[#C88A3B] border-[#F8D7BE]"
                              : b.category === "Tech"
                              ? "bg-[#EBF1ED] text-[#183D33] border-[#CBD9D0]"
                              : "bg-[#EBF4FA] text-[#2C5D88] border-[#C4DCF2]"
                          }`}
                        >
                          {b.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            b.available_quantity > 0
                              ? "bg-[#EBF1ED] text-[#183D33]"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              b.available_quantity > 0 ? "bg-[#183D33]" : "bg-red-500"
                            }`}
                          />
                          {b.available_quantity > 0
                            ? `${b.available_quantity} copies`
                            : "Depleted"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {b.featured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C88A3B] text-white">
                            ★ Curated
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#839189]">Standard</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/books/${b.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-[#586860] hover:text-[#183D33] hover:bg-[#EBF1ED] transition-colors"
                            title="View Book in Public Archive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteBook(b.id, b.title)}
                            disabled={deletingId === b.id}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                            title="Remove Volume from Archive"
                          >
                            {deletingId === b.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}