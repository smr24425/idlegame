import { Player, Equipment, PetEffectType } from '../../types/game';
import { ARTIFACT_CONFIGS, PET_CONFIGS, MEGA_PET_STAT_BASE, MEGA_PET_STAT_GROWTH } from './config';


export const getArtifactUpgradeCost = (currentTier: number) => {
  if (currentTier >= 10) return -1;
  return 40 + (currentTier - 1) * 10;
};

export const getArtifactEffectValue = (player: Player, effectType: string) => {
  let totalValue = 0;
  if (!player || !player.equippedArtifactIds) return totalValue;

  player.equippedArtifactIds.forEach(id => {
    if (!id) return;
    const artifact = player.artifacts ? player.artifacts[id] : null;
    if (artifact) {
      const config = ARTIFACT_CONFIGS.find(c => c.id === id);
      if (config && config.effectType === effectType) {
        if (config.levelGrowth !== undefined) {
          totalValue += config.baseValue + (artifact.level - 1) * config.levelGrowth;
        } else {
          totalValue += config.baseValue * artifact.level;
        }
      }
    }
  });
  return totalValue;
};

export const getEnhancedStat = (eq: Equipment | null, slotLevel: number, statKey: keyof Equipment['stats'], player?: Player): number => {
  if (!eq || !eq.stats[statKey]) return 0;

  const artifactBonus = player ? getArtifactEffectValue(player, 'enhanceSlotBonusIncrease') : 0;

  const mainStats: Record<Equipment['type'], keyof Equipment['stats']> = {
    weapon: 'attack',
    armor: 'health',
    pants: 'defense',
    gloves: 'critDamage',
    ring: 'critDamage',
    necklace: 'attack'
  };

  //每次重生裝備欄位等級提升100等
  const rebirthSlotLevel = player ? getRebirthBonus(player).equipmentSlotBonus : 0;

  const totalSlotLevel = slotLevel + rebirthSlotLevel;
  const isMainStat = mainStats[eq.type] === statKey;
  const multiplier = isMainStat ? (1 + totalSlotLevel * (0.01 + artifactBonus)) : 1;

  const baseStat = eq.stats[statKey]!;
  if (statKey === 'critRate' || statKey === 'critDamage') {
    return baseStat * multiplier;
  }
  return Math.floor(baseStat * multiplier);
};

export const getActivePetBonus = (player: Player, effectType: PetEffectType): number => {
  if (!player.equippedPetId) return 0;
  const pet = player.pets[player.equippedPetId];
  if (!pet) return 0;
  const config = PET_CONFIGS.find(c => c.id === pet.configId);
  if (!config) return 0;

  if (Array.isArray(config.effectType)) {
    if (config.effectType.includes(effectType)) {
      return config.baseValue * (1 + pet.level);
    }
  } else if (config.effectType === effectType) { // For backward compatibility
    return config.baseValue * (1 + pet.level);
  }

  return 0;
};

export const getGlobalPetPassiveStats = (player: Player) => {
  let hpPercent = 0;
  let atkPercent = 0;
  let defPercent = 0;

  Object.values(player.pets).forEach(pet => {
    const config = PET_CONFIGS.find(c => c.id === pet.configId);
    if (!config) return;
    const effectiveValue = config.passiveBaseValue * (1 + pet.level);
    const baseValue = config.baseValue * (1 + pet.level);

    if (config.passiveType === 'healthPercentage') hpPercent += effectiveValue;
    else if (config.passiveType === 'attackPercentage') atkPercent += effectiveValue;
    else if (config.passiveType === 'defensePercentage') defPercent += effectiveValue;

    if (config.id === player.equippedPetId && config.effectType === 'attackPercentage') {
      atkPercent += baseValue;
    }
    if (config.id === player.equippedPetId && config.effectType === 'healthPercentage') {
      hpPercent += baseValue;
    }
    if (config.id === player.equippedPetId && config.effectType === 'defensePercentage') {
      defPercent += baseValue;
    }
  });

  return { hpPercent, atkPercent, defPercent };
};

export const getGlobalArtifactPassiveStats = (player: Player) => {
  let hpPercent = 0;
  let atkPercent = 0;
  let defPercent = 0;

  if (!player || !player.artifacts) return { hpPercent, atkPercent, defPercent };

  Object.values(player.artifacts).forEach(artifact => {
    if (artifact.level > 0) {
      const config = ARTIFACT_CONFIGS.find(c => c.id === artifact.configId);
      if (config && config.passiveType && config.passiveBaseValue) {
        const effectiveValue = config.passiveBaseValue * artifact.level;
        if (config.passiveType === 'healthPercentage') hpPercent += effectiveValue;
        else if (config.passiveType === 'attackPercentage') atkPercent += effectiveValue;
        else if (config.passiveType === 'defensePercentage') defPercent += effectiveValue;
      }
    }
  });

  return { hpPercent, atkPercent, defPercent };
};

