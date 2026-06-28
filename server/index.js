import "./loadEnv.js";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./lib/prisma.js";
import authRouter from "./routes/auth.js";
import casesRouter from "./routes/cases.js";
import firmsRouter from "./routes/firms.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PgSession = connectPgSimple(session);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const firm = await prisma.firm.findUnique({ where: { email } });
        if (!firm) return done(null, false, { message: "Invalid credentials" });
        const match = await bcrypt.compare(password, firm.password);
        if (!match)
          return done(null, false, { message: "Invalid credentials" });
        return done(null, firm);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((firm, done) => done(null, firm.id));
passport.deserializeUser(async (id, done) => {
  try {
    const firm = await prisma.firm.findUnique({ where: { id } });
    done(null, firm);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api/cases", casesRouter);
app.use("/api/firms", firmsRouter);

app.get("/api/case/:token", async (req, res, next) => {
  try {
    const caseRecord = await prisma.case.findUnique({
      where: { token: req.params.token },
      include: {
        firm: { select: { name: true, logoUrl: true } },
        updates: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!caseRecord) return res.status(404).json({ error: "Not found" });
    res.json(caseRecord);
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? "Internal server error" });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
