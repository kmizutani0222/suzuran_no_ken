import { Router } from "express";
import path from "path";
import multer from "multer";
import { RarityRepository } from "../../../shared/src/repository";
import { RarityCreateInput, RarityUpdateInput } from "../../../shared/src/models";

export const router = Router();

// Multer設定
const upload = multer({ dest: path.join(process.cwd(), "..", "..", "uploads") });

router.get("/", (_req, res) => {
  const items = RarityRepository.list();
  res.render(path.join("rarities", "index"), { items });
});

router.get("/new", (_req, res) => {
  res.render(path.join("rarities", "new"));
});

// 新規作成処理
router.post('/', (req, res) => {
  try {
    const { name, value, icon } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (value !== undefined) input.value = value || null;
    if (icon !== undefined) input.image = icon || null;

    RarityRepository.create(input);
    res.redirect('/rarities');
  } catch (error) {
    console.error('レアリティ作成エラー:', error);
    res.status(500).send('レアリティの作成に失敗しました');
  }
});

router.get("/:id/edit", (req, res) => {
  const item = RarityRepository.findById(req.params.id!);
  if (!item) return res.status(404).send("Not Found");
  res.render(path.join("rarities", "edit"), { item });
});

// 更新処理
router.put('/:id', (req, res) => {
  try {
    const id = req.params.id!;
    const { name, value, icon } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (value !== undefined) input.value = value || null;
    if (icon !== undefined) input.image = icon || null;

    const updated = RarityRepository.update(id, input);
    if (!updated) {
      return res.status(404).send('レアリティが見つかりません');
    }
    
    res.redirect('/rarities');
  } catch (error) {
    console.error('レアリティ更新エラー:', error);
    res.status(500).send('レアリティの更新に失敗しました');
  }
});

router.post("/:id/delete", (req, res) => {
  RarityRepository.delete(req.params.id!);
  res.redirect("/rarities");
}); 