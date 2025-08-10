import { Router } from "express";
import path from "path";
import multer from "multer";
import { FactionRepository } from "../../../shared/src/repository";
import { FactionCreateInput, FactionUpdateInput } from "../../../shared/src/models";

export const router = Router();

// Multer設定
const upload = multer({ dest: path.join(process.cwd(), "..", "..", "uploads") });

router.get("/", (_req, res) => {
  const items = FactionRepository.list();
  res.render(path.join("factions", "index"), { items });
});

router.get("/new", (_req, res) => {
  res.render(path.join("factions", "new"));
});

router.post("/", upload.single("icon"), (req, res) => {
  const input = req.body as FactionCreateInput;
  
  // ファイルがアップロードされた場合、パスを設定
  if (req.file && req.file.filename) {
    input.image = `/uploads/${req.file.filename}`;
  }
  
  FactionRepository.create(input);
  res.redirect("/factions");
});

router.get("/:id/edit", (req, res) => {
  const item = FactionRepository.findById(req.params.id!);
  if (!item) return res.status(404).send("Not Found");
  res.render(path.join("factions", "edit"), { item });
});

router.post("/:id", upload.single("icon"), (req, res) => {
  const input = req.body as FactionUpdateInput;
  
  // ファイルがアップロードされた場合、パスを設定
  if (req.file && req.file.filename) {
    input.image = `/uploads/${req.file.filename}`;
  }
  
  FactionRepository.update(req.params.id!, input);
  res.redirect("/factions");
});

router.post("/:id/delete", (req, res) => {
  FactionRepository.delete(req.params.id!);
  res.redirect("/factions");
}); 