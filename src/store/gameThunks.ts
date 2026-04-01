import { AppDispatch, RootState } from './store';
import { gameActions } from './gameSlice';
import { generateBoss, generateEquipment, getEquipmentValue, generateGachaEquipment, getEnhanceCost, calculateAutoEnhance, calculateBulkPetSlotUpgrade, PET_CONFIGS, PET_UPGRADE_COSTS, getTotalStats, getArtifactEffectValue, ARTIFACT_CONFIGS, getArtifactUpgradeCost, getActivePetBonus, getRebirthBonus, getSalvageStones } from '../utils/logic';
import { Equipment } from '../types/game';

export const collectRewards = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const { game } = getState();
  const now = Date.now();
  const timeDiff = Math.floor((now - game.lastCollectTime) / 1000); 

  const totalStats = getTotalStats(game.player);
  
  const expGained = timeDiff * game.player.stage * 10 * (1 + totalStats.expGain);
  const moneyGained = timeDiff * game.player.stage * 5 * (1 + totalStats.goldGain);

  const minutes = Math.floor(timeDiff / 60);
  const equipments: Equipment[] = [];
  let upgradeStonesGained = 0;
  let petStonesGained = 0;

  for (let i = 0; i < minutes; i++) {
    const eq = generateEquipment(game.player.stage, 0.3, getActivePetBonus(game.player, 'dropRate'));
    if (eq) equipments.push(eq);

    if (Math.random() < 0.05 + getArtifactEffectValue(game.player, 'upgradeStoneDropRate')) upgradeStonesGained++;
    if (Math.random() < 0.02 + getArtifactEffectValue(game.player, 'petStoneDropRate')) petStonesGained++;
  }

  dispatch(gameActions.addExpAndMoney({ exp: expGained, money: moneyGained }));
  dispatch(gameActions.addEquipments(equipments));

  const itemsToAdd = [];
  if (upgradeStonesGained > 0) itemsToAdd.push({ id: 'upgrade_stone', name: '裝備強化石', quantity: upgradeStonesGained });
  if (petStonesGained > 0) itemsToAdd.push({ id: 'pet_upgrade_fragment', name: '幼龍碎片', quantity: petStonesGained });
  if (itemsToAdd.length > 0) dispatch(gameActions.addItems(itemsToAdd));

  dispatch(gameActions.updateLastCollectTime(now));
  dispatch(gameActions.levelUp());

  return { expGained: Math.floor(expGained), moneyGained: Math.floor(moneyGained), timeDiff, equipments };
};

export const exchangeGoldForDiamonds = (amountToSpend: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const { game } = getState();
  if (game.player.money < amountToSpend) return;
  const diamondsGained = Math.floor(amountToSpend / 100);
  if (diamondsGained <= 0) return;
  
  dispatch(gameActions.decreaseMoney(diamondsGained * 100));
  dispatch(gameActions.setPlayerState({ diamonds: game.player.diamonds + diamondsGained }));
};

export const startFight = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const { game } = getState();
  const totalMaxHealth = getTotalStats(game.player).health;
  const boss = generateBoss(game.player.stage);
  
  dispatch(gameActions.setState({
    currentBoss: boss,
    isFighting: true,
    fightLog: [`Challenging ${boss.name}!`],
  }));
  dispatch(gameActions.updatePlayerHealth(totalMaxHealth));
};

export const endFight = (result: 'win' | 'lose', finalPlayerHealth: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const { game } = getState();
  if (!game.currentBoss || !game.isFighting) return;

  if (result === 'win') {
    dispatch(gameActions.pushLog(`You defeated ${game.currentBoss.name}!`));
    dispatch(gameActions.pushLog(`Advanced to stage ${game.player.stage + 1}!`));

    const greedBoxChance = getArtifactEffectValue(game.player, 'bossHighRarityDrop');
    if (greedBoxChance > 0 && Math.random() < greedBoxChance) {
      const roll = Math.random() * 100;
      let forcedRarity = 'purple';
      if (roll < 5) forcedRarity = 'red';
      else if (roll < 30) forcedRarity = 'gold';

      const newEquip = generateEquipment(game.player.level, 1, 0); 
      if (newEquip) {
         newEquip.rarity = forcedRarity as any;
         dispatch(gameActions.pushLog(`🎁 【貪婪魔盒】掉落了稀有裝備！`));
         dispatch(gameActions.addEquipments([newEquip]));
      }
    }

    const goldReward = game.player.stage * 50 * (1 + getArtifactEffectValue(game.player, 'goldGain'));
    const expReward = game.player.stage * 20 * (1 + getArtifactEffectValue(game.player, 'expGain'));

    dispatch(gameActions.setPlayerState({ stage: game.player.stage + 1 }));
    dispatch(gameActions.addExpAndMoney({ exp: expReward, money: goldReward }));
    dispatch(gameActions.updatePlayerHealth(Math.max(0, finalPlayerHealth)));
    dispatch(gameActions.setState({ currentBoss: null, isFighting: false }));
    dispatch(gameActions.levelUp());
  } else {
    dispatch(gameActions.pushLog(`You were defeated by ${game.currentBoss.name}.`));
    dispatch(gameActions.updatePlayerHealth(Math.max(0, finalPlayerHealth)));
    dispatch(gameActions.setState({ currentBoss: null, isFighting: false }));
  }
};

