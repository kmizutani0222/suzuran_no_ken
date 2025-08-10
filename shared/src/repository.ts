import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { Character, CharacterCreateInput, CharacterUpdateInput, Rarity, RarityCreateInput, RarityUpdateInput, Role, RoleCreateInput, RoleUpdateInput, Faction, FactionCreateInput, FactionUpdateInput, Skill, SkillCreateInput, SkillUpdateInput, SkillEffect, SkillEffectCreateInput, SkillEffectUpdateInput, PersonalitySkill, PersonalitySkillCreateInput, PersonalitySkillUpdateInput, AdminUser, AdminUserCreateInput, AdminUserUpdateInput, ExSkill, ExSkillCreateInput, ExSkillUpdateInput } from "./models";

const DATA_DIR = join(process.cwd(), "../data");
const CHARACTER_FILE = join(DATA_DIR, "characters.json");
const RARITY_FILE = join(DATA_DIR, "rarities.json");
const ROLE_FILE = join(DATA_DIR, "roles.json");
const FACTION_FILE = join(DATA_DIR, "factions.json");
const SKILL_FILE = join(DATA_DIR, "skills.json");
const SKILL_EFFECT_FILE = join(DATA_DIR, "skill_effects.json");
const PERSONALITY_SKILL_FILE = join(DATA_DIR, "personality_skills.json");
const ADMIN_USER_FILE = join(DATA_DIR, "admin_users.json");
const EX_SKILL_FILE = join(DATA_DIR, "ex_skills.json");

