import { Player, Boss, Equipment, PetConfig, PetEffectType } from '../types/game';

export const PET_UPGRADE_COSTS = [1, 2, 4, 8, 16, 32];

export const PET_CONFIGS: PetConfig[] = [
  { id: 'fortune_cat', name: '金角招財貓', effectType: 'goldGain', baseValue: 0.1, passiveType: 'healthPercentage', passiveBaseValue: 0.01, description: '搖一搖手，金幣自然跟著走。', rarity: 'SR' },
  { id: 'gold_beetle', name: '黃金甲殼蟲', effectType: 'goldGain', baseValue: 0.1, passiveType: 'defensePercentage', passiveBaseValue: 0.01, description: '身體由純金打造，路過都會掉金粉。', rarity: 'SR' },
  { id: 'wise_owl', name: '智慧小梟', effectType: 'expGain', baseValue: 0.1, passiveType: 'attackPercentage', passiveBaseValue: 0.01, description: '牠看過的書比你打過的怪還多。', rarity: 'SR' },
  { id: 'time_rabbit', name: '時光沙漏兔', effectType: 'expGain', baseValue: 0.1, passiveType: 'healthPercentage', passiveBaseValue: 0.01, description: '牠能縮短大腦吸收戰鬥技巧的時間。', rarity: 'SR' },
  { id: 'treasure_hound', name: '尋寶獵犬', effectType: 'dropRate', baseValue: 0.1, passiveType: 'attackPercentage', passiveBaseValue: 0.01, description: '嗅覺靈敏，總能從死掉的怪身上翻出寶貝。', rarity: 'SR' },
  { id: 'lucky_frog', name: '幸運青蛙', effectType: 'dropRate', baseValue: 0.1, passiveType: 'defensePercentage', passiveBaseValue: 0.01, description: '呱！據說摸摸牠的頭，運氣會變好。', rarity: 'SR' },
  { id: 'steel_turtle', name: '鋼鐵巨龜', effectType: 'healthPercentage', baseValue: 0.1, passiveType: 'healthPercentage', passiveBaseValue: 0.01, description: '穩如泰山，賦予主人如甲殼般的生命力。', rarity: 'SR' },
  { id: 'flame_tiger', name: '烈焰幼虎', effectType: 'attackPercentage', baseValue: 0.1, passiveType: 'attackPercentage', passiveBaseValue: 0.01, description: '體內燃燒著戰意，讓主人的武器更鋒利。', rarity: 'SR' },
  { id: 'gargoyle_imp', name: '石像小鬼', effectType: 'defensePercentage', baseValue: 0.1, passiveType: 'defensePercentage', passiveBaseValue: 0.01, description: '堅硬的外皮是主人最強的後盾。', rarity: 'SR' },
  { id: 'holy_unicorn', name: '神聖獨角獸', effectType: 'defensePercentage', baseValue: 0.1, passiveType: 'healthPercentage', passiveBaseValue: 0.01, description: '淨化氣息，提升主人抵禦傷害的能力。', rarity: 'SR' },
  { id: 'time_dragon', name: '時序幻龍', effectType: 'dualResource', baseValue: 0.5, passiveType: 'attackPercentage', passiveBaseValue: 0.03, description: '扭曲時序，出戰時經驗與金幣雙重巨量提升。', rarity: 'SSR' },
  { id: 'nirvana_phoenix', name: '不滅涅槃凰', effectType: 'healthPercentage', baseValue: 0.3, passiveType: 'defensePercentage', passiveBaseValue: 0.03, description: '出戰時在首領戰綻放涅槃之火，每3回合回復大量生命。', rarity: 'SSR', combatSkill: { type: 'heal', triggerTurn: 3, triggerCondition: 'boss', basePercent: 0.1, levelPercent: 0.01 } }
];

export const getActivePetBonus = (player: Player, effectType: PetEffectType): number => {
  if (!player.equippedPetId) return 0;
  const pet = player.pets[player.equippedPetId];
  if (!pet) return 0;
  const config = PET_CONFIGS.find(c => c.id === pet.configId);
  if (!config) return 0;
  
  if (config.effectType === 'dualResource' && (effectType === 'goldGain' || effectType === 'expGain')) {
    return config.baseValue * (1 + pet.level);
  }
  
  if (config.effectType !== effectType) return 0;
  
  return config.baseValue * (1 + pet.level);
};