export const autoEquipBest = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const { game } = getState();
  const slots: Equipment['type'][] = ['weapon', 'armor', 'pants', 'gloves', 'ring', 'necklace'];
  
  slots.forEach((slot: Equipment['type']) => {
    const currentlyEquipped = game.player.equipment[slot];
    const candidates = game.inventory.equipment.filter((eq) => eq.type === slot);
    const allCandidates = currentlyEquipped ? [...candidates, currentlyEquipped] : candidates;
    if (allCandidates.length === 0) return;

    const best = allCandidates.reduce((bestSoFar, current) => {
      return getEquipmentValue(current) > getEquipmentValue(bestSoFar) ? current : bestSoFar;
    }, allCandidates[0]);

    if (currentlyEquipped && best.id === currentlyEquipped.id) return;
    dispatch(gameActions.equipItem(best));
  });
};

export const sellItemsByFilter = (filters: number[]) => (dispatch: AppDispatch, getState: () => RootState) => {
  const { game } = getState();
  const toSell: Equipment[] = game.inventory.equipment.filter((eq) => {
    const rarityIndex = ['white', 'green', 'blue', 'purple', 'gold'].indexOf(eq.rarity);
    const isRarityMatch = filters.some((f) => f >= 1 && f <= 5 && rarityIndex === f - 1);
    const equipped = game.player.equipment[eq.type];
    const eqPower = getEquipmentValue(eq);
    const equippedPower = equipped ? getEquipmentValue(equipped) : 0;
    const isLowerOrEqualPower = filters.includes(6) && eqPower <= equippedPower;
    return isRarityMatch || isLowerOrEqualPower;
  });

  toSell.forEach((eq) => {
      dispatch(gameActions.sellItem(eq.id));
  });
};

export const drawGacha = (times: number, isAutoSell: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
  const { game } = getState();
  const costReduction = getArtifactEffectValue(game.player, 'gachaCostReduction');
  const highRarityBoost = getArtifactEffectValue(game.player, 'gachaHighRarityBoost');
  const cost = Math.floor(times * 100 * (1 - costReduction));
  
  if (game.player.money < cost) return { success: false, equipments: [] };

  const newEquipments = [];
  for (let i = 0; i < times; i++) {
    newEquipments.push(generateGachaEquipment(game.player.level, highRarityBoost));
  }

  if (isAutoSell) {
    const toSell = newEquipments.filter(eq => ['white', 'green', 'blue', 'purple', 'gold'].includes(eq.rarity));
    const toKeep = newEquipments.filter(eq => !toSell.includes(eq));
    const totalGainGold = toSell.reduce((sum, item) => sum + getEquipmentValue(item), 0);
    const totalGainStones = toSell.reduce((sum, item) => sum + getSalvageStones(item), 0);
    
    dispatch(gameActions.sellGachaTrashEquipmentsSync({
      equipments: toKeep,
      cost,
      goldReturn: totalGainGold,
      stonesReturn: totalGainStones
    }));
    return { success: true, equipments: toKeep, totalGainGold, totalGainStones };
  }

  dispatch(gameActions.addGachaEquipmentsSync({ equipments: newEquipments, cost }));
  return { success: true, equipments: newEquipments };
};

