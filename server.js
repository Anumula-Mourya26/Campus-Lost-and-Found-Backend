import express from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { authRouter } from "./api/auth.router.js";
import { reportRouter } from "./api/report.router.js";
import { claimRouter } from "./api/claim.router.js";
import { aiRouter } from "./api/ai.router.js";
import { publicRouter } from "./api/public.router.js";
import { deskRouter } from "./api/desk.router.js";
import { itemRouter } from "./api/item.router.js";
import { lostFoundRouter } from "./api/lost-found.router.js";
import { aliasesRouter } from "./api/aliases.router.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

config();
const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get("/api/health", (req, res) => res.status(200).json({ success: true, message: "Campus Lost and Found API is running" }));
app.use("/api/auth", authRouter);
app.use("/api/reports", reportRouter);
app.use("/api/claims", claimRouter);
app.use("/api/ai", aiRouter);
app.use("/api", aiRouter);
app.use("/api/items", itemRouter);
app.use("/api", lostFoundRouter);
app.use("/api", aliasesRouter);
app.use("/api", publicRouter);
app.use("/api/desks", deskRouter);
app.use((req, res) => res.status(404).json({ success: false, message: "API route not found" }));
app.use(errorHandler);

async function connectDB() {
  try {
    if (!process.env.DB_URL) throw new Error("DB_URL is missing in .env");
    await connect(process.env.DB_URL);
    console.log("Connected to MongoDB");
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (err) {
    console.error("Error in DB connection:", err.message);
    process.exit(1);
  }
}
connectDB();
