const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// データファイルのパス
const dataDir = path.join(process.cwd(), '..', '..', 'data');
const adminUsersFile = path.join(dataDir, 'admin_users.json');

// 既存のデータを読み込み
function readAdminUsers() {
  try {
    if (fs.existsSync(adminUsersFile)) {
      const data = fs.readFileSync(adminUsersFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('データファイルの読み込みエラー:', error);
    return [];
  }
}

// データを保存
function writeAdminUsers(data) {
  try {
    fs.writeFileSync(adminUsersFile, JSON.stringify(data, null, 2));
    console.log('データを保存しました');
  } catch (error) {
    console.error('データファイルの保存エラー:', error);
  }
}

// メイン処理
async function migrateAdminUsers() {
  console.log('AdminUserデータの移行を開始します...');
  
  const adminUsers = readAdminUsers();
  
  if (adminUsers.length === 0) {
    console.log('移行するデータがありません');
    return;
  }
  
  let updated = false;
  
  for (const user of adminUsers) {
    // パスワードがハッシュ化されていない場合、ハッシュ化する
    if (user.password && !user.passwordHash) {
      try {
        const saltRounds = 10;
        user.passwordHash = await bcrypt.hash(user.password, saltRounds);
        delete user.password; // 平文パスワードを削除
        updated = true;
        console.log(`ユーザー "${user.username}" のパスワードをハッシュ化しました`);
      } catch (error) {
        console.error(`ユーザー "${user.username}" のパスワードハッシュ化エラー:`, error);
      }
    }
  }
  
  if (updated) {
    writeAdminUsers(adminUsers);
    console.log('移行が完了しました');
  } else {
    console.log('移行は不要です');
  }
}

// スクリプトを実行
if (require.main === module) {
  migrateAdminUsers().catch(console.error);
}

module.exports = { migrateAdminUsers }; 