export const getSalvageStones = (eq: Equipment): number => {
  const rarityBase = { white: 0, green: 1, blue: 2, purple: 8, gold: 20, red: 100 };
  const baseStones = rarityBase[eq.rarity];
  return baseStones > 0 ? Math.max(1, Math.floor(baseStones * Math.max(1, eq.level / 10))) : 0;
};

export const getEnhanceCost = (currentLevel: number) => {
  const gold = 100 * (currentLevel + 1);
  const requiresStones = (currentLevel + 1) % 10 === 0;
  const stones = requiresStones ? Math.floor((currentLevel + 1) / 10) * 5 : 0;
  return { gold, stones };
};

export const getEnhancedStat = (eq: Equipment | null, slotLevel: number, statKey: keyof Equipment['stats']): number => {
  if (!eq || !eq.stats[statKey]) return 0;
  const multiplier = 1 + slotLevel * 0.05;
  const baseStat = eq.stats[statKey]!;
  if (statKey === 'critRate' || statKey === 'critDamage') {
    return baseStat * multiplier; // Keep decimal for crit stats
  }
  return Math.floor(baseStat * multiplier);
};

export const calculateAutoEnhance = (player: Player, inventoryStones: number) => {
  const slotLevels = { ...player.slotLevels };
  const originalLevels = { ...player.slotLevels };
  let remainingGold = player.money;
  let remainingStones = inventoryStones;
  let totalGoldSpent = 0;
  let totalStonesSpent = 0;
  let canUpgradeAny = false;

  const slots: Array<keyof typeof slotLevels> = ['weapon', 'armor', 'pants', 'gloves', 'ring', 'necklace'];

  while (true) {
    let minLevel = Infinity;
    let minSlot: typeof slots[number] | null = null;
    
    for (const slot of slots) {
      if (slotLevels[slot] < minLevel) {
        minLevel = slotLevels[slot];
        minSlot = slot;
      }
    }
    
    if (!minSlot) break;
    
    const { gold, stones } = getEnhanceCost(slotLevels[minSlot]);
    
    if (remainingGold >= gold && remainingStones >= stones) {
      remainingGold -= gold;
      remainingStones -= stones;
      totalGoldSpent += gold;
      totalStonesSpent += stones;
      slotLevels[minSlot]++;
      canUpgradeAny = true;
    } else {
      break;
    }
  }

  let missingGold = 0;
  let missingStones = 0;
  if (!canUpgradeAny) {
    let minLevel = Infinity;
    let minSlot: typeof slots[number] = 'weapon';
    for (const slot of slots) {
      if (slotLevels[slot] < minLevel) {
        minLevel = slotLevels[slot];
        minSlot = slot;
      }
    }
    const { gold, stones } = getEnhanceCost(slotLevels[minSlot]);
    if (remainingGold < gold) missingGold = gold - remainingGold;
    if (remainingStones < stones) missingStones = stones - remainingStones;
  }

  return {
    upgrades: {
      weapon: slotLevels.weapon - originalLevels.weapon,
      armor: slotLevels.armor - originalLevels.armor,
      pants: slotLevels.pants - originalLevels.pants,
      gloves: slotLevels.gloves - originalLevels.gloves,
      ring: slotLevels.ring - originalLevels.ring,
      necklace: slotLevels.necklace - originalLevels.necklace,
    },
    totalGoldSpent,
    totalStonesSpent,
    canUpgradeAny,
    missingGold,
    missingStones,
    finalLevels: slotLevels
  };
};

export const calculateBulkPetSlotUpgrade = (currentLevel: number, currentMoney: number, currentFragments: number) => {
  let levelsGained = 0;
  let totalGoldSpent = 0;
  let totalFragmentsSpent = 0;
  let simLevel = currentLevel;
  let simMoney = currentMoney;
  let simFragments = currentFragments;

  while (true) {
    const goldCost = simLevel * 1000;
    const isBreakthrough = simLevel % 10 === 0;
    const fragmentCost = isBreakthrough ? Math.floor(simLevel / 10) * 10 : 0;
    
    if (simMoney < goldCost) break;
    if (isBreakthrough && simFragments < fragmentCost) break;
    
    simMoney -= goldCost;
    totalGoldSpent += goldCost;
    if (isBreakthrough) {
      simFragments -= fragmentCost;
      totalFragmentsSpent += fragmentCost;
    }
    simLevel++;
    levelsGained++;
  }
  return { levelsGained, totalGoldSpent, totalFragmentsSpent, newLevel: simLevel };
};

