import { Router } from "express";
import path from "path";
import { CharacterRepository } from "../../../shared/src/repository";

export const router = Router();

router.get("/", (req, res) => {
  const { name, element, weapon, rarity } = req.query as Record<string, string | undefined>;
  const q: { name?: string; element?: "fire" | "water" | "wind" | "earth" | "light" | "dark"; weapon?: string; rarity?: number } = {};
  if (name) q.name = name;
  if (element) q.element = element as any;
  if (weapon) q.weapon = weapon;
  if (rarity) q.rarity = Number(rarity);
  const results = CharacterRepository.search(q);
  res.render(path.join("characters", "search"), { results, filters: { name, element, weapon, rarity } });
});

router.get("/:id", (req, res) => {
  const c = CharacterRepository.findById(req.params.id);
  if (!c) return res.status(404).send("Not Found");
  res.render(path.join("characters", "detail"), { c });
}); 