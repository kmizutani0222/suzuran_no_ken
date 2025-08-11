import express from 'express';
import { TarotRepository, RarityRepository } from '../../../shared/src/repository';
import { TarotCreateInput, TarotUpdateInput } from '../../../shared/src/models';
import { upload, toPublicPath } from '../middleware/upload';
import path from 'path';
import fs from 'fs';

const router = express.Router();



// 一覧表示
router.get('/', (req, res) => {
  try {
    const tarots = TarotRepository.findAllWithRarity();
    
    // 古いデータ形式（tarot-プレフィックス）を修正
    tarots.forEach(tarot => {
      if (tarot.icon && tarot.icon.includes('/uploads/tarot-')) {
        const correctedIcon = tarot.icon.replace('/uploads/tarot-', '/uploads/');
        tarot.icon = correctedIcon;
        // データベースも更新
        TarotRepository.update(tarot.id, { icon: correctedIcon });
      }
    });
    
    res.render('tarots/index', { tarots });
  } catch (error) {
    res.status(500).send('タロット一覧の取得に失敗しました');
  }
});

// 新規作成フォーム表示
router.get('/new', (req, res) => {
  const rarities = RarityRepository.list();
  res.render('tarots/new', { rarities });
});

// 新規作成
router.post('/', upload.single('icon'), (req, res) => {
  try {
    console.log('タロット作成 - ファイル情報:', req.file);
    console.log('タロット作成 - ボディ情報:', req.body);
    
    // ファイルがアップロードされた場合の詳細ログ
    if (req.file) {
      console.log('タロット作成 - ファイル詳細:');
      console.log('  - オリジナル名:', req.file.originalname);
      console.log('  - 保存名:', req.file.filename);
      console.log('  - 保存パス:', req.file.path);
      console.log('  - ファイルサイズ:', req.file.size);
      console.log('  - MIMEタイプ:', req.file.mimetype);
      
      // ファイルが実際に存在するかチェック
      const filePath = path.join(process.cwd(), '../../uploads', req.file.filename);
      console.log('  - 絶対パス:', filePath);
      console.log('  - ファイル存在:', fs.existsSync(filePath));
    }
    
    const input: TarotCreateInput = {
      name: req.body.name,
      rarityId: req.body.rarityId,
      icon: req.file ? `/uploads/${req.file.filename}` : '',
      equipmentSkill: req.body.equipmentSkill || '',
      additionalSkill: req.body.additionalSkill || '',
      description: req.body.description || '',
      acquisitionMethods: Array.isArray(req.body.acquisitionMethods) 
        ? req.body.acquisitionMethods 
        : req.body.acquisitionMethods ? [req.body.acquisitionMethods] : []
    };

    console.log('タロット作成 - 入力データ:', input);
    
    const created = TarotRepository.create(input);
    console.log('タロット作成 - 作成完了:', created);
    
    res.redirect('/tarots');
  } catch (error) {
    console.error('タロット作成エラー:', error);
    res.status(500).send('タロットの作成に失敗しました');
  }
});

// 編集フォーム表示
router.get('/:id/edit', (req, res) => {
  const tarot = TarotRepository.findById(req.params.id);
  if (!tarot) {
    return res.status(404).send('タロットが見つかりません');
  }

  // 古いデータ形式（tarot-プレフィックス）を修正
  if (tarot.icon && tarot.icon.includes('/uploads/tarot-')) {
    const correctedIcon = tarot.icon.replace('/uploads/tarot-', '/uploads/');
    tarot.icon = correctedIcon;
    // データベースも更新
    TarotRepository.update(tarot.id, { icon: correctedIcon });
  }

  const rarities = RarityRepository.list();
  res.render('tarots/edit', { tarot, rarities });
});

// 更新
router.put('/:id', upload.single('icon'), (req, res) => {
  try {
    const input: TarotUpdateInput = {
      name: req.body.name,
      rarityId: req.body.rarityId,
      equipmentSkill: req.body.equipmentSkill || '',
      additionalSkill: req.body.additionalSkill || '',
      description: req.body.description || '',
      acquisitionMethods: Array.isArray(req.body.acquisitionMethods) 
        ? req.body.acquisitionMethods 
        : req.body.acquisitionMethods ? [req.body.acquisitionMethods] : []
    };

    // アイコン削除フラグが設定されている場合
    if (req.body.iconClear === 'true') {
      input.icon = '';
      
      // 古いアイコンを削除
      const currentTarot = TarotRepository.findById(req.params.id);
      if (currentTarot?.icon) {
        const oldIconPath = path.join(process.cwd(), '../..', currentTarot.icon);
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
        }
      }
    }
    // 新しいアイコンがアップロードされた場合
    else if (req.file) {
      console.log('タロット更新 - ファイル詳細:');
      console.log('  - オリジナル名:', req.file.originalname);
      console.log('  - 保存名:', req.file.filename);
      console.log('  - 保存パス:', req.file.path);
      console.log('  - ファイルサイズ:', req.file.size);
      console.log('  - MIMEタイプ:', req.file.mimetype);
      
      // ファイルが実際に存在するかチェック
      const filePath = path.join(process.cwd(), '../../uploads', req.file.filename);
      console.log('  - 絶対パス:', filePath);
      console.log('  - ファイル存在:', fs.existsSync(filePath));
      
      input.icon = `/uploads/${req.file.filename}`;
      
      // 古いアイコンを削除
      const currentTarot = TarotRepository.findById(req.params.id);
      if (currentTarot?.icon) {
        const oldIconPath = path.join(process.cwd(), '../..', currentTarot.icon);
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
        }
      }
    }

    const updated = TarotRepository.update(req.params.id, input);
    if (!updated) {
      return res.status(404).send('タロットが見つかりません');
    }

    res.redirect('/tarots');
  } catch (error) {
    res.status(500).send('タロットの更新に失敗しました');
  }
});

// 削除
router.delete('/:id', (req, res) => {
  try {
    const tarot = TarotRepository.findById(req.params.id);
    if (!tarot) {
      return res.status(404).send('タロットが見つかりません');
    }

    // アイコンファイルを削除
    if (tarot.icon) {
      const iconPath = path.join(process.cwd(), '../..', tarot.icon);
      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
      }
    }

    TarotRepository.delete(req.params.id);
    res.redirect('/tarots');
  } catch (error) {
    res.status(500).send('タロットの削除に失敗しました');
  }
});

export default router; 