export const enhanceSlot = (slotType: Equipment['type']) => (dispatch: AppDispatch, getState: () => RootState) => {
  const { game } = getState();
  const currentLevel = game.player.slotLevels[slotType as Equipment['type']];
  const { gold, stones } = getEnhanceCost(currentLevel, game.player);

  if (game.player.money < gold) return { success: false, message: '金錢不足' };

  let stoneIndex = game.inventory.items.findIndex(i => i.id === 'upgrade_stone');
  const currentStones = stoneIndex >= 0 ? game.inventory.items[stoneIndex].quantity : 0;

  if (stones > 0 && currentStones < stones) return { success: false, message: `需要 ${stones} 個強化石` };

  dispatch(gameActions.decreaseMoney(gold));
  if (stones > 0) dispatch(gameActions.decreaseItemQuantity({ id: 'upgrade_stone', amount: stones }));
  dispatch(gameActions.setEquipmentSlotLevel({ slot: slotType, level: currentLevel + 1 }));
  
  return { success: true };
};

export const applyAutoEnhance = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const { game } = getState();
  let stoneIndex = game.inventory.items.findIndex((i) => i.id === 'upgrade_stone');
  const currentStones = stoneIndex >= 0 ? game.inventory.items[stoneIndex].quantity : 0;

  const result = calculateAutoEnhance(game.player, currentStones);
  if (!result.canUpgradeAny) return result;

  dispatch(gameActions.setAutoEnhanceResult({
    totalGoldSpent: result.totalGoldSpent,
    totalStonesSpent: result.totalStonesSpent,
    finalLevels: result.finalLevels
  }));

  return result;
};

export const drawPetGacha = (times: number) => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    const cost = times * 100;
    if (game.player.diamonds < cost) {
      return { success: false, results: [], message: '鑽石不足！需 100 鑽石抽取一次。' };
    }

    let currentPity = game.player.petGachaPity || 0;
    const drawnResults: any[] = [];
    const newItemsCount: Record<string, number> = {};
    const unlockPets: string[] = [];

    for (let i = 0; i < times; i++) {
        currentPity++;
        const rand = Math.random() * 100;
        let isFullSSR = false, isFullSR = false, isSSRFrag = false, isSRFrag = false;

        if (currentPity >= 100) {
            if (Math.random() * 1.05 < 0.05) isFullSSR = true; else isFullSR = true;
        } else {
            if (rand < 0.05) isFullSSR = true; else if (rand < 1.05) isFullSR = true; else if (rand < 2.05) isSSRFrag = true; else if (rand < 12.05) isSRFrag = true;
        }

        if (isFullSSR || isFullSR) {
            currentPity = 0;
            const rarityList = PET_CONFIGS.filter((p) => p.rarity === (isFullSSR ? 'SSR' : 'SR'));
            const randomPet = rarityList[Math.floor(Math.random() * rarityList.length)];
            drawnResults.push({ type: 'full', pet: randomPet });
            if (!game.player.pets[randomPet.id]) unlockPets.push(randomPet.id);
            else newItemsCount[`pet_fragment_${randomPet.id}`] = (newItemsCount[`pet_fragment_${randomPet.id}`] || 0) + 30;
        } else if (isSSRFrag || isSRFrag) {
            const rarityList = PET_CONFIGS.filter(p => p.rarity === (isSSRFrag ? 'SSR' : 'SR'));
            const randomPet = rarityList[Math.floor(Math.random() * rarityList.length)];
            const amount = Math.floor(Math.random() * 9) + 2;
            drawnResults.push({ type: 'pet_fragment', pet: randomPet, amount });
            newItemsCount[`pet_fragment_${randomPet.id}`] = (newItemsCount[`pet_fragment_${randomPet.id}`] || 0) + amount;
        } else {
            const amount = Math.floor(Math.random() * 3) + 1;
            drawnResults.push({ type: 'upgrade_fragment', amount });
            newItemsCount[`pet_upgrade_fragment`] = (newItemsCount[`pet_upgrade_fragment`] || 0) + amount;
        }
    }

    dispatch(gameActions.setPlayerState({ petGachaPity: currentPity, diamonds: game.player.diamonds - cost }));
    unlockPets.forEach((id) => dispatch(gameActions.addPetDuplicate({ id, amount: 0 })));
    Object.entries(newItemsCount).forEach(([id, qty]) => {
         const name = id === 'pet_upgrade_fragment' ? '幼龍碎片' : '專屬碎片';
         dispatch(gameActions.addItems([{ id, name, quantity: qty }]));
    });

    return { success: true, results: drawnResults, message: `成功抽出 ${times} 次！` };
};

