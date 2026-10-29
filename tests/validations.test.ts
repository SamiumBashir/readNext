import test, { describe } from "node:test";
import assert from "node:assert";
import {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  borrowSchema,
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
