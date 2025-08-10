import express from 'express';
import { EquipmentRepository, RarityRepository } from '../../../shared/src/repository';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Equipment, Rarity } from '../../../shared/src/models';

const router = express.Router();

// アップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'));
    }
  }
});

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

    // オプショナル項目の処理（空文字列も含める）
    if (rarityId !== undefined) input.rarityId = rarityId || null;
    if (category !== undefined) input.category = category || null;
    if (weaponType !== undefined) input.weaponType = weaponType || null;
    if (equipmentSkill !== undefined) input.equipmentSkill = equipmentSkill || null;
    if (description !== undefined) input.description = description || null;
    
    // 入手方法の複数選択を配列として処理
    if (acquisitionMethod !== undefined) {
      if (Array.isArray(acquisitionMethod)) {
        input.acquisitionMethod = acquisitionMethod.length > 0 ? acquisitionMethod.join(', ') : null;
      } else {
        input.acquisitionMethod = acquisitionMethod || null;
      }
    }
    
    if (req.file) input.icon = req.file.filename;

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
    
    const { name, rarityId, category, weaponType, equipmentSkill, description, acquisitionMethod } = req.body;
    
    const input: any = {
      name
    };

    // オプショナル項目の処理（空文字列も含める）
    if (rarityId !== undefined) input.rarityId = rarityId || null;
    if (category !== undefined) input.category = category || null;
    if (weaponType !== undefined) input.weaponType = weaponType || null;
    if (equipmentSkill !== undefined) input.equipmentSkill = equipmentSkill || null;
    if (description !== undefined) input.description = description || null;
    
    // 入手方法の複数選択を配列として処理
    if (acquisitionMethod !== undefined) {
      if (Array.isArray(acquisitionMethod)) {
        input.acquisitionMethod = acquisitionMethod.length > 0 ? acquisitionMethod.join(', ') : null;
      } else {
        input.acquisitionMethod = acquisitionMethod || null;
      }
    }

    // 新しいアイコンがアップロードされた場合のみ更新
    if (req.file) {
      input.icon = req.file.filename;
      
      // 古いアイコンファイルを削除
      const oldEquipment = EquipmentRepository.findById(id);
      if (oldEquipment?.icon) {
        const oldIconPath = path.join(process.cwd(), '../../uploads', oldEquipment.icon);
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
        }
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
      const iconPath = path.join(process.cwd(), '../../uploads', equipment.icon);
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