export const upgradePetSlot = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    const level = game.player.petSlotLevel || 1;
    const goldCost = level * 1000;
    const isBreakthrough = level % 10 === 0;
    const fragmentCost = isBreakthrough ? Math.floor(level / 10) * 10 : 0;

    if (game.player.money < goldCost) return { success: false, message: '金幣不足！' };

    if (isBreakthrough) {
      const fragItem = game.inventory.items.find((i) => i.id === 'pet_upgrade_fragment');
      const ownedFragments = fragItem ? fragItem.quantity : 0;
      if (ownedFragments < fragmentCost) return { success: false, message: `需要 ${fragmentCost} 顆寵物強化石！` };
    }

    dispatch(gameActions.upgradePetSlotSync({ gold: goldCost, fragments: fragmentCost, levels: 1 }));
    return { success: true, message: '寵物欄位升級成功！' };
};

export const bulkUpgradePetSlot = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    const fragItem = game.inventory.items.find((i) => i.id === 'pet_upgrade_fragment');
    const { levelsGained, totalGoldSpent, totalFragmentsSpent } = calculateBulkPetSlotUpgrade(game.player.petSlotLevel || 1, game.player.money, fragItem ? fragItem.quantity : 0);

    if (levelsGained === 0) return { success: false, message: '資源不足，無法再升級！', levels: 0 };

    dispatch(gameActions.upgradePetSlotSync({ gold: totalGoldSpent, fragments: totalFragmentsSpent, levels: levelsGained }));
    return { success: true, message: `成功一鍵升級 ${levelsGained} 級！`, levels: levelsGained };
};

export const upgradePet = (configId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    const isOwned = !!game.player.pets[configId];
    const petLevel = isOwned ? game.player.pets[configId].level : -1;

    if (petLevel >= PET_UPGRADE_COSTS.length) return { success: false, message: '已經達到最高等級！' };

    const baseCost = petLevel === -1 ? 1 : PET_UPGRADE_COSTS[petLevel];
    const fragmentCost = baseCost * 30;

    const fragId = `pet_fragment_${configId}`;
    const fragItem = game.inventory.items.find((i) => i.id === fragId);
    const ownedFragments = fragItem ? fragItem.quantity : 0;

    if (ownedFragments < fragmentCost) return { success: false, message: `所需碎片不足！需要 ${fragmentCost} 個碎片 (目前擁有: ${ownedFragments})` };

    dispatch(gameActions.decreaseItemQuantity({ id: fragId, amount: fragmentCost }));
    if (!isOwned) {
        dispatch(gameActions.addPetDuplicate({ id: configId, amount: 0 }));
    } else {
        dispatch(gameActions.levelUpPet({ id: configId, cost: 0 })); 
    }

    return { success: true, message: isOwned ? '寵物升級成功！' : '寵物解鎖成功！' };
};

export const drawArtifactGacha = (times: number) => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    const cost = times * 100;
    if (game.player.diamonds < cost) {
      return { success: false, results: [], message: '鑽石不足！需 100 鑽石抽取一次。' };
    }

    const drawnResults: any[] = [];
    const unlocks: string[] = [];
    const adds: Record<string, number> = {};

    for (let i = 0; i < times; i++) {
        const rand = Math.random() * 100;
        const isFull = rand < 1;

        const getRandomWeightedArtifact = () => {
             let totalWeight = 0;
             ARTIFACT_CONFIGS.forEach((c) => totalWeight += (c.rarity === 'SR' ? 1 : 2));
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
            if (!game.player.artifacts[randomArtifact.id] || game.player.artifacts[randomArtifact.id].level === 0) {
                 unlocks.push(randomArtifact.id);
            } else {
                 adds[randomArtifact.id] = (adds[randomArtifact.id] || 0) + 40;
            }
        } else {
            const amount = Math.floor(Math.random() * 9) + 2;
            drawnResults.push({ type: 'fragment', artifact: randomArtifact, amount });
            adds[randomArtifact.id] = (adds[randomArtifact.id] || 0) + amount;
        }
    }

    dispatch(gameActions.decreaseDiamonds(cost));
    unlocks.forEach((id) => {
         dispatch(gameActions.addArtifactFragment({ id, amount: 0 }));
         dispatch(gameActions.upgradeArtifactSync({ id, cost: 0 })); 
    });
    Object.entries(adds).forEach(([id, amt]) => dispatch(gameActions.addArtifactFragment({ id, amount: amt })));

    return { success: true, results: drawnResults, message: `成功抽出 ${times} 次！` };
};

