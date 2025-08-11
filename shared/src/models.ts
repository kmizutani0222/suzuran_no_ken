export type WeaponType = "剣" | "槍" | "斧" | "杖" | "弓";

export interface SkillRange {
  distanceFrom?: number;
  distanceTo?: number;
  heightDiffFrom?: number;
  heightDiffTo?: number;
  areaHeightDiffFrom?: number;
  areaHeightDiffTo?: number;
  image?: string; // アップロード画像のパス
}

export type SkillTarget = "単体" | "全体" | "自身";
export type SkillType = "パッシブ" | "アクティブ" | "即時" | "オーラ" | "通常攻撃" | "リアクション";

export type SkillEffectCategory = "バフ" | "デバフ" | "状態" | "地形・行動" | "スキル" | "ダメージ" | "その他";

export interface SkillEffect {
  id: string;
  name: string;
  description: string;
  category: SkillEffectCategory;
}

export interface SkillEffectCreateInput {
  name: string;
  description: string;
  category: SkillEffectCategory;
}

export interface SkillEffectUpdateInput extends Partial<SkillEffectCreateInput> {}

export interface Skill {
  id: string;
  name: string;
  icon?: string; // アップロード画像のパス
  cost?: number;
  ct?: number;
  description?: string; // 複数行（任意）
  targets: SkillTarget[]; // 複数選択（旧types）
  skillType?: SkillType; // 追加
  range?: SkillRange; // 任意
  effectIds?: string[]; // SkillEffect 複数選択
}

export interface SkillCreateInput {
  name: string;
  icon?: string;
  cost?: number;
  ct?: number;
  description?: string;
  targets: SkillTarget[];
  skillType?: SkillType;
  range?: SkillRange;
  effectIds?: string[];
}

export interface SkillUpdateInput extends Partial<SkillCreateInput> {}

// 個性スキルモデル
export interface PersonalitySkill {
  id: string;
  name: string;
  icon?: string; // アップロード画像のパス
  effectIds?: string[]; // SkillEffect 複数選択
  star1Description: string; // 星1の説明
  star2Description: string; // 星2の説明
  star3Description: string; // 星3の説明
  star4Description: string; // 星4の説明
  star5Description: string; // 星5の説明
}

export interface PersonalitySkillCreateInput {
  name: string;
  icon?: string;
  effectIds?: string[];
  star1Description: string;
  star2Description: string;
  star3Description: string;
  star4Description: string;
  star5Description: string;
}

export interface PersonalitySkillUpdateInput extends Partial<PersonalitySkillCreateInput> {}

// EXスキルモデル
export interface ExSkill {
  id: string;
  name: string;
  icon?: string; // アップロード画像のパス
  effectIds?: string[]; // SkillEffect 複数選択
  lv1Description: string; // Lv1の説明
  lv2Description: string; // Lv2の説明
  lv3Description: string; // Lv3の説明
}

export interface ExSkillCreateInput {
  name: string;
  icon?: string;
  effectIds?: string[];
  lv1Description: string;
  lv2Description: string;
  lv3Description: string;
}

export interface ExSkillUpdateInput extends Partial<ExSkillCreateInput> {}

export interface Rarity {
  id: string;
  name: string;
  image?: string;
  value: number; // 数値で指定
}

export interface RarityCreateInput {
  name: string;
  image?: string;
  icon?: string; // アップロードされたファイルのパス
  value: number;
}

export interface RarityUpdateInput extends Partial<RarityCreateInput> {
  image?: string;
}

export type TerrainSuitability = "normal";

export interface Role {
  id: string;
  name: string;
  image?: string;
  movementPower: number; // 移動力
  jumpHigh: number;      // ジャンプ高
  jumpLow: number;       // ジャンプ低
  terrainSuitability: TerrainSuitability; // 地形適正
}

export interface RoleCreateInput {
  name: string;
  image?: string;
  icon?: string; // アップロードされたファイルのパス
  movementPower: number;
  jumpHigh: number;
  jumpLow: number;
  terrainSuitability: TerrainSuitability;
}

