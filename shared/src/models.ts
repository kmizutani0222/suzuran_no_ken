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

export type SkillTarget = "対ユニット" | "対地面" | "近接" | "範囲攻撃";
export type SkillType = "パッシブ" | "アクティブ" | "即時" | "オーラ" | "通常攻撃" | "リアクション";
export type SkillCategory = "個性" | "EX" | "通常";

export interface SkillEffect {
  id: string;
  name: string;
  description: string;
}

export interface SkillEffectCreateInput {
  name: string;
  description: string;
}

export interface SkillEffectUpdateInput extends Partial<SkillEffectCreateInput> {}

export interface Skill {
  id: string;
  name: string;
  icon?: string; // アップロード画像のパス
  cost: number;
  ct: number;
  description: string; // 複数行
  targets: SkillTarget[]; // 複数選択（旧types）
  skillType: SkillType; // 追加
  skillCategory: SkillCategory; // 追加
  range?: SkillRange; // 任意
  effectIds?: string[]; // SkillEffect 複数選択
}

export interface SkillCreateInput {
  name: string;
  icon?: string;
  cost: number;
  ct: number;
  description: string;
  targets: SkillTarget[];
  skillType: SkillType;
  skillCategory: SkillCategory;
  range?: SkillRange;
  effectIds?: string[];
}

export interface SkillUpdateInput extends Partial<SkillCreateInput> {}

export interface Rarity {
  id: string;
  name: string;
  image: string;
  value: number; // 数値で指定
}

export interface RarityCreateInput {
  name: string;
  image: string;
  value: number;
}

export interface RarityUpdateInput extends Partial<RarityCreateInput> {}

export type TerrainSuitability = "normal";

export interface Role {
  id: string;
  name: string;
  image: string;
  movementPower: number; // 移動力
  jumpHigh: number;      // ジャンプ高
  jumpLow: number;       // ジャンプ低
  terrainSuitability: TerrainSuitability; // 地形適正
}

export interface RoleCreateInput {
  name: string;
  image: string;
  movementPower: number;
  jumpHigh: number;
  jumpLow: number;
  terrainSuitability: TerrainSuitability;
}

export interface RoleUpdateInput extends Partial<RoleCreateInput> {}

export interface Faction {
  id: string;
  name: string;
  image: string;
}

export interface FactionCreateInput {
  name: string;
  image: string;
}

export interface FactionUpdateInput extends Partial<FactionCreateInput> {}

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
  rarityId: string; // Rarity
  roleId: string;   // Role
  factionIds: string[]; // 複数選択
  weaponType: WeaponType; // 武器種
  personalitySkillId?: string; // Skill(skillCategory: 個性)から単一
  skillTree?: CharacterSkillTree; // 各ランク左右に通常スキル
  exSkillIds?: string[]; // EXスキル複数
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