export const getGlobalPetPassiveStats = (player: Player) => {
  let hpPercent = 0;
  let atkPercent = 0;
  let defPercent = 0;

  Object.values(player.pets).forEach(pet => {
    const config = PET_CONFIGS.find(c => c.id === pet.configId);
    if (!config) return;

    // Apply the Pokedex combat stat passive scaling unconditionally based on `passiveType`!
    const effectiveValue = config.passiveBaseValue * (1 + pet.level);
    
    if (config.passiveType === 'healthPercentage') hpPercent += effectiveValue;
    else if (config.passiveType === 'attackPercentage') atkPercent += effectiveValue;
    else if (config.passiveType === 'defensePercentage') defPercent += effectiveValue;
  });

  return { hpPercent, atkPercent, defPercent };
};

export const getTotalStats = (player: Player) => {
  const baseAttack = player.attributes.attack;
  const baseDefense = player.attributes.defense;
  const baseHealth = 100 + player.attributes.health * 10;

  const equipAttack = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'attack'), 0);
  const equipDefense = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'defense'), 0);
  const equipHealth = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'health'), 0);
  const equipCritRate = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'critRate'), 0);
  const equipCritDamage = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'critDamage'), 0);

  const petSlotHealth = (player.petSlotLevel || 1) * 10;
  const petSlotAttack = (player.petSlotLevel || 1) * 5;

  const globalPets = getGlobalPetPassiveStats(player);

  const rawTotalAttack = baseAttack + equipAttack + petSlotAttack;
  const rawTotalDefense = baseDefense + equipDefense;
  const rawTotalHealth = baseHealth + equipHealth + petSlotHealth;

  const petHealthBuff = Math.floor(rawTotalHealth * globalPets.hpPercent);
  const petAttackBuff = Math.floor(rawTotalAttack * globalPets.atkPercent);
  const petDefenseBuff = Math.floor(rawTotalDefense * globalPets.defPercent);

  const totalAttack = rawTotalAttack + petAttackBuff;
  const totalDefense = rawTotalDefense + petDefenseBuff;
  const totalHealth = rawTotalHealth + petHealthBuff;
  
  const totalCrit = player.attributes.critRate + equipCritRate;
  const totalCritDmg = player.attributes.critDamage + equipCritDamage;

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
    petSlotHealth,
    petSlotAttack,
    petHealthBuff,
    petAttackBuff,
    petDefenseBuff
  };
};

export const calculatePower = (player: Player): number => {
  const stats = getTotalStats(player);
  return Math.floor(stats.attack * 2 + stats.defense * 1.5 + stats.health * 0.2 + (stats.critRate * 100) + (stats.critDamage * 100));
};

export const getExpToNextLevel = (level: number): number => {
  return level * 100;
};

export const generateBoss = (stage: number): Boss => {
  const baseHealth = 50 + stage * 20;
  const baseAttack = 5 + stage * 2;
  const baseDefense = 2 + stage;
  return {
    name: `Boss of Stage ${stage}`,
    health: baseHealth,
    maxHealth: baseHealth,
    attack: baseAttack,
    defense: baseDefense,
  };
};

