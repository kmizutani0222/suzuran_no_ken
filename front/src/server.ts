import express from "express";
import path from "path";
import { router as characterRouter } from "./routes/characters";

const app = express();
const PORT = process.env.PORT || 3002;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// アップロードされた画像を提供
app.use("/uploads", express.static(path.join(__dirname, "../../admin/uploads")));

app.get("/", (_req, res) => {
  res.redirect("/characters");
});

app.use("/characters", characterRouter);

app.listen(PORT, () => {
  console.log(`[front] listening on http://localhost:${PORT}`);
}); 