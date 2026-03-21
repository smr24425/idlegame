import { useState, useEffect } from 'react';
import { GameState, Player, Equipment } from '../types/game';
import { getExpToNextLevel, generateBoss, generateEquipment, getEquipmentValue, generateGachaEquipment, getSalvageStones, getEnhanceCost, calculateAutoEnhance, calculateBulkPetSlotUpgrade, getActivePetBonus, PET_CONFIGS, PET_UPGRADE_COSTS, getTotalStats, getItemConfig, getArtifactEffectValue, ARTIFACT_CONFIGS, getArtifactUpgradeCost } from '../utils/gameLogic';

const initialPlayer: Player = {
  level: 1,
  exp: 0,
  expToNext: getExpToNextLevel(1),
  money: 0,
  diamonds: 0,
  pets: {},
  equippedPetId: null,
  petSlotLevel: 1,
  petGachaPity: 0,
  artifacts: {},
  equippedArtifactIds: [],
  stage: 1,
  attributes: {
    health: 1,
    attack: 5,
    critRate: 0.05,
    critDamage: 0.1,
    defense: 1,
  },
  availablePoints: 0,
  health: 120, // base 100 + health * 20
  maxHealth: 120,
  equipment: {
    weapon: null,
    armor: null,
    pants: null,
    gloves: null,
    ring: null,
    necklace: null,
  },
  slotLevels: {
    weapon: 0,
    armor: 0,
    pants: 0,
    gloves: 0,
    ring: 0,
    necklace: 0,
  },
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('idleGameState');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.player.expToNext = getExpToNextLevel(parsed.player.level);
      parsed.player.maxHealth = 100 + (parsed.player.attributes?.health || 0) * 20;
      parsed.player.artifacts = parsed.player.artifacts || {};
      parsed.player.equippedArtifactIds = parsed.player.equippedArtifactIds || ['', '', ''];
      parsed.player.health = Math.min(parsed.player.health, parsed.player.maxHealth);
      // Ensure attributes exist
      parsed.player.attributes = {
        ...initialPlayer.attributes,
        ...parsed.player.attributes,
      };
      // Ensure equipment exists
      parsed.player.equipment = {
        ...initialPlayer.equipment,
        ...parsed.player.equipment,
      };
      // Ensure other fields
      parsed.player.availablePoints = parsed.player.availablePoints || 0;
      parsed.player.stage = parsed.player.stage || 1;
      parsed.player.level = parsed.player.level || 1;
      parsed.player.exp = parsed.player.exp || 0;
      parsed.player.money = parsed.player.money || 0;
      parsed.player.diamonds = parsed.player.diamonds || 0;
      parsed.player.pets = parsed.player.pets || {};
      if (parsed.player.equippedPetId === undefined) parsed.player.equippedPetId = null;
      parsed.player.rebirths = parsed.player.rebirths || 0;
      // Ensure inventory exists
      parsed.inventory = {
        equipment: parsed.inventory?.equipment || [],
        items: parsed.inventory?.items || [],
      };
      parsed.player.slotLevels = {
        ...initialPlayer.slotLevels,
        ...parsed.player.slotLevels,
      };
      return parsed;
    }
    return {
      player: initialPlayer,
      currentBoss: null,
      isFighting: false,
      fightLog: [],
      lastCollectTime: Date.now(),
      inventory: {
        equipment: [],
        items: [],
      },
    };
  });

  useEffect(() => {
    localStorage.setItem('idleGameState', JSON.stringify(gameState));
  }, [gameState]);

  const collectRewards = () => {
    const now = Date.now();
    const timeDiff = Math.floor((now - gameState.lastCollectTime) / 1000); // seconds
    const goldBonus = getActivePetBonus(gameState.player, 'goldGain');
    const expBonus = getActivePetBonus(gameState.player, 'expGain');
    const dropRateBonus = getActivePetBonus(gameState.player, 'dropRate');

    const artifactGoldBonus = getArtifactEffectValue(gameState.player, 'goldGain');
    const artifactExpBonus = getArtifactEffectValue(gameState.player, 'expGain');
    const artifactUpgradeDropRate = getArtifactEffectValue(gameState.player, 'upgradeStoneDropRate');
    const artifactPetStoneDropRate = getArtifactEffectValue(gameState.player, 'petStoneDropRate');

    // 每秒獲得的經驗 / 金錢會根據當前關卡上升
    const expGained = timeDiff * gameState.player.stage * 10 * (1 + expBonus + artifactExpBonus); // per second
    const moneyGained = timeDiff * gameState.player.stage * 5 * (1 + goldBonus + artifactGoldBonus);
    // 每 60 秒掉一件裝備
    const minutes = Math.floor(timeDiff / 60);
    const equipments: Equipment[] = [];

    let upgradeStonesGained = 0;
    let petStonesGained = 0;

    for (let i = 0; i < minutes; i++) {
      const eq = generateEquipment(gameState.player.level, 1, dropRateBonus);
      if (eq) equipments.push(eq);

      // Chance to drop stones natively
      if (Math.random() < 0.05 + artifactUpgradeDropRate) upgradeStonesGained++;
      if (Math.random() < 0.02 + artifactPetStoneDropRate) petStonesGained++;
    }

    setGameState(prev => {
      let newItems = [...prev.inventory.items];
      const addMaterial = (id: string, name: string, quantity: number) => {
        if (quantity <= 0) return;
        const idx = newItems.findIndex(i => i.id === id);
        if (idx >= 0) newItems[idx] = { ...newItems[idx], quantity: newItems[idx].quantity + quantity };
        else newItems.push({ id, name, type: 'material', quantity });
      };

      addMaterial('upgrade_stone', '裝備強化石', upgradeStonesGained);
      addMaterial('pet_upgrade_fragment', '幼龍碎片', petStonesGained);

      return {
        ...prev,
        player: {
          ...prev.player,
          exp: prev.player.exp + expGained,
          money: prev.player.money + moneyGained,
        },
        lastCollectTime: now,
        inventory: {
          ...prev.inventory,
          equipment: [...prev.inventory.equipment, ...equipments],
          items: newItems,
        },
      };
    });
    return { expGained: Math.floor(expGained), moneyGained: Math.floor(moneyGained), timeDiff, equipments };
  };

  const levelUp = () => {
    setGameState(prev => {
      let newLevel = prev.player.level;
      let newExp = prev.player.exp;
      let newAvailablePoints = prev.player.availablePoints;

      // Process potential multiple level-ups from overflow exp
      while (newExp >= getExpToNextLevel(newLevel)) {
        newExp -= getExpToNextLevel(newLevel);
        newLevel += 1;
        newAvailablePoints += 5;
      }

      const newExpToNext = getExpToNextLevel(newLevel);
      const newPlayer = { ...prev.player, level: newLevel, exp: newExp, expToNext: newExpToNext, availablePoints: newAvailablePoints };
      const totalStats = getTotalStats(newPlayer);
      const newMaxHealth = totalStats.health;
      return {
        ...prev,
        player: {
          ...newPlayer,
          maxHealth: newMaxHealth,
          health: Math.min(prev.player.health, newMaxHealth), // keep current health if below max
        },
      };
    });
  };

  const allocatePoint = (attr: keyof Player['attributes']) => {
    setGameState(prev => {
      if (prev.player.availablePoints <= 0) return prev;
      const newAttributes = { ...prev.player.attributes };
      if (attr === 'critRate' || attr === 'critDamage') {
        // each point gives +0.01 (1%) to crit stats
        newAttributes[attr] = parseFloat((newAttributes[attr] + 0.01).toFixed(2)) as number;
      } else {
        newAttributes[attr]++;
      }
      const tempPlayer = { ...prev.player, attributes: newAttributes };
      const newMaxHealth = getTotalStats(tempPlayer).health;
      return {
        ...prev,
        player: {
          ...tempPlayer,
          availablePoints: prev.player.availablePoints - 1,
          maxHealth: newMaxHealth,
          health: Math.min(prev.player.health, newMaxHealth),
        },
      };
    });
  };

  const startFight = () => {
    setGameState(prev => {
      const totalMaxHealth = getTotalStats(prev.player).health;

      const boss = generateBoss(prev.player.stage);

      return {
        ...prev,
        player: {
          ...prev.player,
          health: totalMaxHealth, // 每次挑戰Boss前補滿血 (Real dynamic Max HP)
        },
        currentBoss: boss,
        isFighting: true,
        fightLog: [`Challenging ${boss.name}!`],
      };
    });
  };

  const endFight = (result: 'win' | 'lose', finalPlayerHealth: number) => {
    setGameState(prev => {
      if (!prev.currentBoss || !prev.isFighting) return prev;

      const newLog = [...prev.fightLog];
      if (result === 'win') {
        newLog.push(`You defeated ${prev.currentBoss.name}!`);
        newLog.push(`Advanced to stage ${prev.player.stage + 1}!`);

        const greedBoxChance = getArtifactEffectValue(prev.player, 'bossHighRarityDrop');
        const extraEquipments: any[] = [];
        if (greedBoxChance > 0 && Math.random() < greedBoxChance) {
          const roll = Math.random() * 100;
          let forcedRarity = 'Purple';
          if (roll < 5) forcedRarity = 'Red';
          else if (roll < 30) forcedRarity = 'Gold';

          const newEquip = generateEquipment(prev.player.level, forcedRarity as any);
          extraEquipments.push(newEquip);
          newLog.push(`🎁 【貪婪魔盒】掉落了稀有裝備！`);
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            stage: prev.player.stage + 1,
            money: prev.player.money + prev.player.stage * 50 * (1 + getArtifactEffectValue(prev.player, 'goldGain')), // Reward
            exp: prev.player.exp + prev.player.stage * 20 * (1 + getArtifactEffectValue(prev.player, 'expGain')),
            health: Math.max(0, finalPlayerHealth),
          },
          inventory: {
            ...prev.inventory,
            equipment: [...prev.inventory.equipment, ...extraEquipments]
          },
          currentBoss: null,
          isFighting: false,
          fightLog: newLog,
        };
      }

      newLog.push(`You were defeated by ${prev.currentBoss.name}.`);
      return {
        ...prev,
        player: {
          ...prev.player,
          health: Math.max(0, finalPlayerHealth),
        },
        currentBoss: null,
        isFighting: false,
        fightLog: newLog,
      };
    });
  };

  // Auto level up check
  useEffect(() => {
    if (gameState.player.exp >= gameState.player.expToNext) {
      levelUp();
    }
  }, [gameState.player.exp]);

  const equipItem = (equipment: Equipment) => {
    setGameState(prev => {
      const newEquipment = { ...prev.player.equipment };
      const oldItem = newEquipment[equipment.type];
      newEquipment[equipment.type] = equipment;
      // Remove from inventory and add old item back if exists
      let newInv = prev.inventory.equipment.filter(e => e.id !== equipment.id);
      if (oldItem) {
        newInv = [...newInv, oldItem];
      }
      return {
        ...prev,
        player: {
          ...prev.player,
          equipment: newEquipment,
        },
        inventory: {
          ...prev.inventory,
          equipment: newInv,
        },
      };
    });
  };

  const unequipItem = (type: keyof Player['equipment']) => {
    setGameState(prev => {
      const item = prev.player.equipment[type];
      if (item) {
        const newEquipment = { ...prev.player.equipment };
        newEquipment[type] = null;
        return {
          ...prev,
          player: {
            ...prev.player,
            equipment: newEquipment,
          },
          inventory: {
            ...prev.inventory,
            equipment: [...prev.inventory.equipment, item],
          },
        };
      }
      return prev;
    });
  };

  const sellItem = (equipmentId: string): number => {
    let gainedGold = 0;
    setGameState(prev => {
      const item = prev.inventory.equipment.find(e => e.id === equipmentId);
      if (!item) return prev;
      gainedGold = getEquipmentValue(item);
      const gainedStones = getSalvageStones(item);

      let newItems = [...prev.inventory.items];
      if (gainedStones > 0) {
        const stoneIndex = newItems.findIndex(i => i.id === 'upgrade_stone');
        if (stoneIndex >= 0) {
          newItems[stoneIndex] = { ...newItems[stoneIndex], quantity: newItems[stoneIndex].quantity + gainedStones };
        } else {
          newItems.push({ id: 'upgrade_stone', name: '裝備強化石', type: 'material', quantity: gainedStones });
        }
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money + gainedGold,
        },
        inventory: {
          ...prev.inventory,
          equipment: prev.inventory.equipment.filter(e => e.id !== equipmentId),
          items: newItems,
        },
      };
    });
    return gainedGold;
  };

  const sellItemsByFilter = (filters: number[]) => {
    setGameState(prev => {
      const toSell = prev.inventory.equipment.filter(eq => {
        const rarityIndex = ['white', 'green', 'blue', 'purple', 'gold'].indexOf(eq.rarity);
        const isRarityMatch = filters.some(f => f >= 1 && f <= 5 && rarityIndex === f - 1);
        const equipped = prev.player.equipment[eq.type];
        const eqPower = getEquipmentValue(eq);
        const equippedPower = equipped ? getEquipmentValue(equipped) : 0;
        const isLowerOrEqualPower = filters.includes(6) && eqPower <= equippedPower;
        return isRarityMatch || isLowerOrEqualPower;
      });

      const totalGainGold = toSell.reduce((sum, item) => sum + getEquipmentValue(item), 0);
      const totalGainStones = toSell.reduce((sum, item) => sum + getSalvageStones(item), 0);

      let newItems = [...prev.inventory.items];
      if (totalGainStones > 0) {
        const stoneIndex = newItems.findIndex(i => i.id === 'upgrade_stone');
        if (stoneIndex >= 0) {
          newItems[stoneIndex] = { ...newItems[stoneIndex], quantity: newItems[stoneIndex].quantity + totalGainStones };
        } else {
          newItems.push({ id: 'upgrade_stone', name: '裝備強化石', type: 'material', quantity: totalGainStones });
        }
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money + totalGainGold,
        },
        inventory: {
          ...prev.inventory,
          equipment: prev.inventory.equipment.filter(eq => !toSell.includes(eq)),
          items: newItems,
        },
      };
    });
  };

  const addEquipmentToInventory = (equipment: Equipment) => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        equipment: [...prev.inventory.equipment, equipment],
      },
    }));
  };

  const autoEquipBest = () => {
    setGameState(prev => {
      const slots: Equipment['type'][] = ['weapon', 'armor', 'pants', 'gloves', 'ring', 'necklace'];
      const newEquipment = { ...prev.player.equipment };
      let newInventory = [...prev.inventory.equipment];

      slots.forEach(slot => {
        const currentlyEquipped = newEquipment[slot];
        const candidates = newInventory.filter(eq => eq.type === slot);
        const allCandidates = currentlyEquipped ? [...candidates, currentlyEquipped] : candidates;
        if (allCandidates.length === 0) return;

        const best = allCandidates.reduce((bestSoFar, current) => {
          return getEquipmentValue(current) > getEquipmentValue(bestSoFar) ? current : bestSoFar;
        }, allCandidates[0]);

        // If the best is already equipped, nothing changes
        if (currentlyEquipped && best.id === currentlyEquipped.id) return;

        // Equip the best item (if it was in inventory) and return the old equipment back to inventory
        newInventory = newInventory.filter(eq => eq.id !== best.id);
        if (currentlyEquipped) {
          newInventory.push(currentlyEquipped);
        }
        newEquipment[slot] = best;
      });

      return {
        ...prev,
        player: {
          ...prev.player,
          equipment: newEquipment,
        },
        inventory: {
          ...prev.inventory,
          equipment: newInventory,
        },
      };
    });
  };

  const updatePlayerHealth = (health: number) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        health: Math.max(0, health),
      },
    }));
  };

  const drawGacha = (times: number): { success: boolean, equipments: Equipment[] } => {
    const costReduction = getArtifactEffectValue(gameState.player, 'gachaCostReduction');
    const highRarityBoost = getArtifactEffectValue(gameState.player, 'gachaHighRarityBoost');

    const cost = Math.floor(times * 100 * (1 - costReduction));
    if (gameState.player.money < cost) {
      return { success: false, equipments: [] };
    }

    const newEquipments: Equipment[] = [];
    for (let i = 0; i < times; i++) {
      newEquipments.push(generateGachaEquipment(gameState.player.level, highRarityBoost));
    }

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        money: prev.player.money - cost,
      },
      inventory: {
        ...prev.inventory,
        equipment: [...prev.inventory.equipment, ...newEquipments],
      },
    }));

    return { success: true, equipments: newEquipments };
  };

  const enhanceSlot = (slotType: Equipment['type']): { success: boolean, message?: string } => {
    const currentLevel = gameState.player.slotLevels[slotType];
    const { gold, stones } = getEnhanceCost(currentLevel, gameState.player);

    if (gameState.player.money < gold) {
      return { success: false, message: '金錢不足' };
    }

    let stoneIndex = gameState.inventory.items.findIndex(i => i.id === 'upgrade_stone');
    const currentStones = stoneIndex >= 0 ? gameState.inventory.items[stoneIndex].quantity : 0;

    if (stones > 0 && currentStones < stones) {
      return { success: false, message: `需要 ${stones} 個強化石` };
    }

    setGameState(prev => {
      let newItems = [...prev.inventory.items];
      if (stones > 0) {
        const sIndex = newItems.findIndex(i => i.id === 'upgrade_stone');
        if (sIndex >= 0) {
          newItems[sIndex] = { ...newItems[sIndex], quantity: newItems[sIndex].quantity - stones };
        }
      }
      return {
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money - gold,
          slotLevels: { ...prev.player.slotLevels, [slotType]: prev.player.slotLevels[slotType] + 1 }
        },
        inventory: { ...prev.inventory, items: newItems }
      };
    });

    return { success: true };
  };

  const applyAutoEnhance = () => {
    let finalResult = false;
    setGameState(prev => {
      const stoneIndex = prev.inventory.items.findIndex(i => i.id === 'upgrade_stone');
      const inventoryStones = stoneIndex >= 0 ? prev.inventory.items[stoneIndex].quantity : 0;

      const result = calculateAutoEnhance(prev.player, inventoryStones);
      if (!result.canUpgradeAny) return prev;

      let newItems = [...prev.inventory.items];
      if (result.totalStonesSpent > 0 && stoneIndex >= 0) {
        newItems[stoneIndex] = { ...newItems[stoneIndex], quantity: newItems[stoneIndex].quantity - result.totalStonesSpent };
      }

      finalResult = true;
      return {
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money - result.totalGoldSpent,
          slotLevels: result.finalLevels,
        },
        inventory: {
          ...prev.inventory,
          items: newItems,
        }
      };
    });
    return finalResult;
  };

  const exchangeGoldForDiamonds = (amountToSpend: number) => {
    setGameState(prev => {
      if (prev.player.money < amountToSpend) return prev;
      const diamondsGained = Math.floor(amountToSpend / 100);
      if (diamondsGained <= 0) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          money: prev.player.money - diamondsGained * 100,
          diamonds: prev.player.diamonds + diamondsGained,
        }
      };
    });
  };

  const drawPetGacha = (times: number): { success: boolean; results: any[], message: string } => {
    const cost = times * 100;
    if (gameState.player.diamonds < cost) {
      return { success: false, results: [], message: '鑽石不足！需 100 鑽石抽取一次。' };
    }

    let currentPity = gameState.player.petGachaPity || 0;
    const drawnResults: any[] = [];

    for (let i = 0; i < times; i++) {
      currentPity++;

      const rand = Math.random() * 100; // 0 to 100

      let isFullSSR = false;
      let isFullSR = false;
      let isSSRFrag = false;
      let isSRFrag = false;

      if (currentPity >= 100) {
        // Guarantee full pet at 100 pity based on relative rates (0.05 vs 1.0)
        const pityRand = Math.random() * 1.05;
        if (pityRand < 0.05) isFullSSR = true;
        else isFullSR = true;
      } else {
        if (rand < 0.05) isFullSSR = true;
        else if (rand < 1.05) isFullSR = true;
        else if (rand < 2.05) isSSRFrag = true;
        else if (rand < 12.05) isSRFrag = true;
      }

      if (isFullSSR || isFullSR) {
        currentPity = 0; // Reset pity upon pulling any full pet
        const rarityList = PET_CONFIGS.filter(p => p.rarity === (isFullSSR ? 'SSR' : 'SR'));
        const randomPet = rarityList[Math.floor(Math.random() * rarityList.length)];
        drawnResults.push({ type: 'full', pet: randomPet });
      } else if (isSSRFrag || isSRFrag) {
        const rarityList = PET_CONFIGS.filter(p => p.rarity === (isSSRFrag ? 'SSR' : 'SR'));
        const randomPet = rarityList[Math.floor(Math.random() * rarityList.length)];
        const amount = Math.floor(Math.random() * 9) + 2; // 2-10
        drawnResults.push({ type: 'pet_fragment', pet: randomPet, amount });
      } else {
        const amount = Math.floor(Math.random() * 3) + 1; // 1-3
        drawnResults.push({ type: 'upgrade_fragment', amount });
      }
    }

    setGameState(prev => {
      const newPets = { ...prev.player.pets };
      const newItems = [...prev.inventory.items];

      const addOrUpdateItem = (id: string, quantity: number, type: 'consumable' | 'material', dynamicName?: string) => {
        const itemConfig = getItemConfig(id, dynamicName);
        const idx = newItems.findIndex(i => i.id === id);
        if (idx >= 0) {
          newItems[idx] = { ...newItems[idx], quantity: newItems[idx].quantity + quantity };
        } else {
          newItems.push({ id, name: itemConfig.name, type, quantity });
        }
      };

      drawnResults.forEach(res => {
        if (res.type === 'full') {
          if (!newPets[res.pet.id]) {
            newPets[res.pet.id] = { configId: res.pet.id, level: 0, duplicates: 0 };
          } else {
            addOrUpdateItem(`pet_fragment_${res.pet.id}`, 30, 'material', `${res.pet.name}碎片`);
          }
        } else if (res.type === 'upgrade_fragment') {
          addOrUpdateItem('pet_upgrade_fragment', res.amount, 'material');
        } else if (res.type === 'pet_fragment') {
          addOrUpdateItem(`pet_fragment_${res.pet.id}`, res.amount, 'material', `${res.pet.name}碎片`);
        }
      });

      return {
        ...prev,
        player: { ...prev.player, diamonds: prev.player.diamonds - cost, petGachaPity: currentPity, pets: newPets },
        inventory: { ...prev.inventory, items: newItems },
      };
    });

    return { success: true, results: drawnResults, message: `成功抽出 ${times} 次！` };
  };

  const upgradePetSlot = (): { success: boolean; message: string } => {
    const level = gameState.player.petSlotLevel || 1;
    const goldCost = level * 1000;
    const isBreakthrough = level % 10 === 0;
    const fragmentCost = isBreakthrough ? Math.floor(level / 10) * 10 : 0;

    if (gameState.player.money < goldCost) {
      return { success: false, message: '金幣不足！' };
    }

    if (isBreakthrough) {
      const fragItem = gameState.inventory.items.find(i => i.id === 'pet_upgrade_fragment');
      const ownedFragments = fragItem ? fragItem.quantity : 0;
      if (ownedFragments < fragmentCost) {
        return { success: false, message: `需要 ${fragmentCost} 顆寵物強化石！` };
      }
    }

    setGameState(prev => {
      let newItems = [...prev.inventory.items];
      if (isBreakthrough) {
        const fragIndex = newItems.findIndex(i => i.id === 'pet_upgrade_fragment');
        newItems[fragIndex] = { ...newItems[fragIndex], quantity: newItems[fragIndex].quantity - fragmentCost };
        if (newItems[fragIndex].quantity <= 0) newItems.splice(fragIndex, 1);
      }
      return {
        ...prev,
        player: { ...prev.player, money: prev.player.money - goldCost, petSlotLevel: level + 1 },
        inventory: { ...prev.inventory, items: newItems }
      };
    });

    return { success: true, message: '寵物欄位升級成功！' };
  };

  const bulkUpgradePetSlot = (): { success: boolean; message: string; levels: number } => {
    let currentLevel = gameState.player.petSlotLevel || 1;
    let currentMoney = gameState.player.money;

    const fragItem = gameState.inventory.items.find(i => i.id === 'pet_upgrade_fragment');
    let currentFragments = fragItem ? fragItem.quantity : 0;

    const { levelsGained, totalGoldSpent, totalFragmentsSpent, newLevel } = calculateBulkPetSlotUpgrade(currentLevel, currentMoney, currentFragments);

    if (levelsGained === 0) {
      return { success: false, message: '資源不足，無法再升級！', levels: 0 };
    }

    setGameState(prev => {
      let newItems = [...prev.inventory.items];
      if (totalFragmentsSpent > 0) {
        const fragIndex = newItems.findIndex(i => i.id === 'pet_upgrade_fragment');
        if (fragIndex >= 0) {
          newItems[fragIndex] = { ...newItems[fragIndex], quantity: newItems[fragIndex].quantity - totalFragmentsSpent };
          if (newItems[fragIndex].quantity <= 0) newItems.splice(fragIndex, 1);
        }
      }
      return {
        ...prev,
        player: { ...prev.player, money: prev.player.money - totalGoldSpent, petSlotLevel: newLevel },
        inventory: { ...prev.inventory, items: newItems }
      };
    });

    return { success: true, message: `成功一鍵升級 ${levelsGained} 級！`, levels: levelsGained };
  };

  const upgradePet = (configId: string): { success: boolean; message: string } => {
    const isOwned = !!gameState.player.pets[configId];
    const petLevel = isOwned ? gameState.player.pets[configId].level : -1;

    if (petLevel >= PET_UPGRADE_COSTS.length) {
      return { success: false, message: '已經達到最高等級！' };
    }

    const baseCost = petLevel === -1 ? 1 : PET_UPGRADE_COSTS[petLevel];
    const fragmentCost = baseCost * 30;

    const fragId = `pet_fragment_${configId}`;
    const fragItem = gameState.inventory.items.find(i => i.id === fragId);
    const ownedFragments = fragItem ? fragItem.quantity : 0;

    if (ownedFragments < fragmentCost) {
      return { success: false, message: `所需碎片不足！需要 ${fragmentCost} 個碎片 (目前擁有: ${ownedFragments})` };
    }

    setGameState(prev => {
      let newItems = [...prev.inventory.items];
      const fragItemIndex = newItems.findIndex(i => i.id === fragId);
      if (fragItemIndex !== -1) {
        newItems[fragItemIndex] = { ...newItems[fragItemIndex], quantity: newItems[fragItemIndex].quantity - fragmentCost };
      }

      const newPets = { ...prev.player.pets };
      if (!isOwned) {
        newPets[configId] = { configId, level: 0, duplicates: 0 };
      } else {
        newPets[configId] = { ...newPets[configId], level: newPets[configId].level + 1 };
      }

      return {
        ...prev,
        player: { ...prev.player, pets: newPets },
        inventory: { ...prev.inventory, items: newItems }
      };
    });

    return { success: true, message: isOwned ? '寵物升級成功！' : '寵物解鎖成功！' };
  };

  const equipPet = (configId: string | null) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        equippedPetId: configId,
      }
    }));
  };

  const drawArtifactGacha = (times: number): { success: boolean; results: any[], message: string } => {
    const cost = times * 100;
    if (gameState.player.diamonds < cost) {
      return { success: false, results: [], message: '鑽石不足！需 100 鑽石抽取一次。' };
    }

    const drawnResults: any[] = [];

    for (let i = 0; i < times; i++) {
      const rand = Math.random() * 100; // 0 to 100

      const isFull = rand < 1; // 1% chance for full Artifact

      const getRandomWeightedArtifact = () => {
        let totalWeight = 0;
        ARTIFACT_CONFIGS.forEach(c => totalWeight += (c.rarity === 'SR' ? 1 : 2));
        let r = Math.random() * totalWeight;
        for (let c of ARTIFACT_CONFIGS) {
          const weight = c.rarity === 'SR' ? 1 : 2;
          if (r < weight) return c;
          r -= weight;
        }
        return ARTIFACT_CONFIGS[0];
      };

      const randomArtifact = getRandomWeightedArtifact();

      if (isFull) {
        drawnResults.push({ type: 'full', artifact: randomArtifact });
      } else {
        const amount = Math.floor(Math.random() * 9) + 2; // 2-10 fragments
        drawnResults.push({ type: 'fragment', artifact: randomArtifact, amount });
      }
    }

    setGameState(prev => {
      const newArtifacts = { ...prev.player.artifacts };

      drawnResults.forEach(res => {
        const artId = res.artifact.id;
        if (!newArtifacts[artId]) {
          newArtifacts[artId] = { configId: artId, level: 0, fragments: 0 };
        }

        if (res.type === 'full') {
          if (newArtifacts[artId].level === 0) {
            // Unlock if not owned
            newArtifacts[artId].level = 1;
          } else {
            newArtifacts[artId].fragments += 40; // Convert duplicate full artifact to 40 fragments
          }
        } else if (res.type === 'fragment') {
          newArtifacts[artId].fragments += res.amount;
        }
      });

      return {
        ...prev,
        player: { ...prev.player, diamonds: prev.player.diamonds - cost, artifacts: newArtifacts }
      };
    });

    return { success: true, results: drawnResults, message: `成功抽出 ${times} 次！` };
  };

  const upgradeArtifact = (configId: string): { success: boolean; message: string } => {
    const artifact = gameState.player.artifacts[configId];
    if (!artifact) return { success: false, message: '尚未獲取此神器！' };

    const isUnlock = artifact.level === 0;
    const currentTier = Math.max(1, artifact.level);
    const fragmentCost = getArtifactUpgradeCost(currentTier);

    if (fragmentCost === -1) {
      return { success: false, message: '已經達到最高等級！' };
    }

    if (artifact.fragments < fragmentCost) {
      return { success: false, message: `碎片不足！需要 ${fragmentCost} 個碎片 (目前擁有: ${artifact.fragments})` };
    }

    setGameState(prev => {
      const newArtifacts = { ...prev.player.artifacts };
      newArtifacts[configId] = {
        ...newArtifacts[configId],
        level: isUnlock ? 1 : newArtifacts[configId].level + 1,
        fragments: newArtifacts[configId].fragments - fragmentCost,
      };

      return {
        ...prev,
        player: { ...prev.player, artifacts: newArtifacts }
      };
    });

    return { success: true, message: isUnlock ? '神器解鎖成功！' : '神器進階成功！' };
  };

  const equipArtifact = (configId: string, slotIndex: number) => {
    setGameState(prev => {
      const newEquipped = [...prev.player.equippedArtifactIds];
      const currentIndex = newEquipped.indexOf(configId);

      if (currentIndex !== -1) {
        newEquipped[currentIndex] = ''; // Remove from previous slot if already equipped
      }

      newEquipped[slotIndex] = configId;

      return {
        ...prev,
        player: {
          ...prev.player,
          equippedArtifactIds: newEquipped.filter(id => id !== ''), // Clean up empty slots later during stats if needed, or keep order
        }
      };
    });
  };

  const unequipArtifact = (slotIndex: number) => {
    setGameState(prev => {
      const newEquipped = [...prev.player.equippedArtifactIds];
      newEquipped.splice(slotIndex, 1);

      return {
        ...prev,
        player: {
          ...prev.player,
          equippedArtifactIds: newEquipped
        }
      };
    });
  };

  const loadCloudState = (state: GameState | null) => {
    if (state) {
      setGameState(state);
    } else {
      setGameState({
        player: initialPlayer,
        currentBoss: null,
        isFighting: false,
        fightLog: [],
        lastCollectTime: Date.now(),
        inventory: {
          equipment: [],
          items: [],
        },
      });
    }
  };

  const doRebirth = () => {
    setGameState(prev => {
      if (prev.player.level < 2000) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          level: 1,
          stage: 1,
          exp: 0,
          expToNext: getExpToNextLevel(1),
          rebirths: (prev.player.rebirths || 0) + 1,
          attributes: {
            health: 1,
            attack: 5,
            critRate: 0.05,
            critDamage: 0.1,
            defense: 1,
          },
          availablePoints: 0,
          health: 120,
          maxHealth: 120,
          equipment: {
            weapon: null, armor: null, pants: null, gloves: null, ring: null, necklace: null
          },
        },
        inventory: {
          ...prev.inventory,
          equipment: [],
        },
        fightLog: [],
        currentBoss: null,
        isFighting: false
      };
    });
  };

  return {
    gameState,
    collectRewards,
    allocatePoint,
    startFight,
    endFight,
    equipItem,
    unequipItem,
    autoEquipBest,
    addEquipmentToInventory,
    sellItem,
    sellItemsByFilter,
    updatePlayerHealth,
    drawGacha,
    enhanceSlot,
    applyAutoEnhance,
    exchangeGoldForDiamonds,
    drawPetGacha,
    upgradePetSlot,
    bulkUpgradePetSlot,
    upgradePet,
    equipPet,
    drawArtifactGacha,
    upgradeArtifact,
    equipArtifact,
    unequipArtifact,
    loadCloudState,
    doRebirth
  };
};