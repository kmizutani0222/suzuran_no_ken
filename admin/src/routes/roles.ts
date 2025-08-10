import { Router } from "express";
import path from "path";
import multer from "multer";
import { RoleRepository } from "../../../shared/src/repository";
import { RoleCreateInput, RoleUpdateInput } from "../../../shared/src/models";

export const router = Router();

// Multer設定
const upload = multer({ dest: path.join(process.cwd(), "..", "..", "uploads") });

router.get("/", (_req, res) => {
  const items = RoleRepository.list();
  res.render(path.join("roles", "index"), { items });
});

router.get("/new", (_req, res) => {
  res.render(path.join("roles", "new"));
});

router.post("/", upload.single("icon"), (req, res) => {
  const input = req.body as RoleCreateInput;
  input.movementPower = Number(input.movementPower);
  input.jumpHigh = Number(input.jumpHigh);
  input.jumpLow = Number(input.jumpLow);
  
  // ファイルがアップロードされた場合、パスを設定
  if (req.file && req.file.filename) {
    input.image = `/uploads/${req.file.filename}`;
  }
  
  RoleRepository.create(input);
  res.redirect("/roles");
});

router.get("/:id/edit", (req, res) => {
  const item = RoleRepository.findById(req.params.id!);
  if (!item) return res.status(404).send("Not Found");
  res.render(path.join("roles", "edit"), { item });
});

router.post("/:id", upload.single("icon"), (req, res) => {
  const input = req.body as RoleUpdateInput;
  if (typeof input.movementPower !== "undefined") input.movementPower = Number(input.movementPower as any);
  if (typeof input.jumpHigh !== "undefined") input.jumpHigh = Number(input.jumpHigh as any);
  if (typeof input.jumpLow !== "undefined") input.jumpLow = Number(input.jumpLow as any);
  
  // ファイルがアップロードされた場合、パスを設定
  if (req.file && req.file.filename) {
    input.image = `/uploads/${req.file.filename}`;
  }
  
  RoleRepository.update(req.params.id!, input);
  res.redirect("/roles");
});

router.post("/:id/delete", (req, res) => {
  RoleRepository.delete(req.params.id!);
  res.redirect("/roles");
}); 