import { Router } from "express";
import path from "path";
import fs from "fs";
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

router.post("/", upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'rangeImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const body = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // 射程・範囲の処理
    const range: any = {};
    if (body.distanceFrom !== '') range.distanceFrom = body.distanceFrom ? parseInt(body.distanceFrom) : null;
    if (body.distanceTo !== '') range.distanceTo = body.distanceTo ? parseInt(body.distanceTo) : null;
    if (body.heightDiffFrom !== '') range.heightDiffFrom = body.heightDiffFrom ? parseInt(body.heightDiffFrom) : null;
    if (body.heightDiffTo !== '') range.heightDiffTo = body.heightDiffTo ? parseInt(body.heightDiffTo) : null;
    if (body.areaHeightDiffFrom !== '') range.areaHeightDiffFrom = body.areaHeightDiffFrom ? parseInt(body.areaHeightDiffFrom) : null;
    if (body.areaHeightDiffTo !== '') range.areaHeightDiffTo = body.areaHeightDiffTo ? parseInt(body.areaHeightDiffTo) : null;

    const skillData: SkillCreateInput = {
      name: body.name,
      cost: parseInt(body.cost) || 0,
      ct: parseInt(body.ct) || 0,
      description: body.description || "",
      targets: body.targets ? (Array.isArray(body.targets) ? body.targets : [body.targets]) : [],
      skillType: body.skillType && body.skillType !== '' ? body.skillType as SkillType : "アクティブ",
      effectIds: body.effectIds ? (Array.isArray(body.effectIds) ? body.effectIds : [body.effectIds]) : [],
      range: range
    };

    // iconが存在する場合のみ追加
    if (files.icon && files.icon[0]?.filename) {
      (skillData as any).icon = toPublicPath(files.icon[0].filename);
    }

    // rangeImageが存在する場合のみ追加
    if (files.rangeImage && files.rangeImage[0]?.filename) {
      range.image = toPublicPath(files.rangeImage[0].filename);
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

router.post("/:id", upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'rangeImage', maxCount: 1 }
]), async (req, res) => {
  if (!req.params.id) return res.status(400).send("Bad Request");
  
  // 既存のスキルデータを取得
  const existingSkill = SkillRepository.findById(req.params.id);
  if (!existingSkill) return res.status(404).send("Not Found");
  
  const body = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
  // アイコンとレンジ画像の処理
  let icon = undefined;
  if (body.iconClear === 'true') {
    icon = null;
    // 既存のアイコンファイルを削除
    if (existingSkill.icon) {
      const oldIconPath = existingSkill.icon.replace('/uploads/', '');
      const oldIconFullPath = path.join(__dirname, '../../../uploads', oldIconPath);
      try {
        if (fs.existsSync(oldIconFullPath)) {
          fs.unlinkSync(oldIconFullPath);
        }
      } catch (error) {
        console.error('古いアイコンファイルの削除に失敗:', error);
      }
    }
  } else if (files.icon && files.icon[0]) {
    icon = toPublicPath(files.icon[0].filename);
    // 既存のアイコンファイルを削除
    if (existingSkill.icon) {
      const oldIconPath = existingSkill.icon.replace('/uploads/', '');
      const oldIconFullPath = path.join(__dirname, '../../../uploads', oldIconPath);
      try {
        if (fs.existsSync(oldIconFullPath)) {
          fs.unlinkSync(oldIconFullPath);
        }
      } catch (error) {
        console.error('古いアイコンファイルの削除に失敗:', error);
      }
    }
  }
  
  let rangeImage = undefined;
  if (body.rangeImageClear === 'true') {
    rangeImage = null;
    // 既存の範囲画像ファイルを削除
    if (existingSkill.range && existingSkill.range.image) {
      const oldImagePath = existingSkill.range.image.replace('/uploads/', '');
      const oldImageFullPath = path.join(__dirname, '../../../uploads', oldImagePath);
      try {
        if (fs.existsSync(oldImageFullPath)) {
          fs.unlinkSync(oldImageFullPath);
        }
      } catch (error) {
        console.error('古い範囲画像ファイルの削除に失敗:', error);
      }
    }
  } else if (files.rangeImage && files.rangeImage[0]) {
    rangeImage = toPublicPath(files.rangeImage[0].filename);
    // 既存の範囲画像ファイルを削除
    if (existingSkill.range && existingSkill.range.image) {
      const oldImagePath = existingSkill.range.image.replace('/uploads/', '');
      const oldImageFullPath = path.join(__dirname, '../../../uploads', oldImagePath);
      try {
        if (fs.existsSync(oldImageFullPath)) {
          fs.unlinkSync(oldImageFullPath);
        }
      } catch (error) {
        console.error('古い範囲画像ファイルの削除に失敗:', error);
      }
    }
  }
  
  // 数値フィールドの処理（空文字列はnullに変換）
  const cost = body.cost === '' ? null : (body.cost ? parseInt(body.cost) : undefined);
  const ct = body.ct === '' ? null : (body.ct ? parseInt(body.ct) : undefined);
  
  // 射程・範囲の処理
  const range: any = {};
  if (body.distanceFrom !== undefined) range.distanceFrom = body.distanceFrom === '' ? null : (body.distanceFrom ? parseInt(body.distanceFrom) : null);
  if (body.distanceTo !== undefined) range.distanceTo = body.distanceTo === '' ? null : (body.distanceTo ? parseInt(body.distanceTo) : null);
  if (body.heightDiffFrom !== undefined) range.heightDiffFrom = body.heightDiffFrom === '' ? null : (body.heightDiffFrom ? parseInt(body.heightDiffFrom) : null);
  if (body.heightDiffTo !== undefined) range.heightDiffTo = body.heightDiffTo === '' ? null : (body.heightDiffTo ? parseInt(body.heightDiffTo) : null);
  if (body.areaHeightDiffFrom !== undefined) range.areaHeightDiffFrom = body.areaHeightDiffFrom === '' ? null : (body.areaHeightDiffFrom ? parseInt(body.areaHeightDiffFrom) : null);
  if (body.areaHeightDiffTo !== undefined) range.areaHeightDiffTo = body.areaHeightDiffTo === '' ? null : (body.areaHeightDiffTo ? parseInt(body.areaHeightDiffTo) : null);
  if (rangeImage !== undefined) range.image = rangeImage;
  
  const updateData: SkillUpdateInput = {
    ...(body.name && { name: body.name }),
    ...(icon !== undefined && { icon }),
    ...(cost !== undefined && { cost }),
    ...(ct !== undefined && { ct }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.targets !== undefined && { targets: Array.isArray(body.targets) ? body.targets : [body.targets] }),
    ...(body.skillType !== undefined && { skillType: body.skillType === '' ? null : body.skillType as SkillType }),
    ...(body.effectIds !== undefined && { effectIds: Array.isArray(body.effectIds) ? body.effectIds : [body.effectIds] }),
    ...(range && { range })
  };
  
  await SkillRepository.update(req.params.id!, updateData);
  res.redirect("/skills");
});

