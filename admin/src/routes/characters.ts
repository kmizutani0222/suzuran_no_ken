import { Router } from "express";
import path from "path";
import { CharacterRepository, RarityRepository, RoleRepository, FactionRepository, SkillRepository, PersonalitySkillRepository } from "../../../shared/src/repository";
import { CharacterCreateInput, CharacterUpdateInput } from "../../../shared/src/models";
import { WeaponType } from "../../../shared/src/models";
import { upload, toPublicPath } from "../middleware/upload";

export const router = Router();

router.get("/", (_req, res) => {
  const characters = CharacterRepository.list();
  
  // レアリティと陣営のデータを取得
  const rarities = RarityRepository.list();
  const factions = FactionRepository.list();
  
  // キャラクターにレアリティと陣営の情報を追加
  const charactersWithDetails = characters.map(character => {
    const rarity = rarities.find(r => r.id === character.rarityId);
    
    // 陣営は指定された6つの陣営のうち1つだけを表示
    const priorityFactions = ['鈴蘭の剣', 'イリヤ', '騎士連合', '法皇国', 'ウィルダ', '漂泊者'];
    let displayFaction = null;
    
    if (character.factionIds && character.factionIds.length > 0) {
      // 優先順位の高い陣営から順にチェック
      for (const factionName of priorityFactions) {
        const faction = factions.find(f => f.name === factionName);
        if (faction && character.factionIds.includes(faction.id)) {
          displayFaction = faction;
          break;
        }
      }
      
      // 優先陣営が見つからない場合は、最初の陣営を表示
      if (!displayFaction) {
        const firstFaction = factions.find(f => character.factionIds.includes(f.id));
        if (firstFaction) {
          displayFaction = firstFaction;
        }
      }
    }
    
    return {
      ...character,
      rarity,
      faction: displayFaction
    };
  });
  
  res.render(path.join("characters", "index"), { characters: charactersWithDetails });
});

router.get("/new", async (req, res) => {
  try {
    const rarities = await RarityRepository.list();
    const roles = await RoleRepository.list();
    const factions = await FactionRepository.list();
    const allSkills = await SkillRepository.list();
    const personalitySkills = await PersonalitySkillRepository.list();
    
    // スキルを個性、通常、EXに分類（skillCategoryが削除されたため、PersonalitySkillを使用）
    const normal = allSkills.filter((s) => !personalitySkills.find(ps => ps.id === s.id));
    // EXスキルは個性スキルと通常スキル以外のものとして扱う
    const ex = allSkills.filter((s) => s.skillType === "アクティブ" || s.skillType === "即時");

    res.render("characters/new", {
      rarities,
      roles,
      factions,
      personalitySkills,
      normalSkills: normal,
      exSkills: ex,
    });
  } catch (error) {
    console.error("キャラクター新規作成画面表示エラー:", error);
    res.status(500).send("画面表示に失敗しました");
  }
});

router.post("/", upload.fields([
  { name: 'normalAppearance', maxCount: 1 },
  { name: 'pixelAvatar', maxCount: 1 }
]), (req, res) => {
  const body = req.body as any;
  const files = req.files as any;
  const factionIds: string[] = Array.isArray(body.factionIds) ? body.factionIds : (body.factionIds ? [body.factionIds] : []);
  const exSkillIds: string[] = Array.isArray(body.exSkillIds) ? body.exSkillIds : (body.exSkillIds ? [body.exSkillIds] : []);

  const buildNode = (rk: string) => {
    const left = body[`${rk}_left`];
    const right = body[`${rk}_right`];
    const node: any = {};
    if (left) node.left = left;
    if (right) node.right = right;
    return Object.keys(node).length ? node : undefined;
  };

  const potentialTree: any = {
    RK1: buildNode("RK1"),
    RK3: buildNode("RK3"),
    RK5: buildNode("RK5"),
    RK7: buildNode("RK7"),
    RK9: buildNode("RK9"),
    RK11: buildNode("RK11"),
  };
  const skillTree = Object.fromEntries(Object.entries(potentialTree).filter(([, v]) => v));

  const input: CharacterCreateInput = {
    name: body.name,
    rarityId: body.rarityId,
    roleId: body.roleId,
    factionIds,
    weaponType: body.weaponType as WeaponType,
    ...(body.personalitySkillId ? { personalitySkillId: body.personalitySkillId } : {}),
    ...(Object.keys(skillTree).length ? { skillTree: skillTree as any } : {}),
    ...(exSkillIds.length ? { exSkillIds } : {}),
    ...(files.normalAppearance?.[0] ? { normalAppearance: toPublicPath(files.normalAppearance[0].filename) } : {}),
    ...(files.pixelAvatar?.[0] ? { pixelAvatar: toPublicPath(files.pixelAvatar[0].filename) } : {}),
  };

  CharacterRepository.create(input);
  res.redirect("/characters");
});

