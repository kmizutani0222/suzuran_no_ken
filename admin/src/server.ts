import express from "express";
import path from "path";
import methodOverride from "method-override";
import session from "express-session";
import expressLayouts from "express-ejs-layouts";
import { router as characterRouter } from "./routes/characters";
import { router as rarityRouter } from "./routes/rarities";
import { router as roleRouter } from "./routes/roles";
import { router as factionRouter } from "./routes/factions";
import { router as skillRouter } from "./routes/skills";
import { router as skillEffectRouter } from "./routes/skill-effects";
import { router as authRouter } from "./routes/auth";
import { attachLocals, requireLogin } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3001;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));
app.use(expressLayouts);
app.set("layout", "layout");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(session({ secret: "suzuran_secret", resave: false, saveUninitialized: false }));
app.use(attachLocals);
app.use(express.static(path.join(process.cwd(), "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "..", "uploads")));

app.use(authRouter);

app.get("/", (_req, res) => {
  res.redirect("/dashboard");
});

app.get("/dashboard", requireLogin, (req, res) => {
  res.render("dashboard");
});

app.use("/characters", requireLogin, characterRouter);
app.use("/rarities", requireLogin, rarityRouter);
app.use("/roles", requireLogin, roleRouter);
app.use("/factions", requireLogin, factionRouter);
app.use("/skills", requireLogin, skillRouter);
app.use("/skill-effects", requireLogin, skillEffectRouter);

app.listen(PORT, () => {
  console.log(`[admin] listening on http://localhost:${PORT}`);
}); 