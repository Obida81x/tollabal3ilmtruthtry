import { Router, type IRouter } from "express";
import { and, eq, asc } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { ListUsersQueryParams, GetUserParams } from "@workspace/api-zod";
import { serializeUser } from "../lib/serializers";

const router: IRouter = Router();

router.get("/users", async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { gender } = parsed.data;
  const rows = await db
    .select()
    .from(usersTable)
    .where(gender ? eq(usersTable.gender, gender) : undefined)
    .orderBy(asc(usersTable.displayName));
  void and;
  res.json(rows.map(serializeUser));
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const parsed = GetUserParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parsed.data.id))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(serializeUser(user));
});

export default router;
