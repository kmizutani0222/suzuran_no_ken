const fs = require('fs');
const path = require('path');

// データファイルのパス
const dataDir = path.join(process.cwd(), '..', '..', 'data');
const skillEffectsFile = path.join(dataDir, 'skill_effects.json');

// 既存のデータを読み込み
function readSkillEffects() {
  try {
    if (fs.existsSync(skillEffectsFile)) {
      const data = fs.readFileSync(skillEffectsFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('データファイルの読み込みエラー:', error);
    return [];
  }
}

// データを保存
function writeSkillEffects(data) {
  try {
    fs.writeFileSync(skillEffectsFile, JSON.stringify(data, null, 2));
    console.log('データを保存しました');
  } catch (error) {
    console.error('データファイルの保存エラー:', error);
  }
}

// メイン処理
function migrateSkillEffects() {
  console.log('スキル効果データの移行を開始します...');
  
  const skillEffects = readSkillEffects();
  
  if (skillEffects.length === 0) {
    console.log('移行するデータがありません');
    return;
  }
  
  let updated = false;
  
  skillEffects.forEach(effect => {
    if (!effect.category) {
      effect.category = 'その他'; // デフォルトカテゴリー
      updated = true;
      console.log(`スキル効果 "${effect.name}" にカテゴリー "その他" を設定しました`);
    }
  });
  
  if (updated) {
    writeSkillEffects(skillEffects);
    console.log('移行が完了しました');
  } else {
    console.log('移行は不要です');
  }
}

// スクリプトを実行
if (require.main === module) {
  migrateSkillEffects();
}

module.exports = { migrateSkillEffects }; 