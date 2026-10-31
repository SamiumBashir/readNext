import test, { describe } from "node:test";
import assert from "node:assert";
import {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  borrowSchema,
  createBookSchema,
} from "../src/lib/validations";

describe("Registration Validation (registerSchema)", () => {
  test("accepts valid registration input with strong password", () => {
    const input = {
      name: "Arthur Conan Doyle",
      email: "arthur@example.com",
      password: "Password123",
      photoUrl: "https://example.com/avatar.jpg",
    };
    const result = registerSchema.safeParse(input);
    assert.strictEqual(result.success, true);
  });

  test("accepts registration without photoUrl or with empty string", () => {
    const input = {
      name: "Mary Shelley",
      email: "mary@example.com",
      password: "Frankenstein88",
      photoUrl: "",
    };
    const result = registerSchema.safeParse(input);
    assert.strictEqual(result.success, true);
  });

  test("rejects invalid email address", () => {
    const input = {
      name: "Valid Name",
      email: "not-an-email",
      password: "Password123",
    };
    const result = registerSchema.safeParse(input);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(
        result.error.issues[0].message,
        "Please provide a valid email address"
      );
    }
  });

  test("rejects weak password with less than 8 characters", () => {
    const input = {
      name: "Valid Name",
      email: "valid@example.com",
      password: "Pass1",
    };
    const result = registerSchema.safeParse(input);
    assert.strictEqual(result.success, false);
  });

  test("rejects password missing numeric digits", () => {
    const input = {
      name: "Valid Name",
      email: "valid@example.com",
      password: "PasswordOnlyLetters",
    };
    const result = registerSchema.safeParse(input);
    assert.strictEqual(result.success, false);
  });

  test("rejects short name with less than 2 characters", () => {
    const input = {
      name: "A",
      email: "valid@example.com",
      password: "Password123",
    };
    const result = registerSchema.safeParse(input);
    assert.strictEqual(result.success, false);
  });
});

describe("Login Validation (loginSchema)", () => {
  test("accepts valid login input", () => {
    const input = {
      email: "reader@readnest.com",
      password: "SecretPassword1",
    };
    const result = loginSchema.safeParse(input);
    assert.strictEqual(result.success, true);
  });

  test("rejects empty password", () => {
    const input = {
      email: "reader@readnest.com",
      password: "",
    };
    const result = loginSchema.safeParse(input);
    assert.strictEqual(result.success, false);
  });
});

describe("Profile Update Validation (profileUpdateSchema)", () => {
  test("accepts valid updated name and valid image URL", () => {
    const input = {
      name: "Virginia Woolf",
      imageUrl: "https://images.unsplash.com/photo-1544947950",
    };
    const result = profileUpdateSchema.safeParse(input);
    assert.strictEqual(result.success, true);
  });

  test("rejects invalid malformed image URL", () => {
    const input = {
      name: "Virginia Woolf",
      imageUrl: "not-a-valid-url-format",
    };
    const result = profileUpdateSchema.safeParse(input);
    assert.strictEqual(result.success, false);
  });
});

describe("Borrowing Schema Validation (borrowSchema)", () => {
  test("accepts non-empty book ID", () => {
    const result = borrowSchema.safeParse({ bookId: "tech-clean-code" });
    assert.strictEqual(result.success, true);
  });

  test("rejects missing or empty book ID", () => {
    const result = borrowSchema.safeParse({ bookId: "" });
    assert.strictEqual(result.success, false);
  });
});

describe("Admin Book Upload Schema Validation (createBookSchema)", () => {
  test("accepts valid book creation payload", () => {
    const validBook = {
      title: "Clean Code",
      author: "Robert C. Martin",
      description: "A handbook of agile software craftsmanship and best practices.",
      category: "Tech",
      available_quantity: 5,
      image_url: "/images/hero-showcase.jpg",
      featured: true,
      pages: 464,
      published_year: 2008,
      isbn: "978-0132350884",
    };
    const result = createBookSchema.safeParse(validBook);
    assert.strictEqual(result.success, true);
  });

  test("accepts valid base64 data URL for uploaded cover image", () => {
    const bookWithDataUrl = {
      title: "Design Patterns",
      author: "Gang of Four",
      description: "Elements of reusable object-oriented software architecture.",
      category: "Tech",
      available_quantity: 3,
      image_url: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    };
    const result = createBookSchema.safeParse(bookWithDataUrl);
    assert.strictEqual(result.success, true);
  });

  test("rejects invalid book category", () => {
    const invalidCategory = {
      title: "Random Book",
      author: "Unknown",
      description: "A test book description that is long enough.",
      category: "Fantasy", // Not in Story | Tech | Science
      available_quantity: 2,
      image_url: "/images/hero-showcase.jpg",
    };
    const result = createBookSchema.safeParse(invalidCategory);
    assert.strictEqual(result.success, false);
  });

  test("rejects negative or zero available quantity", () => {
    const zeroQuantity = {
      title: "Zero Stock",
      author: "Author",
      description: "A valid description for testing zero quantity.",
      category: "Science",
      available_quantity: 0,
      image_url: "/images/hero-showcase.jpg",
    };
    const result = createBookSchema.safeParse(zeroQuantity);
    assert.strictEqual(result.success, false);
  });

  test("rejects empty image_url", () => {
    const noImage = {
      title: "No Image Book",
      author: "Author",
      description: "A valid description for testing missing image.",
      category: "Story",
      available_quantity: 2,
      image_url: "",
    };
    const result = createBookSchema.safeParse(noImage);
    assert.strictEqual(result.success, false);
  });
});
