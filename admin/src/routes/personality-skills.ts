import express from "express";
import multer from "multer";
import path from "path";
import { PersonalitySkillRepository, SkillEffectRepository } from "../../../shared/src/repository";
import { PersonalitySkillCreateInput, PersonalitySkillUpdateInput } from "../../../shared/src/models";

const router = express.Router();

// Multer設定
const upload = multer({ dest: path.join(process.cwd(), "..", "uploads") });

// 一覧表示
router.get("/", (req, res) => {
  const personalitySkills = PersonalitySkillRepository.list();
  res.render("personality_skills/index", { personalitySkills });
});

// 新規作成画面
router.get("/new", (req, res) => {
  // スキル効果の一覧を取得（選択肢として使用）
  const skillEffects = SkillEffectRepository.list();
  res.render("personality_skills/new", { skillEffects });
});

// 新規作成処理
router.post("/", upload.single("icon"), (req, res) => {
  try {
    const input: PersonalitySkillCreateInput = {
      name: req.body.name,
      effectIds: req.body.effectIds ? (Array.isArray(req.body.effectIds) ? req.body.effectIds : [req.body.effectIds]) : [],
      star1Description: req.body.star1Description || "",
      star2Description: req.body.star2Description || "",
      star3Description: req.body.star3Description || "",
      star4Description: req.body.star4Description || "",
      star5Description: req.body.star5Description || "",
    };

    if (req.file?.filename) {
      input.icon = req.file.filename;
    }

    PersonalitySkillRepository.create(input);
    res.redirect("/personality-skills");
  } catch (error) {
    console.error("個性スキル作成エラー:", error);
    res.status(500).send("個性スキルの作成に失敗しました");
  }
});

// 編集画面
router.get("/:id/edit", (req, res) => {
  const personalitySkill = PersonalitySkillRepository.findById(req.params.id!);
  if (!personalitySkill) {
    return res.status(404).send("個性スキルが見つかりません");
  }

  // スキル効果の一覧を取得（選択肢として使用）
  const skillEffects = SkillEffectRepository.list();
  
  res.render("personality_skills/edit", { item: personalitySkill, skillEffects });
});

// 更新処理（PUT）
router.put("/:id", upload.single("icon"), (req, res) => {
  try {
    const input: PersonalitySkillUpdateInput = {
      name: req.body.name,
      effectIds: req.body.effectIds ? (Array.isArray(req.body.effectIds) ? req.body.effectIds : [req.body.effectIds]) : [],
      star1Description: req.body.star1Description || "",
      star2Description: req.body.star2Description || "",
      star3Description: req.body.star3Description || "",
      star4Description: req.body.star4Description || "",
      star5Description: req.body.star5Description || "",
    };

    // アイコンの処理
    if (req.file?.filename) {
      // 新しいファイルがアップロードされた場合
      input.icon = req.file.filename as string;
    } else if (req.body.iconReset === 'true') {
      // アイコンがリセットされた場合（空文字列を設定）
      input.icon = "";
    } else if (req.body.currentIcon && req.body.currentIcon !== "") {
      // 既存のアイコンを保持する場合
      input.icon = req.body.currentIcon as string;
    } else {
      // アイコンが指定されていない場合（空文字列を設定）
      input.icon = "";
    }

    const updated = PersonalitySkillRepository.update(req.params.id!, input);
    if (!updated) {
      return res.status(404).send("個性スキルが見つかりません");
    }

    res.redirect("/personality-skills");
  } catch (error) {
    console.error("個性スキル更新エラー:", error);
    res.status(500).send("個性スキルの更新に失敗しました");
  }
});

// 更新処理（POST - HTMLフォーム用）
router.post("/:id", upload.single("icon"), (req, res) => {
  try {
    const input: PersonalitySkillUpdateInput = {
      name: req.body.name,
      effectIds: req.body.effectIds ? (Array.isArray(req.body.effectIds) ? req.body.effectIds : [req.body.effectIds]) : [],
      star1Description: req.body.star1Description || "",
      star2Description: req.body.star2Description || "",
      star3Description: req.body.star3Description || "",
      star4Description: req.body.star4Description || "",
      star5Description: req.body.star5Description || "",
    };

    // アイコンの処理
    if (req.file?.filename) {
      // 新しいファイルがアップロードされた場合
      input.icon = req.file.filename as string;
    } else if (req.body.iconReset === 'true') {
      // アイコンがリセットされた場合（空文字列を設定）
      input.icon = "";
    } else if (req.body.currentIcon && req.body.currentIcon !== "") {
      // 既存のアイコンを保持する場合
      input.icon = req.body.currentIcon as string;
    } else {
      // アイコンが指定されていない場合（空文字列を設定）
      input.icon = "";
    }

    const updated = PersonalitySkillRepository.update(req.params.id!, input);
    if (!updated) {
      return res.status(404).send("個性スキルが見つかりません");
    }

    res.redirect("/personality-skills");
  } catch (error) {
    console.error("個性スキル更新エラー:", error);
    res.status(500).send("個性スキルの更新に失敗しました");
  }
});

// 削除処理
router.delete("/:id", (req, res) => {
  try {
    const deleted = PersonalitySkillRepository.delete(req.params.id!);
    if (!deleted) {
      return res.status(404).send("個性スキルが見つかりません");
    }

    res.redirect("/personality-skills");
  } catch (error) {
    console.error("個性スキル削除エラー:", error);
    res.status(500).send("個性スキルの削除に失敗しました");
  }
});

export { router }; 