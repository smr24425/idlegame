import { Player } from '../../types/game';
import { getArtifactEffectValue } from './stats';

export const getEnhanceCost = (level: number, player: Player) => {
  const baseGold = (level + 1) * 200;
  const reduction = getArtifactEffectValue(player, 'enhanceCostReduction');
  const gold = Math.floor(baseGold * (1 - reduction));
  const stones = level >= 10 ? Math.floor(level / 5) * 2 : 0;
  return { gold, stones };
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
      if (slotLevels[slot] < minLevel && slotLevels[slot] < player.level) {
        minLevel = slotLevels[slot];
        minSlot = slot;
      }
    }

    if (!minSlot) break;

    const { gold, stones } = getEnhanceCost(slotLevels[minSlot], player);

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
  let isMaxedOut = false;

  if (!canUpgradeAny) {
    let minLevel = Infinity;
    let minSlot: typeof slots[number] | null = null;

    for (const slot of slots) {
      if (slotLevels[slot] < minLevel) {
        minLevel = slotLevels[slot];
        minSlot = slot;
      }
    }

    if (minSlot && slotLevels[minSlot] >= player.level) {
      isMaxedOut = true;
    } else if (minSlot) {
      const { gold, stones } = getEnhanceCost(slotLevels[minSlot], player);
      if (remainingGold < gold) missingGold = gold - remainingGold;
      if (remainingStones < stones) missingStones = stones - remainingStones;
    }
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
    finalLevels: slotLevels,
    isMaxedOut
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
