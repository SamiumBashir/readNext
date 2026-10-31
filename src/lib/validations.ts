import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
  photoUrl: z
    .string()
    .trim()
    .refine((val) => {
      if (!val) return true;
      if (val.startsWith("data:image/") || val.startsWith("/")) return true;
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Must be a valid URL or image")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  imageUrl: z
    .string()
    .trim()
    .refine((val) => {
      if (!val) return true;
      if (val.startsWith("data:image/") || val.startsWith("/")) return true;
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Image must be a valid image file, data URL, or web link")
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const borrowSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
});

export const createBookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  author: z
    .string()
    .trim()
    .min(2, "Author name must be at least 2 characters")
    .max(80, "Author name cannot exceed 80 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  category: z.enum(["Story", "Tech", "Science"], {
    message: "Category must be Story, Tech, or Science",
  }),
  available_quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Available quantity must be at least 1")
    .max(500, "Quantity cannot exceed 500"),
  image_url: z
    .string()
    .trim()
    .refine((val) => {
      if (!val) return false;
      if (val.startsWith("data:image/") || val.startsWith("/")) return true;
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Must provide a valid cover image (file upload or URL)"),
  featured: z.boolean().optional(),
  pages: z
    .number()
    .int("Pages must be an integer")
    .min(1, "Pages must be greater than 0")
    .optional()
    .nullable(),
  published_year: z
    .number()
    .int()
    .min(1000, "Published year must be after 1000")
    .max(new Date().getFullYear() + 2, "Published year cannot be in the distant future")
    .optional()
    .nullable(),
  isbn: z.string().trim().max(30).optional().nullable(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
