import { Router } from "express";
import path from "path";
import { CharacterRepository, RarityRepository, RoleRepository, FactionRepository, SkillRepository } from "../../../shared/src/repository";
import { CharacterCreateInput, CharacterUpdateInput } from "../../../shared/src/models";
import { WeaponType } from "../../../shared/src/models";
import { upload } from "../middleware/upload";

export const router = Router();

function categorizeSkills() {
  const all = SkillRepository.list();
  const personality = all.filter((s) => s.skillCategory === "個性");
  const normal = all.filter((s) => s.skillCategory === "通常");
  const ex = all.filter((s) => s.skillCategory === "EX");
  return { personality, normal, ex };
}

router.get("/", (_req, res) => {
  const characters = CharacterRepository.list();
  res.render(path.join("characters", "index"), { characters });
});

router.get("/new", (_req, res) => {
  const rarities = RarityRepository.list();
  const roles = RoleRepository.list();
  const factions = FactionRepository.list();
  const { personality, normal, ex } = categorizeSkills();
  res.render(path.join("characters", "new"), { rarities, roles, factions, personalitySkills: personality, normalSkills: normal, exSkills: ex });
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
    ...(files.normalAppearance?.[0] ? { normalAppearance: files.normalAppearance[0].path.replace(/\\/g, '/') } : {}),
    ...(files.pixelAvatar?.[0] ? { pixelAvatar: files.pixelAvatar[0].path.replace(/\\/g, '/') } : {}),
  };

  CharacterRepository.create(input);
  res.redirect("/characters");
});

router.get("/:id/edit", (req, res) => {
  const character = CharacterRepository.findById(req.params.id);
  if (!character) return res.status(404).send("Not Found");
  const rarities = RarityRepository.list();
  const roles = RoleRepository.list();
  const factions = FactionRepository.list();
  const { personality, normal, ex } = categorizeSkills();
  res.render(path.join("characters", "edit"), { character, rarities, roles, factions, personalitySkills: personality, normalSkills: normal, exSkills: ex });
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
    ...(files.normalAppearance?.[0] ? { normalAppearance: files.normalAppearance[0].path.replace(/\\/g, '/') } : {}),
    ...(files.pixelAvatar?.[0] ? { pixelAvatar: files.pixelAvatar[0].path.replace(/\\/g, '/') } : {}),
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