import { Router } from "express";
import path from "path";
import { CharacterRepository, RarityRepository, RoleRepository, FactionRepository, SkillRepository } from "../../../shared/src/repository";

export const router = Router();

router.get("/", (req, res) => {
  const { name, rarityId, roleId, weaponType } = req.query as Record<string, string | undefined>;
  
  // 検索条件を構築
  const characters = CharacterRepository.list();
  let results = characters;
  
  if (name) {
    results = results.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (rarityId) {
    results = results.filter(c => c.rarityId === rarityId);
  }
  if (roleId) {
    results = results.filter(c => c.roleId === roleId);
  }
  if (weaponType) {
    results = results.filter(c => c.weaponType === weaponType);
  }
  
  // 検索結果に関連データを追加
  const resultsWithData = results.map(character => ({
    ...character,
    rarity: RarityRepository.findById(character.rarityId),
    role: RoleRepository.findById(character.roleId)
  }));
  
  const rarities = RarityRepository.list();
  const roles = RoleRepository.list();
  
  res.render(path.join("characters", "search"), { 
    results: resultsWithData, 
    filters: { name, rarityId, roleId, weaponType },
    rarities,
    roles
  });
});

router.get("/:id", (req, res) => {
  const character = CharacterRepository.findById(req.params.id);
  if (!character) return res.status(404).send("Not Found");
  
  // 関連データを取得
  const rarity = RarityRepository.findById(character.rarityId);
  const role = RoleRepository.findById(character.roleId);
  const factions = character.factionIds.map(id => FactionRepository.findById(id)).filter(Boolean);
  const personalitySkill = character.personalitySkillId ? SkillRepository.findById(character.personalitySkillId) : null;
  
  // スキルツリーのスキル情報を取得
  const skillIds = new Set<string>();
  if (character.skillTree) {
    Object.values(character.skillTree).forEach(node => {
      if (node?.left) skillIds.add(node.left);
      if (node?.right) skillIds.add(node.right);
    });
  }
  const skills = Array.from(skillIds).map(id => SkillRepository.findById(id)).filter(Boolean);
  
  // EXスキル情報を取得
  const exSkills = (character.exSkillIds || []).map(id => SkillRepository.findById(id)).filter(Boolean);
  
  // 表示用のオブジェクトを構築
  const c = {
    ...character,
    rarity,
    role,
    factions,
    personalitySkill,
    skills,
    exSkills
  };
  
  res.render(path.join("characters", "detail"), { c });
}); 