export const getRebirthBonus = (player: Player) => {
  const rebirths = player.rebirths;
  const expBonus = rebirths * 1;
  const goldBonus = rebirths * 1;
  const equipmentSlotBonus = rebirths * 100;
  return { expBonus, goldBonus, equipmentSlotBonus };
};

export const getRebirthAttributeBonus = (player: Player) => {
  const rebirths = player.rebirths;
  const healthBonus = rebirths * 0.2;
  const attackBonus = rebirths * 0.2;
  const defenseBonus = rebirths * 0.2;
  const critRateBonus = rebirths * 0.02;
  const critDamageBonus = rebirths * 10;
  return { healthBonus, attackBonus, defenseBonus, critRateBonus, critDamageBonus };
};

export const getTotalStats = (player: Player) => {
  const baseAttack = player.attributes.attack * 50;
  const baseDefense = player.attributes.defense * 50;
  const baseHealth = 100 + player.attributes.health * 80;

  const equipAttack = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'attack', player), 0);
  const equipDefense = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'defense', player), 0);
  const equipHealth = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'health', player), 0);
  const equipCritRate = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'critRate', player), 0);
  const equipCritDamage = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'critDamage', player), 0);

  const petSlotHealth = (player.petSlotLevel || 1) * 10;
  const petSlotAttack = (player.petSlotLevel || 1) * 5;

  const globalPets = getGlobalPetPassiveStats(player);

  const megaPetStats = { attack: 0, defense: 0, health: 0, critRate: 0, critDamage: 0, expGain: 0, goldGain: 0, bossDamage: 0 };
  const activeMegaPet = player.activeMegaPetIndex !== null ? player.megaPets[player.activeMegaPetIndex] : null;
  if (activeMegaPet && activeMegaPet.unlocked) {
    activeMegaPet.slots.forEach(slot => {
      if (slot.type) {
        // @ts-ignore
        megaPetStats[slot.type] += MEGA_PET_STAT_BASE[slot.type] + MEGA_PET_STAT_GROWTH[slot.type] * activeMegaPet.level;
      }
    });
  }

  const rawTotalAttack = baseAttack + equipAttack + petSlotAttack;
  const rawTotalDefense = baseDefense + equipDefense;
  const rawTotalHealth = baseHealth + equipHealth + petSlotHealth;

  const petHealthBuff = Math.floor(rawTotalHealth * (globalPets.hpPercent + megaPetStats.health));
  const petAttackBuff = Math.floor(rawTotalAttack * (globalPets.atkPercent + megaPetStats.attack));
  const petDefenseBuff = Math.floor(rawTotalDefense * (globalPets.defPercent + megaPetStats.defense));

  const globalArtifacts = getGlobalArtifactPassiveStats(player);
  const artifactPassiveHealthBuff = Math.floor(rawTotalHealth * globalArtifacts.hpPercent);
  const artifactPassiveAttackBuff = Math.floor(rawTotalAttack * globalArtifacts.atkPercent);
  const artifactPassiveDefenseBuff = Math.floor(rawTotalDefense * globalArtifacts.defPercent);

  const artifactAttack = getArtifactEffectValue(player, 'baseAttack');
  const artifactDefense = getArtifactEffectValue(player, 'baseDefense');
  const artifactHealth = getArtifactEffectValue(player, 'baseHealth');

  const hpToDefenseBuff = Math.floor(rawTotalHealth * getArtifactEffectValue(player, 'hpToDefense'));
  const totalHealthMultiplier = getArtifactEffectValue(player, 'totalHealthMultiplier');

  const leadDefPercent = getArtifactEffectValue(player, 'defenseUpHealthDown');
  const leadHpPercent = leadDefPercent > 0 ? (0.02 * (leadDefPercent / 0.05)) : 0;

  let totalAttack = rawTotalAttack + petAttackBuff + artifactPassiveAttackBuff + artifactAttack;
  let totalDefense = Math.floor((rawTotalDefense + petDefenseBuff + artifactPassiveDefenseBuff + artifactDefense + hpToDefenseBuff) * (1 + leadDefPercent));
  let totalHealth = Math.floor((rawTotalHealth + petHealthBuff + artifactPassiveHealthBuff + artifactHealth) * (1 + totalHealthMultiplier) * (1 - leadHpPercent));

  const preRebirthAttack = totalAttack;
  const preRebirthDefense = totalDefense;
  const preRebirthHealth = totalHealth;

  const rebirthAttributeBonus = getRebirthAttributeBonus(player);
  totalAttack = Math.floor(totalAttack * (1 + rebirthAttributeBonus.attackBonus));
  totalDefense = Math.floor(totalDefense * (1 + rebirthAttributeBonus.defenseBonus));
  totalHealth = Math.floor(totalHealth * (1 + rebirthAttributeBonus.healthBonus));

  const rebirthHealthBonus = totalHealth - preRebirthHealth;
  const rebirthAttackBonus = totalAttack - preRebirthAttack;
  const rebirthDefenseBonus = totalDefense - preRebirthDefense;

  const goldToAttackCap = getArtifactEffectValue(player, 'goldToAttack');
  if (goldToAttackCap > 0) {
    const goldMultiplier = Math.min(goldToAttackCap, Math.floor(player.money / 1000000) * 0.01);
    totalAttack += Math.floor(totalAttack * goldMultiplier);
  }

  const artifactCritRate = getArtifactEffectValue(player, 'critRate');
  let artifactCritDmg = getArtifactEffectValue(player, 'critDamage');

  if (totalAttack > totalDefense) {
    artifactCritDmg += getArtifactEffectValue(player, 'attackGreaterThanDefenseCritDmg');
  }

  const totalCrit = player.attributes.critRate + equipCritRate + artifactCritRate + rebirthAttributeBonus.critRateBonus + megaPetStats.critRate;
  const totalCritDmg = player.attributes.critDamage + equipCritDamage + artifactCritDmg + rebirthAttributeBonus.critDamageBonus + megaPetStats.critDamage;

  const rebirthBonus = getRebirthBonus(player);

  const artifactExpGain = getArtifactEffectValue(player, 'expGain');
  const artifactGoldGain = getArtifactEffectValue(player, 'goldGain');

  const petExpGain = getActivePetBonus(player, 'expGain');
  const petGoldGain = getActivePetBonus(player, 'goldGain');

  const totalExpGain = artifactExpGain + rebirthBonus.expBonus + megaPetStats.expGain + petExpGain;
  const totalGoldGain = artifactGoldGain + rebirthBonus.goldBonus + megaPetStats.goldGain + petGoldGain;

  const artifactBossDamage = getArtifactEffectValue(player, 'finalDamageMultiplier');
  const rebirthBossDamage = (player.rebirths || 0) * 0.1;
  const finalBossDamage = megaPetStats.bossDamage + artifactBossDamage + rebirthBossDamage;

  return {
    health: Math.floor(totalHealth),
    attack: Math.floor(totalAttack),
    defense: Math.floor(totalDefense),
    critRate: totalCrit,
    critDamage: totalCritDmg,
    baseHealth,
    baseAttack,
    baseDefense,
    equipHealth,
    equipAttack,
    equipDefense,
    equipCritRate,
    equipCritDamage,
    artifactCritRate,
    artifactCritDamage: artifactCritDmg,
    petSlotHealth,
    petSlotAttack,
    petHealthBuff,
    petAttackBuff,
    petDefenseBuff,

    rebirthHealthBonus,
    rebirthAttackBonus,
    rebirthDefenseBonus,
    rebirthCritRateBonus: rebirthAttributeBonus.critRateBonus,
    rebirthCritDamageBonus: rebirthAttributeBonus.critDamageBonus,
    bossDamage: finalBossDamage,
    expGain: totalExpGain,
    goldGain: totalGoldGain,
  };
};

export const calculatePower = (player: Player): number => {
  const stats = getTotalStats(player);
  const cappedCritRate = Math.min(0.6, stats.critRate);

  // 戰力基底計算
  const basePower = (stats.attack * (1 + cappedCritRate * (0.5 + stats.critDamage))) + stats.health * 0.1 + stats.defense * 1.0;

  // Boss傷害極高戰力加成 (2倍權重)
  const bossDamageMultiplier = 1 + (stats.bossDamage * 2);

  return Math.floor(basePower * bossDamageMultiplier);
};

export const getExpToNextLevel = (level: number): number => {
  if (level <= 500) {
    return 1000 + (level - 1) * 500;
  } else if (level <= 1500) {
    const base500 = 1000 + (499) * 500;
    return base500 + (level - 500) * 5000;
  } else {
    const base1500 = 251000 + (999) * 5000;
    return base1500 + (level - 1500) * 50000;
  }
};
