import { Router } from "express";
import path from "path";
import { SkillEffectRepository, SkillRepository } from "../../../shared/src/repository";
import { SkillCreateInput, SkillUpdateInput, SkillTarget, SkillType, SkillCategory } from "../../../shared/src/models";
import { upload, toPublicPath } from "../middleware/upload";

export const router = Router();

router.get("/", (_req, res) => {
  const skills = SkillRepository.list();
  res.render(path.join("skills", "index"), { skills });
});

router.get("/new", (_req, res) => {
  const skillEffects = SkillEffectRepository.list();
  res.render(path.join("skills", "new"), { skillEffects });
});

router.post("/", upload.single("icon"), (req, res) => {
  const body = req.body as any;
  const targets = (Array.isArray(body.targets) ? body.targets : (body.targets ? [body.targets] : [])) as SkillTarget[];
  const effectIds: string[] = Array.isArray(body.effectIds) ? body.effectIds : (body.effectIds ? [body.effectIds] : []);

  const input: SkillCreateInput = {
    name: body.name,
    cost: Number(body.cost),
    ct: Number(body.ct),
    description: body.description,
    targets,
    skillType: body.skillType as SkillType,
    skillCategory: body.skillCategory as SkillCategory,
    ...(effectIds.length > 0 ? { effectIds } : {}),
    ...(req.file ? { icon: toPublicPath(req.file.path) } : {}),
  };
  SkillRepository.create(input);
  res.redirect("/skills");
});

router.get("/:id/edit", (req, res) => {
  const skill = SkillRepository.findById(req.params.id);
  if (!skill) return res.status(404).send("Not Found");
  const skillEffects = SkillEffectRepository.list();
  res.render(path.join("skills", "edit"), { skill, skillEffects });
});

router.post("/:id", upload.single("icon"), (req, res) => {
  if (!req.params.id) return res.status(400).send("Bad Request");
  
  const body = req.body as any;
  const targets = (Array.isArray(body.targets) ? body.targets : (body.targets ? [body.targets] : [])) as SkillTarget[];
  const effectIds: string[] = Array.isArray(body.effectIds) ? body.effectIds : (body.effectIds ? [body.effectIds] : []);

  const input: SkillUpdateInput = {
    name: body.name,
    ...(body.cost ? { cost: Number(body.cost) } : {}),
    ...(body.ct ? { ct: Number(body.ct) } : {}),
    description: body.description,
    targets,
    ...(body.skillType ? { skillType: body.skillType as SkillType } : {}),
    ...(body.skillCategory ? { skillCategory: body.skillCategory as SkillCategory } : {}),
    ...(effectIds.length > 0 ? { effectIds } : {}),
    ...(req.file ? { icon: toPublicPath(req.file.path) } : {}),
  };
  SkillRepository.update(req.params.id, input);
  res.redirect("/skills");
});

router.post("/:id/delete", (req, res) => {
  SkillRepository.delete(req.params.id);
  res.redirect("/skills");
}); 