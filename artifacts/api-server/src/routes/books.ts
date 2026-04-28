import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, booksTable } from "@workspace/db";
import { ListBooksQueryParams, GetBookParams } from "@workspace/api-zod";

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

export default router;
