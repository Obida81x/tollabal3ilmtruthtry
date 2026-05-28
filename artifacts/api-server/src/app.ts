import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import pinoHttp from "pino-http";
import crypto from "node:crypto";
import router from "./routes";
import { logger } from "./lib/logger";
import { db, userTokensTable } from "@workspace/db";
import { and, eq, gt } from "drizzle-orm";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

app.use(cors({ 
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.replace(/\/$/, '') : true, 
  credentials: true 
}));app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET env var is required");
}
app.set("trust proxy", 1);
const PgSession = connectPgSimple(session);
app.use(
  session({
    name: "sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "session",
      createTableIfMissing: false,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  }),
);

async function bearerTokenMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const [row] = await db
        .select({ userId: userTokensTable.userId })
        .from(userTokensTable)
        .where(
          and(
            eq(userTokensTable.tokenHash, tokenHash),
            gt(userTokensTable.expiresAt, new Date()),
          ),
        )
        .limit(1);
      if (row) {
        req.userId = row.userId;
      }
    }
  }
  next();
}

app.use(bearerTokenMiddleware);

app.use("/api", router);

export default app;
