import { Router } from "express";
import path from "path";
import fs from "fs";
import { RarityRepository } from "../../../shared/src/repository";
import { RarityCreateInput, RarityUpdateInput } from "../../../shared/src/models";
import { upload, toPublicPath } from "../middleware/upload";

export const router = Router();

router.get("/", (_req, res) => {
  const items = RarityRepository.list();
  res.render(path.join("rarities", "index"), { items });
});

router.get("/new", (_req, res) => {
  res.render(path.join("rarities", "new"));
});

// 新規作成処理
router.post('/', upload.single('icon'), (req, res) => {
  try {
    const { name, value } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (value !== undefined) input.value = value || null;
    if (req.file?.filename) input.image = toPublicPath(req.file.filename);

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
router.post('/:id', upload.single('icon'), (req, res) => {
  try {
    const id = req.params.id!;
    const { name, value, currentIcon } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (value !== undefined) input.value = value || null;
    
    // アイコンの処理
    if (req.file?.filename) {
      input.image = toPublicPath(req.file.filename);
      // 既存のアイコンファイルを削除
      if (currentIcon && currentIcon !== '') {
        const oldIconPath = currentIcon.replace('/uploads/', '');
        const oldIconFullPath = path.join(process.cwd(), '..', 'uploads', oldIconPath);
        try {
          if (fs.existsSync(oldIconFullPath)) {
            fs.unlinkSync(oldIconFullPath);
          }
        } catch (error) {
          console.error('古いアイコンファイルの削除に失敗:', error);
        }
      }
    } else if (req.body.iconReset === 'true') {
      input.image = "";
      // 既存のアイコンファイルを削除
      if (currentIcon && currentIcon !== '') {
        const oldIconPath = currentIcon.replace('/uploads/', '');
        const oldIconFullPath = path.join(process.cwd(), '..', 'uploads', oldIconPath);
        try {
          if (fs.existsSync(oldIconFullPath)) {
            fs.unlinkSync(oldIconFullPath);
          }
        } catch (error) {
          console.error('古いアイコンファイルの削除に失敗:', error);
        }
      }
    } else if (currentIcon && currentIcon !== '') {
      input.image = currentIcon;
    }

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