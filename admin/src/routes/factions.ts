import { Router } from "express";
import path from "path";
import { upload, toPublicPath } from "../middleware/upload";
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

// 新規作成処理
router.post('/', upload.single('icon'), (req, res) => {
  try {
    const { name, iconReset } = req.body;
    
    const input: any = {
      name
    };

    // アイコンの処理
    if (iconReset === 'true') {
      input.icon = null;
    } else if (req.file) {
      input.icon = toPublicPath(req.file.filename);
    } else {
      input.icon = null;
    }

    FactionRepository.create(input);
    res.redirect('/factions');
  } catch (error) {
    console.error('陣営作成エラー:', error);
    res.status(500).send('陣営の作成に失敗しました');
  }
});

router.get("/:id/edit", (req, res) => {
  const item = FactionRepository.findById(req.params.id!);
  if (!item) return res.status(404).send("Not Found");
  res.render(path.join("factions", "edit"), { item });
});

// 更新処理（PUT）
router.put('/:id', (req, res) => {
  try {
    const id = req.params.id!;
    const { name, icon } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (icon !== undefined) input.icon = icon || null;

    const updated = FactionRepository.update(id, input);
    if (!updated) {
      return res.status(404).send('陣営が見つかりません');
    }
    
    res.redirect('/factions');
  } catch (error) {
    console.error('陣営更新エラー:', error);
    res.status(500).send('陣営の更新に失敗しました');
  }
});

// 更新処理（POST - HTMLフォーム用）
router.post('/:id', upload.single('icon'), (req, res) => {
  try {
    const id = req.params.id!;
    const { name, currentIcon, iconReset } = req.body;
    
    const input: any = {
      name
    };

    // アイコンの処理
    if (iconReset === 'true') {
      input.icon = null;
    } else if (req.file) {
      input.icon = toPublicPath(req.file.filename);
    } else if (currentIcon && currentIcon !== "") {
      input.icon = currentIcon;
    } else {
      input.icon = null;
    }

    const updated = FactionRepository.update(id, input);
    if (!updated) {
      return res.status(404).send('陣営が見つかりません');
    }
    
    res.redirect('/factions');
  } catch (error) {
    console.error('陣営更新エラー:', error);
    res.status(500).send('陣営の更新に失敗しました');
  }
});

router.post("/:id/delete", (req, res) => {
  FactionRepository.delete(req.params.id!);
  res.redirect("/factions");
}); 