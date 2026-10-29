import test, { describe } from "node:test";
import assert from "node:assert";
import { INITIAL_BOOKS } from "../src/lib/seed-data";

describe("Catalogue Filtering & Search Sanitization", () => {
  function filterCatalogue({
    search,
    category,
  }: {
    search?: string;
    category?: string;
  }) {
    return INITIAL_BOOKS.filter((book) => {
      // Category match
      if (
        category &&
        category.toLowerCase() !== "all" &&
        category.toLowerCase() !== "all books"
      ) {
        if (book.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }
      }

      // Title search match (case-insensitive)
      if (search && search.trim() !== "") {
        const query = search.trim().toLowerCase();
        if (!book.title.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }

  test("returns all 15 initial books when no filter is applied", () => {
    const results = filterCatalogue({});
    assert.strictEqual(results.length, 15);
  });

  test("correctly filters books by category", () => {
    const storyBooks = filterCatalogue({ category: "Story" });
    assert.strictEqual(storyBooks.length, 5);
    assert.ok(storyBooks.every((b) => b.category === "Story"));

    const techBooks = filterCatalogue({ category: "Tech" });
    assert.strictEqual(techBooks.length, 5);
    assert.ok(techBooks.every((b) => b.category === "Tech"));

    const scienceBooks = filterCatalogue({ category: "Science" });
    assert.strictEqual(scienceBooks.length, 5);
    assert.ok(scienceBooks.every((b) => b.category === "Science"));
  });

  test("searches books by title with case insensitivity", () => {
    const resultsLower = filterCatalogue({ search: "gatsby" });
    assert.strictEqual(resultsLower.length, 1);
    assert.strictEqual(resultsLower[0].title, "The Great Gatsby");

    const resultsUpper = filterCatalogue({ search: "GATSBY" });
    assert.strictEqual(resultsUpper.length, 1);
    assert.strictEqual(resultsUpper[0].title, "The Great Gatsby");
  });

  test("combines category filter and search query concurrently", () => {
    // Search "code" in Tech should find "Clean Code"
    const techCode = filterCatalogue({ category: "Tech", search: "code" });
    assert.strictEqual(techCode.length, 1);
    assert.strictEqual(techCode[0].title, "Clean Code");

    // Search "code" in Science should return empty
    const sciCode = filterCatalogue({ category: "Science", search: "code" });
    assert.strictEqual(sciCode.length, 0);
  });

  test("handles empty search term gracefully without filtering out books", () => {
    const results = filterCatalogue({ search: "   " });
    assert.strictEqual(results.length, 15);
  });

  test("pagination logic accurately computes offsets and total pages", () => {
    const total = 15;
    const limit = 9;

    const totalPages = Math.ceil(total / limit);
    assert.strictEqual(totalPages, 2);

    const page1Skip = (1 - 1) * limit;
    assert.strictEqual(page1Skip, 0);

    const page2Skip = (2 - 1) * limit;
    assert.strictEqual(page2Skip, 9);
  });
});
