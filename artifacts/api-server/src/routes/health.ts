import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool, db, usersTable, postsTable, booksTable, meetingsTable, storiesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/healthz/db", async (_req, res) => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    res.json({ status: "ok", nodeEnv: process.env.NODE_ENV ?? "unset" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ status: "error", error: msg, nodeEnv: process.env.NODE_ENV ?? "unset" });
  }
});

router.get("/healthz/tables", async (_req, res) => {
  const results: Record<string, string> = {};

  const tryQuery = async (name: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      results[name] = "ok";
    } catch (err: unknown) {
      results[name] = err instanceof Error ? err.message : String(err);
    }
  };

  await tryQuery("users_count", () => db.select({ c: usersTable.id }).from(usersTable).limit(1));
  await tryQuery("users_full", () => db.select().from(usersTable).limit(1));
  await tryQuery("posts_count", () => db.select({ c: postsTable.id }).from(postsTable).limit(1));
  await tryQuery("posts_full", () => db.select().from(postsTable).limit(1));
  await tryQuery("books_count", () => db.select({ c: booksTable.id }).from(booksTable).limit(1));
  await tryQuery("books_full", () => db.select().from(booksTable).limit(1));
  await tryQuery("meetings_count", () => db.select({ c: meetingsTable.id }).from(meetingsTable).limit(1));
  await tryQuery("meetings_full", () => db.select().from(meetingsTable).limit(1));
  await tryQuery("stories_count", () => db.select({ c: storiesTable.id }).from(storiesTable).limit(1));
  await tryQuery("stories_full", () => db.select().from(storiesTable).limit(1));

  res.json(results);
});

export default router;