export const upgradeArtifact = (configId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    const artifact = game.player.artifacts[configId];
    if (!artifact) return { success: false, message: '尚未獲取此神器！' };

    const isUnlock = artifact.level === 0;
    const currentTier = Math.max(1, artifact.level);
    const fragmentCost = getArtifactUpgradeCost(currentTier);

    if (fragmentCost === -1) return { success: false, message: '已經達到最高等級！' };
    if (artifact.fragments < fragmentCost) return { success: false, message: `碎片不足！需要 ${fragmentCost} 個碎片 (目前擁有: ${artifact.fragments})` };

    dispatch(gameActions.upgradeArtifactSync({ id: configId, cost: fragmentCost }));
    return { success: true, message: isUnlock ? '神器解鎖成功！' : '神器進階成功！' };
};

export const unlockMegaPet = (index: number) => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    if (game.player.rebirths < 2) return { success: false, message: '需達成 2 次轉生' };
    const unlockingCost = 200000000 * Math.pow(2, index);
    if (game.player.diamonds < unlockingCost) return { success: false, message: `鑽石不足！需要 ${unlockingCost.toLocaleString()} 鑽石` };
    
    dispatch(gameActions.decreaseDiamonds(unlockingCost));
    dispatch(gameActions.unlockMegaPetSync({ cost: 0, index }));
    return { success: true, message: '解鎖成功！' };
};

export const rerollMegaPetStats = (index: number, lock0: boolean, lock1: boolean, lock2: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    const lockedCount = [lock0, lock1, lock2].filter(l => l).length;
    let cost = 10000000;
    if (lockedCount === 1) cost = 20000000;
    if (lockedCount === 2) cost = 50000000;
    if (lockedCount === 3) return { success: false, message: '不能全部鎖定！' };

    if (game.player.diamonds < cost) return { success: false, message: `鑽石不足！需要 ${cost} 鑽石` };

    const randomType = () => {
        const rand = Math.random();
        if (rand < 0.293) return 'attack';
        if (rand < 0.586) return 'defense';
        if (rand < 0.879) return 'health';
        if (rand < 0.929) return 'critRate';
        if (rand < 0.979) return 'critDamage';
        if (rand < 0.989) return 'expGain';
        if (rand < 0.999) return 'goldGain';
        return 'bossDamage';
    };

    dispatch(gameActions.decreaseDiamonds(cost));
    if (!lock0) dispatch(gameActions.rerollMegaPetSlotSync({ petIndex: index, slotIndex: 0, newType: randomType(), cost: 0 }));
    if (!lock1) dispatch(gameActions.rerollMegaPetSlotSync({ petIndex: index, slotIndex: 1, newType: randomType(), cost: 0 }));
    if (!lock2) dispatch(gameActions.rerollMegaPetSlotSync({ petIndex: index, slotIndex: 2, newType: randomType(), cost: 0 }));

    return { success: true, message: '重製成功！' };
};

export const levelUpMegaPet = (index: number) => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    const cost = 100 + game.player.megaPets[index].level * 20;
    const item = game.inventory.items.find((i: any) => i.id === 'mega_pet_fragment');
    if (!item || item.quantity < cost) return { success: false, message: `碎片不足！需要 ${cost} 碎片` };
    
    dispatch(gameActions.upgradeMegaPetSync({ cost, index }));
    return { success: true, message: '升級成功' };
};

export const drawMegaPetGacha = (times: number) => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    const cost = times * 1000000;
    if (game.player.diamonds < cost) return { success: false, message: '鑽石不足' };
    
    let totalFrags = 0;
    const results: any[] = [];
    for(let i=0; i<times; i++) {
        const drop = Math.floor(Math.random() * 2) + 1; // 1-2
        totalFrags += drop;
        results.push({ type: 'mega_pet_fragment', amount: drop });
    }
    
    dispatch(gameActions.megaPetGachaSync({ cost, fragmentsGot: totalFrags }));
    return { success: true, message: `抽出 ${totalFrags} 個萌獸碎片`, results };
};

export const doRebirth = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const { game } = getState();
    const nextRebirthLevel = 2000 + (game.player.rebirths * 200);
    if (game.player.level < nextRebirthLevel) return;

    dispatch(gameActions.setState({
       player: {
          ...game.player,
          level: 1, stage: 1, exp: 0,
          expToNext: 1000,
          rebirths: game.player.rebirths + 1,
          attributes: { health: 1, attack: 5, critRate: 0.05, critDamage: 0.1, defense: 1 },
          availablePoints: 0, health: 120, maxHealth: 120,
          equipment: { weapon: null, armor: null, pants: null, gloves: null, ring: null, necklace: null },
          slotLevels: { weapon: 1, armor: 1, pants: 1, gloves: 1, ring: 1, necklace: 1 }
       },
       inventory: {
          ...game.inventory,
          equipment: []
       },
       fightLog: [],
       isFighting: false
    }));
};
