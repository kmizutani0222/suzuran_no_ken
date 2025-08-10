import express from 'express';
import { EquipmentRepository } from '../../../shared/src/repository';
import { RarityRepository } from '../../../shared/src/repository';
import { upload, toPublicPath } from '../middleware/upload';
import path from 'path';
import fs from 'fs';
import { Equipment, Rarity } from '../../../shared/src/models';

const router = express.Router();

// 一覧表示
router.get('/', (req, res) => {
  try {
    const equipment = EquipmentRepository.list();
    
    // レアリティ情報を取得
    const rarities = RarityRepository.list();
    const rarityMap = new Map(rarities.map((r: Rarity) => [r.id, r]));
    
    // 装備にレアリティ情報を追加
    const equipmentWithRarity = equipment.map((e: Equipment) => ({
      ...e,
      rarity: e.rarityId ? rarityMap.get(e.rarityId) : null
    }));
    
    res.render('equipment/index', { equipment: equipmentWithRarity });
  } catch (error) {
    console.error('装備一覧取得エラー:', error);
    res.status(500).send('装備一覧の取得に失敗しました');
  }
});

// 新規作成画面
router.get('/new', (req, res) => {
  const rarities = RarityRepository.list();
  res.render('equipment/new', { rarities });
});

// 新規作成処理
router.post('/', upload.single('icon'), (req, res) => {
  try {
    const { name, rarityId, category, weaponType, equipmentSkill, description, acquisitionMethod } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列はnullに変換）
    if (rarityId !== undefined) input.rarityId = rarityId === '' ? null : rarityId;
    if (category !== undefined) input.category = category === '' ? null : category;
    if (weaponType !== undefined) input.weaponType = weaponType === '' ? null : weaponType;
    if (equipmentSkill !== undefined) input.equipmentSkill = equipmentSkill === '' ? null : equipmentSkill;
    if (description !== undefined) input.description = description === '' ? null : description;
    
    // 入手方法の複数選択を配列として処理
    if (acquisitionMethod !== undefined) {
      if (Array.isArray(acquisitionMethod)) {
        input.acquisitionMethod = acquisitionMethod.length > 0 ? acquisitionMethod.join(', ') : null;
      } else if (acquisitionMethod === '') {
        input.acquisitionMethod = null;
      } else {
        input.acquisitionMethod = acquisitionMethod;
      }
    }
    
    // アイコンの処理
    if (req.file) {
      input.icon = toPublicPath(req.file.filename);
    } else {
      input.icon = null;
    }

    EquipmentRepository.create(input);
    res.redirect('/equipment');
  } catch (error) {
    console.error('装備作成エラー:', error);
    res.status(500).send('装備の作成に失敗しました');
  }
});

// 編集画面
router.get('/:id/edit', (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).send('IDが指定されていません');
  }
  
  const equipment = EquipmentRepository.findById(id);
  if (!equipment) {
    return res.status(404).send('装備が見つかりません');
  }
  
  const rarities = RarityRepository.list();
  res.render('equipment/edit', { equipment, rarities });
});

// 更新処理
router.put('/:id', upload.single('icon'), (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send('IDが指定されていません');
    }
    
    const { name, rarityId, category, weaponType, equipmentSkill, description, acquisitionMethod, iconClear } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列はnullに変換）
    if (rarityId !== undefined) input.rarityId = rarityId === '' ? null : rarityId;
    if (category !== undefined) input.category = category === '' ? null : category;
    if (weaponType !== undefined) input.weaponType = weaponType === '' ? null : weaponType;
    if (equipmentSkill !== undefined) input.equipmentSkill = equipmentSkill === '' ? null : equipmentSkill;
    if (description !== undefined) input.description = description === '' ? null : description;
    
    // 入手方法の複数選択を配列として処理
    if (acquisitionMethod !== undefined) {
      if (Array.isArray(acquisitionMethod)) {
        input.acquisitionMethod = acquisitionMethod.length > 0 ? acquisitionMethod.join(', ') : null;
      } else if (acquisitionMethod === '') {
        input.acquisitionMethod = null;
      } else {
        input.acquisitionMethod = acquisitionMethod;
      }
    }

    // アイコンの処理
    if (iconClear === 'true') {
      // アイコンリセットが要求された場合
      input.icon = null;
      
      // 古いアイコンファイルを削除
      const oldEquipment = EquipmentRepository.findById(id);
      if (oldEquipment?.icon) {
        const filename = oldEquipment.icon.replace('/uploads/', '');
        const oldIconPath = path.join(process.cwd(), '../../uploads', filename);
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
        }
      }
    } else if (req.file) {
      // 新しいアイコンがアップロードされた場合
      input.icon = toPublicPath(req.file.filename);
      
      // 古いアイコンファイルを削除
      const oldEquipment = EquipmentRepository.findById(id);
      if (oldEquipment?.icon) {
        const filename = oldEquipment.icon.replace('/uploads/', '');
        const oldIconPath = path.join(process.cwd(), '../../uploads', filename);
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
        }
      }
    } else {
      // アイコンがアップロードされていない場合は既存のアイコンを保持
      const existingEquipment = EquipmentRepository.findById(id);
      if (existingEquipment?.icon && existingEquipment.icon.trim() !== '') {
        input.icon = existingEquipment.icon;
      } else {
        input.icon = null;
      }
    }

    const updated = EquipmentRepository.update(id, input);
    if (!updated) {
      return res.status(404).send('装備が見つかりません');
    }
    
    res.redirect('/equipment');
  } catch (error) {
    console.error('装備更新エラー:', error);
    res.status(500).send('装備の更新に失敗しました');
  }
});

// 削除処理
router.delete('/:id', (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send('IDが指定されていません');
    }
    
    const equipment = EquipmentRepository.findById(id);
    if (equipment?.icon) {
      const filename = equipment.icon.replace('/uploads/', '');
      const iconPath = path.join(process.cwd(), '../../uploads', filename);
      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
      }
    }
    
    const deleted = EquipmentRepository.delete(id);
    if (!deleted) {
      return res.status(404).send('装備が見つかりません');
    }
    
    res.redirect('/equipment');
  } catch (error) {
    console.error('装備削除エラー:', error);
    res.status(500).send('装備の削除に失敗しました');
  }
});

export default router; 