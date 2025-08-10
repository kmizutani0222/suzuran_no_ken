import { Router } from "express";
import path from "path";
import { SkillEffectRepository, SkillRepository } from "../../../shared/src/repository";
import { SkillCreateInput, SkillUpdateInput, SkillTarget, SkillType } from "../../../shared/src/models";
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

router.post("/", upload.single("icon"), async (req, res) => {
  try {
    const body = req.body;
    const skillData: SkillCreateInput = {
      name: body.name,
      cost: parseInt(body.cost) || 0,
      ct: parseInt(body.ct) || 0,
      description: body.description || "",
      targets: body.targets ? (Array.isArray(body.targets) ? body.targets : [body.targets]) : [],
      skillType: body.skillType as SkillType,
      effectIds: body.effectIds ? (Array.isArray(body.effectIds) ? body.effectIds : [body.effectIds]) : [],
    };

    // iconが存在する場合のみ追加
    if (req.file?.filename) {
      (skillData as any).icon = req.file.filename;
    }

    const skill = await SkillRepository.create(skillData);
    res.redirect("/skills");
  } catch (error) {
    console.error("スキル作成エラー:", error);
    res.status(500).send("スキル作成に失敗しました");
  }
});

router.get("/:id/edit", (req, res) => {
  const skill = SkillRepository.findById(req.params.id);
  if (!skill) return res.status(404).send("Not Found");
  const skillEffects = SkillEffectRepository.list();
  res.render(path.join("skills", "edit"), { skill, skillEffects });
});

router.post("/:id", upload.single("icon"), async (req, res) => {
  if (!req.params.id) return res.status(400).send("Bad Request");
  
  const body = req.body;
  const updateData: SkillUpdateInput = {
    ...(body.name && { name: body.name }),
    ...(req.file && { icon: req.file.filename }),
    ...(body.cost && { cost: parseInt(body.cost) }),
    ...(body.ct && { ct: parseInt(body.ct) }),
    ...(body.description && { description: body.description }),
    ...(body.targets && { targets: Array.isArray(body.targets) ? body.targets : [body.targets] }),
    ...(body.skillType && { skillType: body.skillType as SkillType }),
    ...(body.effectIds && { effectIds: Array.isArray(body.effectIds) ? body.effectIds : [body.effectIds] }),
  };
  await SkillRepository.update(req.params.id!, updateData);
  res.redirect("/skills");
});

router.post("/:id/delete", (req, res) => {
  SkillRepository.delete(req.params.id);
  res.redirect("/skills");
}); 