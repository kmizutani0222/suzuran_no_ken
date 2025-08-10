import { Router } from "express";
import path from "path";
import { upload, toPublicPath } from "../middleware/upload";
import { RoleRepository } from "../../../shared/src/repository";
import { RoleCreateInput, RoleUpdateInput } from "../../../shared/src/models";

export const router = Router();

router.get("/", (_req, res) => {
  const items = RoleRepository.list();
  res.render(path.join("roles", "index"), { items });
});

router.get("/new", (_req, res) => {
  res.render(path.join("roles", "new"));
});

// 新規作成処理
router.post('/', upload.single('icon'), (req, res) => {
  try {
    const { name, movementPower, jumpHigh, jumpLow, terrainSuitability, iconReset } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (movementPower !== undefined) input.movementPower = movementPower || null;
    if (jumpHigh !== undefined) input.jumpHigh = jumpHigh || null;
    if (jumpLow !== undefined) input.jumpLow = jumpLow || null;
    if (terrainSuitability !== undefined) input.terrainSuitability = terrainSuitability || null;

    // アイコンの処理
    if (iconReset === 'true') {
      input.icon = null;
    } else if (req.file) {
      input.icon = toPublicPath(req.file.filename);
    } else {
      input.icon = null;
    }

    RoleRepository.create(input);
    res.redirect('/roles');
  } catch (error) {
    console.error('ロール作成エラー:', error);
    res.status(500).send('ロールの作成に失敗しました');
  }
});

router.get("/:id/edit", (req, res) => {
  const item = RoleRepository.findById(req.params.id!);
  if (!item) return res.status(404).send("Not Found");
  res.render(path.join("roles", "edit"), { item });
});

// 更新処理（PUT）
router.put('/:id', (req, res) => {
  try {
    const id = req.params.id!;
    const { name, movementPower, jumpHigh, jumpLow, terrainSuitability, icon } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (movementPower !== undefined) input.movementPower = movementPower || null;
    if (jumpHigh !== undefined) input.jumpHigh = jumpHigh || null;
    if (jumpLow !== undefined) input.jumpLow = jumpLow || null;
    if (terrainSuitability !== undefined) input.terrainSuitability = terrainSuitability || null;
    if (icon !== undefined) input.icon = icon || null;

    const updated = RoleRepository.update(id, input);
    if (!updated) {
      return res.status(404).send('ロールが見つかりません');
    }
    
    res.redirect('/roles');
  } catch (error) {
    console.error('ロール更新エラー:', error);
    res.status(500).send('ロールの更新に失敗しました');
  }
});

// 更新処理（POST - HTMLフォーム用）
router.post('/:id', upload.single('icon'), (req, res) => {
  try {
    const id = req.params.id!;
    const { name, movementPower, jumpHigh, jumpLow, terrainSuitability, currentIcon, iconReset } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (movementPower !== undefined) input.movementPower = movementPower || null;
    if (jumpHigh !== undefined) input.jumpHigh = jumpHigh || null;
    if (jumpLow !== undefined) input.jumpLow = jumpLow || null;
    if (terrainSuitability !== undefined) input.terrainSuitability = terrainSuitability || null;

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

    const updated = RoleRepository.update(id, input);
    if (!updated) {
      return res.status(404).send('ロールが見つかりません');
    }
    
    res.redirect('/roles');
  } catch (error) {
    console.error('ロール更新エラー:', error);
    res.status(500).send('ロールの更新に失敗しました');
  }
});

router.post("/:id/delete", (req, res) => {
  RoleRepository.delete(req.params.id!);
  res.redirect("/roles");
}); 