router.post("/:id/delete", (req, res) => {
  if (!req.params.id) return res.status(400).send("Bad Request");
  
  // 削除前にスキルデータを取得
  const skill = SkillRepository.findById(req.params.id);
  if (!skill) return res.status(404).send("Not Found");
  
  // アイコンファイルを削除
  if (skill.icon) {
    const iconPath = skill.icon.replace('/uploads/', '');
    const iconFullPath = path.join(__dirname, '../../../uploads', iconPath);
    try {
      if (fs.existsSync(iconFullPath)) {
        fs.unlinkSync(iconFullPath);
      }
    } catch (error) {
      console.error('アイコンファイルの削除に失敗:', error);
    }
  }
  
  // 範囲画像ファイルを削除
  if (skill.range && skill.range.image) {
    const rangeImagePath = skill.range.image.replace('/uploads/', '');
    const rangeImageFullPath = path.join(__dirname, '../../../uploads', rangeImagePath);
    try {
      if (fs.existsSync(rangeImageFullPath)) {
        fs.unlinkSync(rangeImageFullPath);
      }
    } catch (error) {
      console.error('範囲画像ファイルの削除に失敗:', error);
    }
  }
  
  // スキルデータを削除
  SkillRepository.delete(req.params.id);
  res.redirect("/skills");
});

// DELETEメソッドでも削除を受け付ける
router.delete("/:id", (req, res) => {
  if (!req.params.id) return res.status(400).send("Bad Request");
  
  // 削除前にスキルデータを取得
  const skill = SkillRepository.findById(req.params.id);
  if (!skill) return res.status(404).send("Not Found");
  
  // アイコンファイルを削除
  if (skill.icon) {
    const iconPath = skill.icon.replace('/uploads/', '');
    const iconFullPath = path.join(__dirname, '../../../uploads', iconPath);
    try {
      if (fs.existsSync(iconFullPath)) {
        fs.unlinkSync(iconFullPath);
      }
    } catch (error) {
      console.error('アイコンファイルの削除に失敗:', error);
    }
  }
  
  // 範囲画像ファイルを削除
  if (skill.range && skill.range.image) {
    const rangeImagePath = skill.range.image.replace('/uploads/', '');
    const rangeImageFullPath = path.join(__dirname, '../../../uploads', rangeImagePath);
    try {
      if (fs.existsSync(rangeImageFullPath)) {
        fs.unlinkSync(rangeImageFullPath);
      }
    } catch (error) {
      console.error('範囲画像ファイルの削除に失敗:', error);
    }
  }
  
  // スキルデータを削除
  SkillRepository.delete(req.params.id);
  res.redirect("/skills");
}); 