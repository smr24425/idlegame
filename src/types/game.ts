export type PetEffectType = 'goldGain' | 'expGain' | 'dropRate' | 'healthPercentage' | 'attackPercentage' | 'defensePercentage';

export interface PetCombatSkill {
  type: 'heal';
  triggerTurn: number;
  triggerCondition: 'boss';
  basePercent: number;
  levelPercent: number;
}

export interface PetConfig {
  id: string;
  name: string;
  effectType: PetEffectType | PetEffectType[];
  baseValue: number;
  passiveType: 'healthPercentage' | 'attackPercentage' | 'defensePercentage';
  passiveBaseValue: number;
  description: string;
  rarity: 'R' | 'SR' | 'SSR';
  combatSkill?: PetCombatSkill;
}

export interface PlayerPet {
  configId: string;
  level: number;
  duplicates: number;
}

export type ArtifactEffectType =
  | 'enhanceCostReduction'
  | 'baseAttack'
  | 'baseDefense'
  | 'baseHealth'
  | 'critDamage'
  | 'critRate'
  | 'expGain'
  | 'goldGain'
  | 'attackGreaterThanDefenseCritDmg'
  | 'upgradeStoneDropRate'
  | 'lowHealthDefense'
  | 'gachaCostReduction'
  | 'petStoneDropRate'
  | 'highLevelBossDamage'
  | 'turnHealthRegen'
  | 'defenseUpHealthDown'
  | 'dodgeRate'
  | 'halfHealthAttackUp'
  | 'hpToDefense'
  | 'bossHighRarityDrop'
  | 'dodgeDamageBoost'
  | 'totalHealthMultiplier'
  | 'doubleAttackChance'
  | 'goldToAttack'
  | 'damageReflect'
  | 'finalDamageMultiplier'
  | 'gachaHighRarityBoost'
  | 'highHealthAttackUp'
  | 'enhanceSlotBonusIncrease';

export interface ArtifactConfig {
  id: string;
  name: string;
  effectType: ArtifactEffectType;
  baseValue: number;
  description: string;
  rarity: 'R' | 'SR' | 'SSR';
  passiveType?: 'attackPercentage' | 'healthPercentage' | 'defensePercentage';
  passiveBaseValue?: number;
  levelGrowth?: number;
}

export interface PlayerArtifact {
  configId: string;
  level: number;
  fragments: number;
}

export interface Player {
  level: number;
  exp: number;
  expToNext: number;
  money: number;
  diamonds: number;
  pets: Record<string, PlayerPet>;
  equippedPetId: string | null;
  petSlotLevel: number;
  petGachaPity: number;
  artifacts: Record<string, PlayerArtifact>;
  equippedArtifactIds: string[];
  stage: number;
  rebirths: number;
  attributes: {
    health: number; // 生命加成，影響最大生命
    attack: number; // 攻擊力
    critRate: number; // 暴擊率 (0~1)
    critDamage: number; // 暴擊額外傷害百分比 (例如 0.1 = +10%)
    defense: number; // 防禦，直接扣在對方傷害上
  };
  availablePoints: number;
  health: number;
  maxHealth: number;
  equipment: {
    weapon: Equipment | null;
    armor: Equipment | null;
    pants: Equipment | null;
    gloves: Equipment | null;
    ring: Equipment | null;
    necklace: Equipment | null;
  };
  slotLevels: {
    weapon: number;
    armor: number;
    pants: number;
    gloves: number;
    ring: number;
    necklace: number;
  };
  megaPet: {
    unlocked: boolean;
    level: number;
    slots: Array<{ type: string | null }>;
  };
}

export type Rarity = 'white' | 'green' | 'blue' | 'purple' | 'gold' | 'red';

export interface Equipment {
  id: string;
  type: 'weapon' | 'armor' | 'pants' | 'gloves' | 'ring' | 'necklace';
  rarity: Rarity;
  level: number;
  stats: {
    health?: number;
    attack?: number;
    critRate?: number;
    critDamage?: number;
    defense?: number;
  };
  mainStat?: { key: keyof Equipment['stats']; value: number };
  subStats?: Array<{ key: keyof Equipment['stats']; value: number }>;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'material';
  quantity: number;
}

export interface Boss {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
}

export interface GameState {
  player: Player;
  currentBoss: Boss | null;
  isFighting: boolean;
  fightLog: string[];
  lastCollectTime: number;
  inventory: {
    equipment: Equipment[];
    items: Item[];
  };
}

export interface CombatResult {
  winner: 'player' | 'boss' | 'continue';
  damageDealt: number;
}