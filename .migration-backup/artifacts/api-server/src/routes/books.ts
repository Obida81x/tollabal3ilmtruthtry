import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, booksTable, usersTable } from "@workspace/db";
import {
  ListBooksQueryParams,
  GetBookParams,
  AdminCreateBookBody,
  AdminUpdateBookBody,
  AdminUpdateBookParams,
  AdminDeleteBookParams,
} from "@workspace/api-zod";
import { requireUser, getUserId } from "../lib/auth";

const router: IRouter = Router();

function serializeBook(b: typeof booksTable.$inferSelect) {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    description: b.description,
    coverImageUrl: b.coverImageUrl,
    fileUrl: b.fileUrl,
    pages: b.pages,
    language: b.language,
    category: b.category,
    createdAt: b.createdAt,
  };
}

const HTTP_URL_RE = /^https?:\/\/.+/i;

async function loadAdmin(req: Parameters<typeof requireUser>[0]) {
  const userId = getUserId(req);
  if (!userId) return null;
  const [u] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!u || !u.isActive || !u.isAdmin) return null;
  return u;
}

router.get("/books", async (req, res): Promise<void> => {
  const parsed = ListBooksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(booksTable)
    .where(
      parsed.data.category
        ? eq(booksTable.category, parsed.data.category)
        : undefined,
    )
    .orderBy(asc(booksTable.title));
  res.json(rows.map(serializeBook));
});

router.get("/books/:id", async (req, res): Promise<void> => {
  const parsed = GetBookParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, parsed.data.id))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(serializeBook(row));
});

router.post(
  "/admin/books",
  requireUser,
  async (req, res): Promise<void> => {
    const me = await loadAdmin(req);
    if (!me) {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    const parsed = AdminCreateBookBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    if (!HTTP_URL_RE.test(parsed.data.fileUrl)) {
      res
        .status(400)
        .json({ error: "Download link must start with http(s)://" });
      return;
    }
    const [row] = await db
      .insert(booksTable)
      .values({
        title: parsed.data.title,
        author: parsed.data.author,
        description: parsed.data.description ?? null,
        coverImageUrl: parsed.data.coverImageUrl ?? null,
        fileUrl: parsed.data.fileUrl,
        pages: parsed.data.pages ?? null,
        language: parsed.data.language,
        category: parsed.data.category,
      })
      .returning();
    if (!row) {
      res.status(500).json({ error: "Failed to add book" });
      return;
    }
    res.status(201).json(serializeBook(row));
  },
);

router.patch(
  "/admin/books/:id",
  requireUser,
  async (req, res): Promise<void> => {
    const me = await loadAdmin(req);
    if (!me) {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    const params = AdminUpdateBookParams.safeParse(req.params);
    const body = AdminUpdateBookBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const [existing] = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, params.data.id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    const update: Partial<typeof booksTable.$inferInsert> = {};
    if (body.data.title !== undefined) update.title = body.data.title;
    if (body.data.author !== undefined) update.author = body.data.author;
    if (body.data.description !== undefined)
      update.description = body.data.description ?? null;
    if (body.data.coverImageUrl !== undefined)
      update.coverImageUrl = body.data.coverImageUrl ?? null;
    if (body.data.fileUrl !== undefined) {
      if (!HTTP_URL_RE.test(body.data.fileUrl)) {
        res
          .status(400)
          .json({ error: "Download link must start with http(s)://" });
        return;
      }
      update.fileUrl = body.data.fileUrl;
    }
    if (body.data.pages !== undefined) update.pages = body.data.pages ?? null;
    if (body.data.language !== undefined) update.language = body.data.language;
    if (body.data.category !== undefined) update.category = body.data.category;
    const [updated] = await db
      .update(booksTable)
      .set(update)
      .where(eq(booksTable.id, params.data.id))
      .returning();
    res.json(serializeBook(updated!));
  },
);

router.delete(
  "/admin/books/:id",
  requireUser,
  async (req, res): Promise<void> => {
    const me = await loadAdmin(req);
    if (!me) {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    const parsed = AdminDeleteBookParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    await db.delete(booksTable).where(eq(booksTable.id, parsed.data.id));
    res.status(204).end();
  },
);

export default router;
