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

// 新規作成処理
router.post('/', (req, res) => {
  try {
    const { name, category, description } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (category !== undefined) input.category = category || null;
    if (description !== undefined) input.description = description || null;

    SkillEffectRepository.create(input);
    res.redirect('/skill-effects');
  } catch (error) {
    console.error('スキル効果作成エラー:', error);
    res.status(500).send('スキル効果の作成に失敗しました');
  }
});

router.get("/:id/edit", (req, res) => {
  const skillEffect = SkillEffectRepository.findById(req.params.id);
  if (!skillEffect) return res.status(404).send("Not Found");
  res.render(path.join("skill_effects", "edit"), { skillEffect });
});

// 更新処理
router.put('/:id', (req, res) => {
  try {
    const id = req.params.id!;
    const { name, category, description } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (category !== undefined) input.category = category || null;
    if (description !== undefined) input.description = description || null;

    const updated = SkillEffectRepository.update(id, input);
    if (!updated) {
      return res.status(404).send('スキル効果が見つかりません');
    }
    
    res.redirect('/skill-effects');
  } catch (error) {
    console.error('スキル効果更新エラー:', error);
    res.status(500).send('スキル効果の更新に失敗しました');
  }
});

router.post("/:id/delete", (req, res) => {
  SkillEffectRepository.delete(req.params.id);
  res.redirect("/skill-effects");
}); 