function ensureDirExists(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function ensureFileExists(filePath: string, defaultJson: string = "[]"): void {
  ensureDirExists(dirname(filePath));
  if (!existsSync(filePath)) {
    writeFileSync(filePath, defaultJson);
  }
}

function readJson<T>(filePath: string): T {
  ensureFileExists(filePath);
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function writeJson<T>(filePath: string, value: T): void {
  ensureFileExists(filePath);
  writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Characters
function readAllCharacters(): Character[] {
  return readJson<Character[]>(CHARACTER_FILE);
}
function writeAllCharacters(chars: Character[]): void {
  writeJson(CHARACTER_FILE, chars);
}

export const CharacterRepository = {
  list(): Character[] {
    return readAllCharacters();
  },
  findById(id: string): Character | undefined {
    return readAllCharacters().find((c) => c.id === id);
  },
  search(query: Partial<Pick<Character, "name" | "rarityId" | "roleId" | "weaponType">> & { factionId?: string }): Character[] {
    const { name, rarityId, roleId, weaponType, factionId } = query;
    return readAllCharacters().filter((c) => {
      if (name && !c.name.toLowerCase().includes(name.toLowerCase())) return false;
      if (rarityId && c.rarityId !== rarityId) return false;
      if (roleId && c.roleId !== roleId) return false;
      if (weaponType && c.weaponType !== weaponType) return false;
      if (factionId && !c.factionIds.includes(factionId)) return false;
      return true;
    });
  },
  create(input: CharacterCreateInput): Character {
    const all = readAllCharacters();
    const created: Character = { id: generateId(), ...input } as Character;
    all.push(created);
    writeAllCharacters(all);
    return created;
  },
  update(id: string, input: CharacterUpdateInput): Character | undefined {
    const all = readAllCharacters();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const updated: Character = { ...all[idx], ...input, id } as Character;
    all[idx] = updated;
    writeAllCharacters(all);
    return updated;
  },
  delete(id: string): boolean {
    const all = readAllCharacters();
    const next = all.filter((c) => c.id !== id);
    const changed = next.length !== all.length;
    if (changed) writeAllCharacters(next);
    return changed;
  },
};

// Rarities
function readAllRarities(): Rarity[] {
  return readJson<Rarity[]>(RARITY_FILE);
}
function writeAllRarities(values: Rarity[]): void {
  writeJson(RARITY_FILE, values);
}
export const RarityRepository = {
  list(): Rarity[] { return readAllRarities(); },
  findById(id: string): Rarity | undefined { return readAllRarities().find(v => v.id === id); },
  create(input: RarityCreateInput): Rarity {
    const all = readAllRarities();
    const created: Rarity = { id: generateId(), ...input } as Rarity;
    all.push(created);
    writeAllRarities(all);
    return created;
  },
  update(id: string, input: RarityUpdateInput): Rarity | undefined {
    const all = readAllRarities();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return undefined;
    const updated: Rarity = { ...all[idx], ...input, id } as Rarity;
    all[idx] = updated;
    writeAllRarities(all);
    return updated;
  },
  delete(id: string): boolean {
    const all = readAllRarities();
    const next = all.filter(v => v.id !== id);
    const changed = next.length !== all.length;
    if (changed) writeAllRarities(next);
    return changed;
  }
};

// Roles
function readAllRoles(): Role[] { return readJson<Role[]>(ROLE_FILE); }
function writeAllRoles(values: Role[]): void { writeJson(ROLE_FILE, values); }
export const RoleRepository = {
  list(): Role[] { return readAllRoles(); },
  findById(id: string): Role | undefined { return readAllRoles().find(v => v.id === id); },
  create(input: RoleCreateInput): Role {
    const all = readAllRoles();
    const created: Role = { id: generateId(), ...input } as Role;
    all.push(created);
    writeAllRoles(all);
    return created;
  },
  update(id: string, input: RoleUpdateInput): Role | undefined {
    const all = readAllRoles();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return undefined;
    const updated: Role = { ...all[idx], ...input, id } as Role;
    all[idx] = updated;
    writeAllRoles(all);
    return updated;
  },
  delete(id: string): boolean {
    const all = readAllRoles();
    const next = all.filter(v => v.id !== id);
    const changed = next.length !== all.length;
    if (changed) writeAllRoles(next);
    return changed;
  }
};

// Factions
function readAllFactions(): Faction[] { return readJson<Faction[]>(FACTION_FILE); }
function writeAllFactions(values: Faction[]): void { writeJson(FACTION_FILE, values); }
export const FactionRepository = {
  list(): Faction[] { return readAllFactions(); },
  findById(id: string): Faction | undefined { return readAllFactions().find(v => v.id === id); },
  create(input: FactionCreateInput): Faction {
    const all = readAllFactions();
    const created: Faction = { id: generateId(), ...input } as Faction;
    all.push(created);
    writeAllFactions(all);
    return created;
  },
  update(id: string, input: FactionUpdateInput): Faction | undefined {
    const all = readAllFactions();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return undefined;
    const updated: Faction = { ...all[idx], ...input, id } as Faction;
    all[idx] = updated;
    writeAllFactions(all);
    return updated;
  },
  delete(id: string): boolean {
    const all = readAllFactions();
    const next = all.filter(v => v.id !== id);
    const changed = next.length !== all.length;
    if (changed) writeAllFactions(next);
    return changed;
  }
};

// Skills
function readAllSkills(): Skill[] { return readJson<Skill[]>(SKILL_FILE); }
function writeAllSkills(values: Skill[]): void { writeJson(SKILL_FILE, values); }
export const SkillRepository = {
  list(): Skill[] { return readAllSkills(); },
  findById(id: string): Skill | undefined { return readAllSkills().find(v => v.id === id); },
  create(input: SkillCreateInput): Skill {
    const all = readAllSkills();
    const created: Skill = { id: generateId(), ...input } as Skill;
    all.push(created);
    writeAllSkills(all);
    return created;
  },
  update(id: string, input: SkillUpdateInput): Skill | undefined {
    const all = readAllSkills();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return undefined;
    const updated: Skill = { ...all[idx], ...input, id } as Skill;
    all[idx] = updated;
    writeAllSkills(all);
    return updated;
  },
  delete(id: string): boolean {
    const all = readAllSkills();
    const next = all.filter(v => v.id !== id);
    const changed = next.length !== all.length;
    if (changed) writeAllSkills(next);
    return changed;
  }
};

// Skill Effects
function readAllSkillEffects(): SkillEffect[] { return readJson<SkillEffect[]>(SKILL_EFFECT_FILE); }
function writeAllSkillEffects(values: SkillEffect[]): void { writeJson(SKILL_EFFECT_FILE, values); }
export const SkillEffectRepository = {
  list(): SkillEffect[] { return readAllSkillEffects(); },
  findById(id: string): SkillEffect | undefined { return readAllSkillEffects().find(v => v.id === id); },
  create(input: SkillEffectCreateInput): SkillEffect {
    const all = readAllSkillEffects();
    const created: SkillEffect = { id: generateId(), ...input } as SkillEffect;
    all.push(created);
    writeAllSkillEffects(all);
    return created;
  },
  update(id: string, input: SkillEffectUpdateInput): SkillEffect | undefined {
    const all = readAllSkillEffects();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return undefined;
    const updated: SkillEffect = { ...all[idx], ...input, id } as SkillEffect;
    all[idx] = updated;
    writeAllSkillEffects(all);
    return updated;
  },
  delete(id: string): boolean {
    const all = readAllSkillEffects();
    const next = all.filter(v => v.id !== id);
    const changed = next.length !== all.length;
    if (changed) writeAllSkillEffects(next);
    return changed;
  }
};

// PersonalitySkills
function readAllPersonalitySkills(): PersonalitySkill[] { return readJson<PersonalitySkill[]>(PERSONALITY_SKILL_FILE); }
function writeAllPersonalitySkills(values: PersonalitySkill[]): void { writeJson(PERSONALITY_SKILL_FILE, values); }

export const PersonalitySkillRepository = {
  list(): PersonalitySkill[] { return readAllPersonalitySkills(); },
  findById(id: string): PersonalitySkill | undefined { return readAllPersonalitySkills().find(ps => ps.id === id); },
  create(input: PersonalitySkillCreateInput): PersonalitySkill {
    const all = readAllPersonalitySkills();
    const created: PersonalitySkill = { id: generateId(), ...input } as PersonalitySkill;
    all.push(created);
    writeAllPersonalitySkills(all);
    return created;
  },
  update(id: string, input: PersonalitySkillUpdateInput): PersonalitySkill | undefined {
    const all = readAllPersonalitySkills();
    const idx = all.findIndex(ps => ps.id === id);
    if (idx === -1) return undefined;
    const updated: PersonalitySkill = { ...all[idx], ...input, id } as PersonalitySkill;
    all[idx] = updated;
    writeAllPersonalitySkills(all);
    return updated;
  },
  delete(id: string): boolean {
    const all = readAllPersonalitySkills();
    const next = all.filter(ps => ps.id !== id);
    const changed = next.length !== all.length;
    if (changed) writeAllPersonalitySkills(next);
    return changed;
  }
};

// Ex Skills
function readAllExSkills(): ExSkill[] { return readJson<ExSkill[]>(EX_SKILL_FILE); }
function writeAllExSkills(values: ExSkill[]): void { writeJson(EX_SKILL_FILE, values); }

export const ExSkillRepository = {
  list(): ExSkill[] { return readAllExSkills(); },
  findById(id: string): ExSkill | undefined { return readAllExSkills().find(es => es.id === id); },
  create(input: ExSkillCreateInput): ExSkill {
    const all = readAllExSkills();
    const created: ExSkill = { id: generateId(), ...input } as ExSkill;
    all.push(created);
    writeAllExSkills(all);
    return created;
  },
  update(id: string, input: ExSkillUpdateInput): ExSkill | undefined {
    const all = readAllExSkills();
    const idx = all.findIndex(es => es.id === id);
    if (idx === -1) return undefined;
    const updated: ExSkill = { ...all[idx], ...input, id } as ExSkill;
    all[idx] = updated;
    writeAllExSkills(all);
    return updated;
  },
  delete(id: string): boolean {
    const all = readAllExSkills();
    const next = all.filter(es => es.id !== id);
    const changed = next.length !== all.length;
    if (changed) writeAllExSkills(next);
    return changed;
  }
};

// Admin Users
function readAllAdminUsers(): AdminUser[] { return readJson<AdminUser[]>(ADMIN_USER_FILE); }
function writeAllAdminUsers(values: AdminUser[]): void { writeJson(ADMIN_USER_FILE, values); }
export const AdminUserRepository = {
  list(): AdminUser[] { return readAllAdminUsers(); },
  findById(id: string): AdminUser | undefined { return readAllAdminUsers().find(u => u.id === id); },
  findByUsername(username: string): AdminUser | undefined { return readAllAdminUsers().find(u => u.username === username); },
  create(input: AdminUserCreateInput): AdminUser {
    const all = readAllAdminUsers();
    const created: AdminUser = { id: generateId(), ...input } as AdminUser;
    all.push(created);
    writeAllAdminUsers(all);
    return created;
  },
  update(id: string, input: AdminUserUpdateInput): AdminUser | undefined {
    const all = readAllAdminUsers();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) return undefined;
    const updated: AdminUser = { ...all[idx], ...input, id } as AdminUser;
    all[idx] = updated;
    writeAllAdminUsers(all);
    return updated;
  },
  delete(id: string): boolean {
    const all = readAllAdminUsers();
    const next = all.filter(v => v.id !== id);
    const changed = next.length !== all.length;
    if (changed) writeAllAdminUsers(next);
    return changed;
  }
};

export function ensureDefaultAdminUser(username: string, passwordHash: string): void {
  const all = readAllAdminUsers();
  if (!all.some(u => u.username === username)) {
    const created: AdminUser = { id: generateId(), username, passwordHash } as AdminUser;
    all.push(created);
    writeAllAdminUsers(all);
  }
} 