router.get("/:id/edit", async (req, res) => {
  try {
    const character = await CharacterRepository.findById(req.params.id!);
    if (!character) {
      return res.status(404).send("キャラクターが見つかりません");
    }

    const rarities = await RarityRepository.list();
    const roles = await RoleRepository.list();
    const factions = await FactionRepository.list();
    const allSkills = await SkillRepository.list();
    const personalitySkills = await PersonalitySkillRepository.list();
    
    // スキルを個性、通常、EXに分類
    const normal = allSkills.filter((s) => !personalitySkills.find(ps => ps.id === s.id));
    const ex = allSkills.filter((s) => s.skillType === "アクティブ" || s.skillType === "即時");

    res.render("characters/edit", {
      character,
      rarities,
      roles,
      factions,
      personalitySkills,
      normalSkills: normal,
      exSkills: ex,
    });
  } catch (error) {
    console.error("キャラクター編集画面表示エラー:", error);
    res.status(500).send("画面表示に失敗しました");
  }
});

router.post("/:id", upload.fields([
  { name: 'normalAppearance', maxCount: 1 },
  { name: 'pixelAvatar', maxCount: 1 }
]), (req, res) => {
  const body = req.body as any;
  const files = req.files as any;
  const factionIds: string[] = Array.isArray(body.factionIds) ? body.factionIds : (body.factionIds ? [body.factionIds] : []);
  const exSkillIds: string[] = Array.isArray(body.exSkillIds) ? body.exSkillIds : (body.exSkillIds ? [body.exSkillIds] : []);

  const buildNode = (rk: string) => {
    const left = body[`${rk}_left`];
    const right = body[`${rk}_right`];
    const node: any = {};
    if (left) node.left = left;
    if (right) node.right = right;
    return Object.keys(node).length ? node : undefined;
  };

  const potentialTree: any = {
    RK1: buildNode("RK1"),
    RK3: buildNode("RK3"),
    RK5: buildNode("RK5"),
    RK7: buildNode("RK7"),
    RK9: buildNode("RK9"),
    RK11: buildNode("RK11"),
  };
  const skillTree = Object.fromEntries(Object.entries(potentialTree).filter(([, v]) => v));

  const input: CharacterUpdateInput = {
    ...(body.name ? { name: body.name } : {}),
    ...(body.rarityId ? { rarityId: body.rarityId } : {}),
    ...(body.roleId ? { roleId: body.roleId } : {}),
    ...(factionIds.length ? { factionIds } : {}),
    ...(body.weaponType ? { weaponType: body.weaponType as WeaponType } : {}),
    ...(body.personalitySkillId ? { personalitySkillId: body.personalitySkillId } : {}),
    ...(Object.keys(skillTree).length ? { skillTree: skillTree as any } : {}),
    ...(exSkillIds.length ? { exSkillIds } : {}),
    ...(files.normalAppearance?.[0] ? { normalAppearance: toPublicPath(files.normalAppearance[0].filename) } : {}),
    ...(files.pixelAvatar?.[0] ? { pixelAvatar: toPublicPath(files.pixelAvatar[0].filename) } : {}),
  };

  if (!req.params.id) {
    return res.status(400).send("ID is required");
  }
  CharacterRepository.update(req.params.id, input);
  res.redirect("/characters");
});

router.post("/:id/delete", (req, res) => {
  CharacterRepository.delete(req.params.id);
  res.redirect("/characters");
}); 