import { Router } from "express";
import path from "path";
import { RarityRepository } from "../../../shared/src/repository";
import { RarityCreateInput, RarityUpdateInput } from "../../../shared/src/models";

export const router = Router();

router.get("/", (_req, res) => {
  const items = RarityRepository.list();
  res.render(path.join("rarities", "index"), { items });
});

router.get("/new", (_req, res) => {
  res.render(path.join("rarities", "new"));
});

router.post("/", (req, res) => {
  const input = req.body as RarityCreateInput;
  input.value = Number(input.value);
  RarityRepository.create(input);
  res.redirect("/rarities");
});

router.get("/:id/edit", (req, res) => {
  const item = RarityRepository.findById(req.params.id);
  if (!item) return res.status(404).send("Not Found");
  res.render(path.join("rarities", "edit"), { item });
});

router.post("/:id", (req, res) => {
  const input = req.body as RarityUpdateInput;
  if (typeof input.value !== "undefined") input.value = Number(input.value as any);
  RarityRepository.update(req.params.id, input);
  res.redirect("/rarities");
});

router.post("/:id/delete", (req, res) => {
  RarityRepository.delete(req.params.id);
  res.redirect("/rarities");
}); 