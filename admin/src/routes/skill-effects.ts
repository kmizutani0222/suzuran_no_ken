import { Router } from "express";
import path from "path";
import { SkillEffectRepository } from "../../../shared/src/repository";
import { SkillEffectCreateInput, SkillEffectUpdateInput } from "../../../shared/src/models";

export const router = Router();

router.get("/", (_req, res) => {
  const items = SkillEffectRepository.list();
  res.render(path.join("skill_effects", "index"), { items });
});

router.get("/new", (_req, res) => {
  res.render(path.join("skill_effects", "new"));
});

router.post("/", (req, res) => {
  const input = req.body as SkillEffectCreateInput;
  SkillEffectRepository.create(input);
  res.redirect("/skill-effects");
});

router.get("/:id/edit", (req, res) => {
  const skillEffect = SkillEffectRepository.findById(req.params.id);
  if (!skillEffect) return res.status(404).send("Not Found");
  res.render(path.join("skill_effects", "edit"), { skillEffect });
});

router.post("/:id", (req, res) => {
  const input = req.body as SkillEffectUpdateInput;
  SkillEffectRepository.update(req.params.id, input);
  res.redirect("/skill-effects");
});

router.post("/:id/delete", (req, res) => {
  SkillEffectRepository.delete(req.params.id);
  res.redirect("/skill-effects");
}); 