export interface RoleUpdateInput extends Partial<RoleCreateInput> {
  image?: string;
}

export interface Faction {
  id: string;
  name: string;
  image?: string;
}

export interface FactionCreateInput {
  name: string;
  image?: string;
  icon?: string; // アップロードされたファイルのパス
}

export interface FactionUpdateInput extends Partial<FactionCreateInput> {
  image?: string;
}

export interface CharacterSkillTreeNode { left?: string; right?: string; }
export interface CharacterSkillTree {
  RK1?: CharacterSkillTreeNode;
  RK3?: CharacterSkillTreeNode;
  RK5?: CharacterSkillTreeNode;
  RK7?: CharacterSkillTreeNode;
  RK9?: CharacterSkillTreeNode;
  RK11?: CharacterSkillTreeNode;
}

export interface Character {
  id: string;
  name: string;
  rarityId?: string | null; // Rarity（任意）
  roleId?: string | null;   // Role（任意）
  factionIds: string[]; // 複数選択
  weaponType?: WeaponType | null; // 武器種（任意）
  personalitySkillId?: string | null; // PersonalitySkillから単一（任意）
  skillTree?: CharacterSkillTree | null; // 各ランク左右に通常スキル（任意）
  exSkillIds?: string[]; // EXスキル複数（任意）
  normalAppearance?: string | null; // 通常外見画像（任意）
  pixelAvatar?: string | null; // ピクセルアバター画像（任意）
}

export interface CharacterCreateInput extends Omit<Character, "id"> {}
export interface CharacterUpdateInput extends Partial<CharacterCreateInput> {}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
}

export interface AdminUserCreateInput {
  username: string;
  passwordHash: string;
}

export interface AdminUserUpdateInput extends Partial<AdminUserCreateInput> {} 

export interface Equipment {
  id: string;
  name: string;
  icon?: string | null;
  rarityId?: string | null;
  category?: 'weapon' | 'armor' | null;
  weaponType?: 'sword' | 'spear' | 'axe' | 'bow' | 'staff' | null;
  equipmentSkill?: string | null;
  description?: string | null;
  acquisitionMethod?: string | null; // カンマ区切りの文字列（例: "神兵試練１, 神兵試練２"）
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentCreateInput {
  name: string;
  icon?: string | null;
  rarityId?: string | null;
  category?: 'weapon' | 'armor' | null;
  weaponType?: 'sword' | 'spear' | 'axe' | 'bow' | 'staff' | null;
  equipmentSkill?: string | null;
  description?: string | null;
  acquisitionMethod?: string | null; // カンマ区切りの文字列
}

export interface EquipmentUpdateInput extends Partial<EquipmentCreateInput> {}

export interface EquipmentWithRarity extends Equipment {
  rarity: Rarity | null;
}

// タロットモデル
export type TarotAcquisitionMethod = 
  | "静寂の地-1" 
  | "静寂の地-2" 
  | "静寂の地-3" 
  | "期間限定イベントドロップ" 
  | "入手方法はありません";

export interface Tarot {
  id: string;
  name: string;
  rarityId: string; // Rarityから単一選択
  icon?: string; // アップロード画像のパス
  equipmentSkill?: string; // 複数行テキスト
  additionalSkill?: string; // 複数行テキスト
  description?: string; // 複数行テキスト
  acquisitionMethods: TarotAcquisitionMethod[]; // 複数選択
  createdAt: string;
  updatedAt: string;
}

export interface TarotCreateInput {
  name: string;
  rarityId: string;
  icon?: string;
  equipmentSkill?: string;
  additionalSkill?: string;
  description?: string;
  acquisitionMethods: TarotAcquisitionMethod[];
}

export interface TarotUpdateInput extends Partial<TarotCreateInput> {}

export interface TarotWithRarity extends Tarot {
  rarity: Rarity;
} 