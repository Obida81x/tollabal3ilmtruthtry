import { Router, type IRouter } from "express";
import { asc, desc, eq, sql, and } from "drizzle-orm";
import {
  db,
  testsTable,
  testQuestionsTable,
  testAttemptsTable,
  usersTable,
} from "@workspace/db";
import {
  GetTestParams,
  SubmitTestAttemptParams,
  SubmitTestAttemptBody,
} from "@workspace/api-zod";
import { z } from "zod";
import { serializeUser } from "../lib/serializers";
import { requireUser, getUserId } from "../lib/auth";

const router: IRouter = Router();

const SUBJECTS = ["aqeedah", "fiqh", "hadith"] as const;

const CreateTestQuestionSchema = z.object({
  prompt: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().int().min(0),
  explanation: z.string().nullable().optional(),
  order: z.number().int().optional().default(0),
});

const CreateTestBodySchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().nullable().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  subject: z.enum(["aqeedah", "fiqh", "hadith"]),
  questions: z.array(CreateTestQuestionSchema).min(1),
});

const ListTestsQuerySchema = z.object({
  subject: z.enum(["aqeedah", "fiqh", "hadith"]).optional(),
});

async function isAdminUser(userId: number): Promise<boolean> {
  const [u] = await db
    .select({ isAdmin: usersTable.isAdmin, isActive: usersTable.isActive })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return !!(u?.isAdmin && u?.isActive);
}

router.get("/tests", async (req, res): Promise<void> => {
  const query = ListTestsQuerySchema.safeParse(req.query);
  const subjectFilter = query.success ? query.data.subject : undefined;

  const whereClause = subjectFilter
    ? eq(testsTable.subject, subjectFilter)
    : undefined;

  const tests = await db
    .select()
    .from(testsTable)
    .where(whereClause)
    .orderBy(asc(testsTable.id));

  const counts = await db
    .select({
      testId: testQuestionsTable.testId,
      count: sql<number>`count(*)::int`,
    })
    .from(testQuestionsTable)
    .groupBy(testQuestionsTable.testId);
  const countMap = new Map(counts.map((c) => [c.testId, c.count]));
  res.json(
    tests.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      level: t.level as "beginner" | "intermediate" | "advanced",
      subject: (t.subject ?? "aqeedah") as "aqeedah" | "fiqh" | "hadith",
      questionCount: countMap.get(t.id) ?? 0,
      createdAt: t.createdAt,
    })),
  );
});

router.post("/tests", requireUser, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (!(await isAdminUser(userId))) {
    res.status(403).json({ error: "Admin or supervisor access required." });
    return;
  }
  const parsed = CreateTestBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { title, description, level, subject, questions } = parsed.data;

  const [test] = await db
    .insert(testsTable)
    .values({
      title,
      description: description ?? null,
      level,
      subject,
      createdByUserId: userId,
    })
    .returning();

  if (!test) {
    res.status(500).json({ error: "Failed to create test" });
    return;
  }

  if (questions.length > 0) {
    await db.insert(testQuestionsTable).values(
      questions.map((q, idx) => ({
        testId: test.id,
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation ?? null,
        order: q.order ?? idx,
      })),
    );
  }

  res.status(201).json({
    id: test.id,
    title: test.title,
    description: test.description,
    level: test.level as "beginner" | "intermediate" | "advanced",
    subject: (test.subject ?? "aqeedah") as "aqeedah" | "fiqh" | "hadith",
    questionCount: questions.length,
    createdAt: test.createdAt,
  });
});

router.get("/tests/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      user: usersTable,
      totalScore: sql<number>`sum(${testAttemptsTable.score})::int`,
      attemptsCount: sql<number>`count(*)::int`,
      bestPercentage: sql<number>`max((${testAttemptsTable.score}::float / nullif(${testAttemptsTable.totalQuestions}, 0)) * 100)::int`,
    })
    .from(testAttemptsTable)
    .innerJoin(usersTable, eq(usersTable.id, testAttemptsTable.userId))
    .groupBy(usersTable.id)
    .orderBy(desc(sql`sum(${testAttemptsTable.score})`))
    .limit(20);
  res.json(
    rows.map((r) => ({
      user: serializeUser(r.user),
      totalScore: r.totalScore ?? 0,
      attemptsCount: r.attemptsCount ?? 0,
      bestPercentage: r.bestPercentage ?? 0,
    })),
  );
});

router.get("/tests/:id", async (req, res): Promise<void> => {
  const parsed = GetTestParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [test] = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, parsed.data.id))
    .limit(1);
  if (!test) {
    res.status(404).json({ error: "Test not found" });
    return;
  }
  const questions = await db
    .select()
    .from(testQuestionsTable)
    .where(eq(testQuestionsTable.testId, parsed.data.id))
    .orderBy(asc(testQuestionsTable.order));
  res.json({
    id: test.id,
    title: test.title,
    description: test.description,
    level: test.level as "beginner" | "intermediate" | "advanced",
    subject: (test.subject ?? "aqeedah") as "aqeedah" | "fiqh" | "hadith",
    questions: questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      order: q.order,
    })),
    createdAt: test.createdAt,
  });
});

router.post(
  "/tests/:id/attempt",
  requireUser,
  async (req, res): Promise<void> => {
    const params = SubmitTestAttemptParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = SubmitTestAttemptBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const [test] = await db
      .select()
      .from(testsTable)
      .where(eq(testsTable.id, params.data.id))
      .limit(1);
    if (!test) {
      res.status(404).json({ error: "Test not found" });
      return;
    }
    const questions = await db
      .select()
      .from(testQuestionsTable)
      .where(eq(testQuestionsTable.testId, params.data.id))
      .orderBy(asc(testQuestionsTable.order));

    const answers = body.data.answers;
    let score = 0;
    const results = questions.map((q, idx) => {
      const chosen = answers[idx] ?? -1;
      const correct = q.correctIndex;
      const isCorrect = chosen === correct;
      if (isCorrect) score += 1;
      return {
        questionId: q.id,
        prompt: q.prompt,
        chosenIndex: chosen,
        correctIndex: correct,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const [attempt] = await db
      .insert(testAttemptsTable)
      .values({
        testId: params.data.id,
        userId,
        score,
        totalQuestions: questions.length,
      })
      .returning();

    const percentage =
      questions.length === 0
        ? 0
        : Math.round((score / questions.length) * 100);

    res.json({
      testId: params.data.id,
      score,
      totalQuestions: questions.length,
      percentage,
      results,
      completedAt: attempt?.completedAt ?? new Date(),
    });
  },
);

export default router;
