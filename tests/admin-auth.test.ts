import test, { describe } from "node:test";
import assert from "node:assert";
import { isUserAdmin, getAdminEmails } from "../src/lib/admin";

describe("Admin & Curator Access Control (isUserAdmin)", () => {
  test("authorizes verified admin email addresses", () => {
    const adminUser = {
      email: "samaufa36@gmail.com",
      name: "Samium Bashir",
    };
    assert.strictEqual(isUserAdmin(adminUser), true);

    const secondAdmin = {
      email: "samiumbashirbosunia@gmail.com",
      name: "Samium Bashir Bosunia",
    };
    assert.strictEqual(isUserAdmin(secondAdmin), true);
  });

  test("handles case-insensitive email matching for admins", () => {
    const mixedCaseAdmin = {
      email: "SAMAUFA36@GMAIL.COM",
      name: "Samium Admin",
    };
    assert.strictEqual(isUserAdmin(mixedCaseAdmin), true);
  });

  test("authorizes user with explicit admin role", () => {
    const roleAdmin = {
      email: "headcurator@library.org",
      role: "admin",
      name: "Head Curator",
    };
    assert.strictEqual(isUserAdmin(roleAdmin), true);
  });

  test("strictly denies access to normal readers / non-admin users", () => {
    const normalReader1 = {
      email: "reader123@example.com",
      name: "General Reader",
      role: "user",
    };
    assert.strictEqual(isUserAdmin(normalReader1), false);

    const normalReader2 = {
      email: "john.doe@gmail.com",
      name: "John Doe",
    };
    assert.strictEqual(isUserAdmin(normalReader2), false);

    const attacker = {
      email: "fakeadmin@hacker.io",
      name: "Attacker",
    };
    assert.strictEqual(isUserAdmin(attacker), false);
  });

  test("handles null or undefined user safely without throwing", () => {
    assert.strictEqual(isUserAdmin(null), false);
    assert.strictEqual(isUserAdmin(undefined), false);
    assert.strictEqual(isUserAdmin({ email: "" }), false);
    assert.strictEqual(isUserAdmin({ email: null }), false);
  });
});
