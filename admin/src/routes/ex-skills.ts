import express from "express";
import multer from "multer";
import { ExSkillCreateInput, ExSkillUpdateInput } from "../../../shared/src/models";
import { ExSkillRepository, SkillEffectRepository } from "../../../shared/src/repository";
import { upload, toPublicPath } from "../middleware/upload";

export const router = express.Router();

// 一覧表示
router.get("/", async (req, res) => {
  try {
    const exSkills = await ExSkillRepository.list();
    res.render("ex_skills/index", { exSkills });
  } catch (error) {
    console.error("EXスキル一覧表示エラー:", error);
    res.status(500).send("一覧表示に失敗しました");
  }
});

// 新規作成画面表示
router.get("/new", async (req, res) => {
  try {
    const skillEffects = await SkillEffectRepository.list();
    res.render("ex_skills/new", { skillEffects });
  } catch (error) {
    console.error("EXスキル新規作成画面表示エラー:", error);
    res.status(500).send("画面表示に失敗しました");
  }
});

// 新規作成処理
router.post("/", upload.single("icon"), async (req, res) => {
  try {
    const body = req.body;
    const exSkillData: ExSkillCreateInput = {
      name: body.name,
      effectIds: body.effectIds ? (Array.isArray(body.effectIds) ? body.effectIds : [body.effectIds]) : (body.noEffectIds ? [] : []),
      lv1Description: body.lv1Description || "",
      lv2Description: body.lv2Description || "",
      lv3Description: body.lv3Description || "",
    };

    // iconが存在する場合のみ追加
    if (req.file?.filename) {
      (exSkillData as any).icon = req.file.filename;
    }

    const exSkill = await ExSkillRepository.create(exSkillData);
    res.redirect("/ex-skills");
  } catch (error) {
    console.error("EXスキル作成エラー:", error);
    res.status(500).send("EXスキル作成に失敗しました");
  }
});

// 編集画面表示
router.get("/:id/edit", async (req, res) => {
  try {
    const exSkill = await ExSkillRepository.findById(req.params.id!);
    if (!exSkill) {
      return res.status(404).send("EXスキルが見つかりません");
    }

    const skillEffects = await SkillEffectRepository.list();
    res.render("ex_skills/edit", { exSkill, skillEffects });
  } catch (error) {
    console.error("EXスキル編集画面表示エラー:", error);
    res.status(500).send("画面表示に失敗しました");
  }
});

// 更新処理（PUT）
router.put("/:id", upload.single("icon"), async (req, res) => {
  try {
    const body = req.body;
    const updateData: ExSkillUpdateInput = {
      name: body.name,
      effectIds: body.effectIds ? (Array.isArray(body.effectIds) ? body.effectIds : [body.effectIds]) : (body.noEffectIds ? [] : []),
      lv1Description: body.lv1Description || "",
      lv2Description: body.lv2Description || "",
      lv3Description: body.lv3Description || "",
    };

    // アイコンの処理
    if (req.file?.filename) {
      // 新しいファイルがアップロードされた場合
      (updateData as any).icon = req.file.filename;
    } else if (body.iconReset === 'true') {
      // アイコンがリセットされた場合（空文字列を設定）
      (updateData as any).icon = "";
    } else if (body.currentIcon && body.currentIcon !== "") {
      // 既存のアイコンを保持する場合
      (updateData as any).icon = body.currentIcon;
    } else {
      // アイコンが指定されていない場合（空文字列を設定）
      (updateData as any).icon = "";
    }

    await ExSkillRepository.update(req.params.id!, updateData);
    res.redirect("/ex-skills");
  } catch (error) {
    console.error("EXスキル更新エラー:", error);
    res.status(500).send("EXスキル更新に失敗しました");
  }
});

// 更新処理（POST - HTMLフォーム用）
router.post("/:id", upload.single("icon"), async (req, res) => {
  try {
    const body = req.body;
    const updateData: ExSkillUpdateInput = {
      name: body.name,
      effectIds: body.effectIds ? (Array.isArray(body.effectIds) ? body.effectIds : [body.effectIds]) : (body.noEffectIds ? [] : []),
      lv1Description: body.lv1Description || "",
      lv2Description: body.lv2Description || "",
      lv3Description: body.lv3Description || "",
    };

    // アイコンの処理
    if (req.file?.filename) {
      // 新しいファイルがアップロードされた場合
      (updateData as any).icon = req.file.filename;
    } else if (body.iconReset === 'true') {
      // アイコンがリセットされた場合（空文字列を設定）
      (updateData as any).icon = "";
    } else if (body.currentIcon && body.currentIcon !== "") {
      // 既存のアイコンを保持する場合
      (updateData as any).icon = body.currentIcon;
    } else {
      // アイコンが指定されていない場合（空文字列を設定）
      (updateData as any).icon = "";
    }

    await ExSkillRepository.update(req.params.id!, updateData);
    res.redirect("/ex-skills");
  } catch (error) {
    console.error("EXスキル更新エラー:", error);
    res.status(500).send("EXスキル更新に失敗しました");
  }
});

// 削除処理
router.delete("/:id", async (req, res) => {
  try {
    const success = await ExSkillRepository.delete(req.params.id!);
    if (!success) {
      return res.status(404).send("EXスキルが見つかりません");
    }
    res.redirect("/ex-skills");
  } catch (error) {
    console.error("EXスキル削除エラー:", error);
    res.status(500).send("EXスキル削除に失敗しました");
  }
}); 