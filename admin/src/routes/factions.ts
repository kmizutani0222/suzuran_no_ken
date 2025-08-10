import { Router } from "express";
import path from "path";
import multer from "multer";
import { FactionRepository } from "../../../shared/src/repository";
import { FactionCreateInput, FactionUpdateInput } from "../../../shared/src/models";

export const router = Router();

// Multer設定
const upload = multer({ dest: path.join(process.cwd(), "..", "..", "uploads") });

router.get("/", (_req, res) => {
  const items = FactionRepository.list();
  res.render(path.join("factions", "index"), { items });
});

router.get("/new", (_req, res) => {
  res.render(path.join("factions", "new"));
});

// 新規作成処理
router.post('/', (req, res) => {
  try {
    const { name, icon } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (icon !== undefined) input.icon = icon || null;

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

// 更新処理
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

router.post("/:id/delete", (req, res) => {
  FactionRepository.delete(req.params.id!);
  res.redirect("/factions");
}); 