const rarityMultipliers = {
  white: 1,
  green: 1.2,
  blue: 1.5,
  purple: 2,
  gold: 3,
  red: 5,
};
export const getEquipmentValue = (eq: Equipment): number => {
  const base = (eq.stats.attack || 0) * 10
    + (eq.stats.defense || 0) * 8
    + (eq.stats.health || 0) * 2
    + (eq.stats.critRate || 0) * 100
    + (eq.stats.critDamage || 0) * 100;
  const multiplier = rarityMultipliers[eq.rarity] || 1;
  return Math.floor(base * multiplier);
};
export const generateEquipment = (stage: number, dropChance: number = 0.3, dropRateBonus: number = 0): Equipment | null => {
  // dropChance chance to drop equipment
  if (Math.random() > dropChance) return null;

  const types: Equipment['type'][] = ['weapon', 'armor', 'pants', 'gloves', 'ring', 'necklace'];
  const type = types[Math.floor(Math.random() * types.length)];

  const rarities: Equipment['rarity'][] = ['white', 'green', 'blue', 'purple', 'gold'];
  const rarityWeights = [50, 30, 15, 4 * (1 + dropRateBonus), 1 * (1 + dropRateBonus)]; // Higher chance for lower rarity, buffed by pets
  let random = Math.random() * rarityWeights.reduce((a, b) => a + b, 0);
  let rarityIndex = 0;
  for (let i = 0; i < rarityWeights.length; i++) {
    random -= rarityWeights[i];
    if (random <= 0) {
      rarityIndex = i;
      break;
    }
  }
  const rarity = rarities[rarityIndex];

  const level = stage + Math.floor(Math.random() * 3) - 1; // stage-1 to stage+1
  const multiplier = rarityMultipliers[rarity];

  const baseStats: Record<Equipment['type'], Partial<Equipment['stats']>> = {
    weapon: { attack: 5, critRate: 0.02 },
    armor: { defense: 3, health: 5 },
    pants: { health: 4, defense: 2 },
    gloves: { critRate: 0.03, critDamage: 0.05 },
    ring: { critDamage: 0.05, attack: 2 },
    necklace: { health: 3, attack: 2, defense: 2 },
  };

  const stats = { ...baseStats[type] };
  Object.keys(stats).forEach(key => {
    const k = key as keyof typeof stats;
    stats[k] = Math.floor((stats[k] as number) * multiplier * (level / 10 + 1));
  });

  const typeNames = {
    weapon: '武器',
    armor: '上衣',
    pants: '褲子',
    gloves: '手套',
    ring: '戒指',
    necklace: '項鍊',
  };

  const rarityNames = {
    white: '白',
    green: '綠',
    blue: '藍',
    purple: '紫',
    gold: '金',
    red: '紅',
  };

  return {
    id: `${type}_${rarity}_${level}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    rarity,
    level,
    stats,
    name: `${rarityNames[rarity]}${level}級${typeNames[type]}`,
  };
};

export const generateGachaEquipment = (playerLevel: number): Equipment => {
  const types: Equipment['type'][] = ['weapon', 'armor', 'pants', 'gloves', 'ring', 'necklace'];
  const type = types[Math.floor(Math.random() * types.length)];

  const rarities: Equipment['rarity'][] = ['white', 'green', 'blue', 'purple', 'gold', 'red'];
  // Probabilities: White: 40%, Green: 35%, Blue: 15%, Purple: 8.9%, Gold: 1%, Red: 0.1%
  const rarityWeights = [400, 350, 150, 89, 10, 1]; 
  const totalWeight = 1000;
  let random = Math.random() * totalWeight;
  let rarityIndex = 0;
  for (let i = 0; i < rarityWeights.length; i++) {
    random -= rarityWeights[i];
    if (random <= 0) {
      rarityIndex = i;
      break;
    }
  }
  const rarity = rarities[rarityIndex];
  const level = playerLevel; // Fixed to player's level
  const multiplier = rarityMultipliers[rarity];

  const baseStats: Record<Equipment['type'], Partial<Equipment['stats']>> = {
    weapon: { attack: 5, critRate: 0.02 },
    armor: { defense: 3, health: 5 },
    pants: { health: 4, defense: 2 },
    gloves: { critRate: 0.03, critDamage: 0.05 },
    ring: { critDamage: 0.05, attack: 2 },
    necklace: { health: 3, attack: 2, defense: 2 },
  };

  const stats = { ...baseStats[type] };
  Object.keys(stats).forEach(key => {
    const k = key as keyof typeof stats;
    stats[k] = Math.floor((stats[k] as number) * multiplier * (level / 10 + 1));
  });

  const typeNames = {
    weapon: '武器',
    armor: '上衣',
    pants: '褲子',
    gloves: '手套',
    ring: '戒指',
    necklace: '項鍊',
  };

  const rarityNames = {
    white: '白',
    green: '綠',
    blue: '藍',
    purple: '紫',
    gold: '金',
    red: '紅',
  };

  return {
    id: `${type}_${rarity}_${level}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    rarity,
    level,
    stats,
    name: `${rarityNames[rarity]}${level}級${typeNames[type]}`,
  };
};

export const formatNumber = (num: number): string => {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toString();
};