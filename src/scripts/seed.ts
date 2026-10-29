import { MongoClient } from "mongodb";
import { INITIAL_BOOKS } from "../lib/seed-data";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/readnest";

async function main() {
  console.log("🌱 Connecting to MongoDB at:", uri.replace(/:([^:@]{3,})@/, ":***@"));
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("books");

    console.log("Creating unique indexes on books collection...");
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ title: 1 });

    console.log(`Seeding ${INITIAL_BOOKS.length} books...`);
    let inserted = 0;
    let updated = 0;

    for (const book of INITIAL_BOOKS) {
      const res = await collection.updateOne(
        { id: book.id },
        {
          $set: {
            ...book,
            updated_at: new Date(),
          },
          $setOnInsert: {
            created_at: new Date(),
          },
        },
        { upsert: true }
      );

      if (res.upsertedCount > 0) {
        inserted++;
      } else {
        updated++;
      }
    }

    const total = await collection.countDocuments();
    console.log(
      `✅ Seeding finished successfully! Inserted: ${inserted}, Updated: ${updated}, Total books in DB: ${total}`
    );
  } catch (error) {
    console.error("❌ Failed to seed MongoDB:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
