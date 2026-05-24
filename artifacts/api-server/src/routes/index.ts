import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import postsRouter from "./posts";
import storiesRouter from "./stories";
import chatRouter from "./chat";
import meetingsRouter from "./meetings";
import booksRouter from "./books";
import testsRouter from "./tests";
import dashboardRouter from "./dashboard";
import storageRouter from "./storage";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(postsRouter);
router.use(storiesRouter);
router.use(chatRouter);
router.use(meetingsRouter);
router.use(booksRouter);
router.use(testsRouter);
router.use(dashboardRouter);
router.use(storageRouter);
router.use(adminRouter);

export default router;
