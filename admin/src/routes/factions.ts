import { Router } from "express";
import path from "path";
import { FactionRepository } from "../../../shared/src/repository";
import { FactionCreateInput, FactionUpdateInput } from "../../../shared/src/models";

export const router = Router();

router.get("/", (_req, res) => {
  const items = FactionRepository.list();
  res.render(path.join("factions", "index"), { items });
});

router.get("/new", (_req, res) => {
  res.render(path.join("factions", "new"));
});

router.post("/", (req, res) => {
  const input = req.body as FactionCreateInput;
  FactionRepository.create(input);
  res.redirect("/factions");
});

router.get("/:id/edit", (req, res) => {
  const item = FactionRepository.findById(req.params.id);
  if (!item) return res.status(404).send("Not Found");
  res.render(path.join("factions", "edit"), { item });
});

router.post("/:id", (req, res) => {
  const input = req.body as FactionUpdateInput;
  FactionRepository.update(req.params.id, input);
  res.redirect("/factions");
});

router.post("/:id/delete", (req, res) => {
  FactionRepository.delete(req.params.id);
  res.redirect("/factions");
}); 