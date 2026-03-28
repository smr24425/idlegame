import { Equipment } from '../../types/game';

const rarityMultipliers = {
  white: 1,
  green: 1.2,
  blue: 1.5,
  purple: 2,
  gold: 3,
  red: 5,
};

export const getEquipmentValue = (eq: Equipment): number => {
  const rarityBasePrice: Record<Equipment['rarity'], number> = {
    white: 10,
    green: 25,
    blue: 60,
    purple: 150,
    gold: 800,
    red: 5000,
  };

  const base = rarityBasePrice[eq.rarity] || 10;
  const levelBonus = Math.floor(eq.level / 10);
  return base + levelBonus;
};

export const getSalvageStones = (eq: Equipment): number => {
  const rarityBase = { white: 0, green: 1, blue: 2, purple: 8, gold: 20, red: 100 };
  const baseStones = rarityBase[eq.rarity];
  return baseStones > 0 ? Math.max(1, Math.floor(baseStones * Math.max(1, eq.level / 10))) : 0;
};

export const generateEquipmentStats = (
  type: Equipment['type'],
  rarity: Equipment['rarity'],
  multiplier: number,
  level: number
): {
  stats: Equipment['stats'];
  mainStat: { key: keyof Equipment['stats']; value: number };
  subStats: Array<{ key: keyof Equipment['stats']; value: number }>;
} => {
  const mainStats: Record<Equipment['type'], keyof Equipment['stats']> = {
    weapon: 'attack',
    armor: 'health',
    pants: 'defense',
    gloves: 'critDamage',
    ring: 'critDamage',
    necklace: 'attack'
  };

  const mainStatValues: Record<Equipment['type'], number> = {
    weapon: 5,
    armor: 5,
    pants: 5,
    gloves: 0.05,
    ring: 0.05,
    necklace: 5
  };

  const mainStatKey = mainStats[type];
  const stats: Equipment['stats'] = {};

  const mainVal = mainStatValues[type] * multiplier * (level / 10 + 1);
  let finalMainVal = mainVal;
  if (mainStatKey === 'critRate' || mainStatKey === 'critDamage') {
    finalMainVal = parseFloat(mainVal.toFixed(4));
  } else {
    finalMainVal = Math.floor(mainVal);
  }

  stats[mainStatKey] = finalMainVal;
  const mainStat = { key: mainStatKey, value: finalMainVal };

  const subStatCounts: Record<Equipment['rarity'], number> = {
    white: 1, green: 1, blue: 1, purple: 1, gold: 2, red: 3
  };
  const numSubStats = subStatCounts[rarity];
  const possibleSubStats: Array<keyof Equipment['stats']> = ['attack', 'defense', 'health', 'critRate', 'critDamage'];

  const subStats: Array<{ key: keyof Equipment['stats']; value: number }> = [];

  for (let i = 0; i < numSubStats; i++) {
    const subKey = possibleSubStats[Math.floor(Math.random() * possibleSubStats.length)];
    let finalSubVal = 0;

    if (subKey === 'critRate') {
      let randAmt = 0;
      switch (rarity) {
        case 'white': randAmt = Math.random() * 0.01; break;
        case 'green': randAmt = 0.01 + Math.random() * 0.01; break;
        case 'blue': randAmt = 0.02 + Math.random() * 0.01; break;
        case 'purple': randAmt = 0.03 + Math.random() * 0.01; break;
        case 'gold': randAmt = 0.04 + Math.random() * 0.01; break;
        case 'red': randAmt = 0.05; break;
      }
      finalSubVal = parseFloat(randAmt.toFixed(4));
    } else if (subKey === 'critDamage') {
      const val = 0.05 * multiplier * (level / 50 + 1);
      finalSubVal = parseFloat(val.toFixed(4));
    } else {
      const baseSubVal = Math.floor(Math.random() * 3) + 3; // Random base 3~5 explicitly for subtats
      const val = baseSubVal * multiplier * (level / 10 + 1);
      finalSubVal = Math.floor(val);
    }

    subStats.push({ key: subKey, value: finalSubVal });

    if (stats[subKey]) {
      // @ts-ignore
      stats[subKey] += finalSubVal;
      if (subKey === 'critRate' || subKey === 'critDamage') {
        // @ts-ignore
        stats[subKey] = parseFloat(stats[subKey].toFixed(4));
      }
    } else {
      stats[subKey] = finalSubVal;
    }
  }

  return { stats, mainStat, subStats };
};

export const generateEquipment = (stage: number, dropChance: number = 0.3, dropRateBonus: number = 0): Equipment | null => {
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

  const { stats, mainStat, subStats } = generateEquipmentStats(type, rarity, multiplier, level);

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
    mainStat,
    subStats,
    name: `${rarityNames[rarity]}${level}級${typeNames[type]}`,
  };
};

export const generateGachaEquipment = (playerLevel: number, highRarityBoost: number = 0): Equipment => {
  const types: Equipment['type'][] = ['weapon', 'armor', 'pants', 'gloves', 'ring', 'necklace'];
  const type = types[Math.floor(Math.random() * types.length)];

  const rarities: Equipment['rarity'][] = ['white', 'green', 'blue', 'purple', 'gold', 'red'];
  const rarityWeights = [400, 350, 150, 89, 10, 1];

  if (highRarityBoost > 0) {
    rarityWeights[4] *= (1 + highRarityBoost); // Gold
    rarityWeights[5] *= (1 + highRarityBoost); // Red
  }

  const totalWeight = rarityWeights.reduce((a, b) => a + b, 0);
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

  const { stats, mainStat, subStats } = generateEquipmentStats(type, rarity, multiplier, level);

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
    mainStat,
    subStats,
    name: `${rarityNames[rarity]}${level}級${typeNames[type]}`,
  };
};
