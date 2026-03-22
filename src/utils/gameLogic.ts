import { Player, Equipment, Boss, PetConfig, PetEffectType, ArtifactConfig } from '../types/game';

export interface ItemConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const BASE_ITEM_CONFIGS: Record<string, Omit<ItemConfig, 'id'>> = {
  money: { name: '金幣', icon: '🪙', description: '基本的交易貨幣' },
  diamonds: { name: '鑽石', icon: '💎', description: '珍貴的抽卡資源' },
  upgrade_stone: { name: '強化石', icon: '🔮', description: '用於強化裝備的神祕石頭' },
  pet_upgrade_fragment: { name: '幼龍碎片', icon: '💠', description: '通用的寵物強化素材' }, // Adjusted to fit Omit<ItemConfig, 'id'>
};

export const ARTIFACT_CONFIGS: ArtifactConfig[] = [
  { id: 'a1_rusted_anvil', name: '鏽蝕鐵砧', effectType: 'enhanceCostReduction', baseValue: 0.05, description: '裝備欄位強化消耗的金幣減少 {val}%', rarity: 'R', passiveType: 'healthPercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a2_sharp_whetstone', name: '鋒利磨刀石', effectType: 'baseAttack', baseValue: 50, description: '基礎攻擊力 +{val}', rarity: 'R', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 50 },
  { id: 'a3_thick_pad', name: '加厚皮墊', effectType: 'baseDefense', baseValue: 30, description: '基礎防禦力 +{val}', rarity: 'R', passiveType: 'defensePercentage', passiveBaseValue: 0.01, levelGrowth: 30 },
  { id: 'a4_blood_bandage', effectType: 'baseHealth', baseValue: 200, description: '基礎生命值 +{val}', rarity: 'R', name: '浸血繃帶', passiveType: 'healthPercentage', passiveBaseValue: 0.01, levelGrowth: 200 },
  { id: 'a5_old_ring', name: '老舊指環', effectType: 'critDamage', baseValue: 0.1, description: '暴擊傷害 +{val}%', rarity: 'R', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a6_observer_monocle', name: '觀察者單鏡', effectType: 'critRate', baseValue: 0.01, description: '暴擊率 +{val}%', rarity: 'R', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a7_battle_banner', name: '戰鬥旗幟', effectType: 'expGain', baseValue: 0.05, description: '掛機獲得的經驗值 +{val}%', rarity: 'R', passiveType: 'healthPercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a8_lucky_pouch', name: '幸運錢袋', effectType: 'goldGain', baseValue: 0.1, description: '掛機獲得的金幣量 +{val}%', rarity: 'R', passiveType: 'defensePercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a9_apprentice_bracers', name: '學徒護腕', effectType: 'baseAttack', baseValue: 50, description: '基礎攻擊力 +{val}', rarity: 'R', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 50 },
  { id: 'a10_rusted_scales', name: '生鏽天平', effectType: 'attackGreaterThanDefenseCritDmg', baseValue: 0.05, description: '若攻擊力大於防禦力，暴擊傷害額外 +{val}%', rarity: 'R', passiveType: 'defensePercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a11_artisan_gloves', name: '工匠手套', effectType: 'upgradeStoneDropRate', baseValue: 0.05, description: '強化石 (🔮) 掉落機率提升 {val}%', rarity: 'R', passiveType: 'healthPercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a12_broken_crest', name: '殘破盾徽', effectType: 'lowHealthDefense', baseValue: 0.15, description: '生命值低於 25% 時，防禦力提升 {val}%', rarity: 'R', passiveType: 'defensePercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a13_ancient_coin', name: '古老硬幣', effectType: 'gachaCostReduction', baseValue: 0.03, description: '裝備抽卡金幣消耗減少 {val}%', rarity: 'R', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a14_pet_collar', name: '寵物項圈', effectType: 'petStoneDropRate', baseValue: 0.03, description: '寵物強化石 (💠) 掉落機率提升 {val}%', rarity: 'R', passiveType: 'healthPercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a15_medal_courage', name: '勇氣勳章', effectType: 'highLevelBossDamage', baseValue: 0.05, description: '對當前等級大於自己的 Boss 傷害 +{val}%', rarity: 'R', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a16_first_aid', name: '急救包', effectType: 'turnHealthRegen', baseValue: 0.01, description: '每 5 回合恢復 {val}% 的最大生命值', rarity: 'R', passiveType: 'healthPercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a17_weighted_lead', name: '負重鉛塊', effectType: 'defenseUpHealthDown', baseValue: 0.05, description: '防禦力 +{val}%，但生命值 -2%', rarity: 'R', passiveType: 'defensePercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a18_worn_boots', name: '磨損皮靴', effectType: 'dodgeRate', baseValue: 0.02, description: '角色閃避率 +{val}%', rarity: 'R', passiveType: 'defensePercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
  { id: 'a19_berserk_heart', name: '狂戰士之心', effectType: 'halfHealthAttackUp', baseValue: 0.5, description: '生命低於 50% 時，攻擊力提升 {val}%', rarity: 'SR', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a20_gold_body', name: '不壞金身', effectType: 'hpToDefense', baseValue: 0.02, description: '將總生命值的 {val}% 轉化為固定防禦力', rarity: 'SR', passiveType: 'defensePercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a21_sniper_scope', name: '精準狙擊鏡', effectType: 'critRate', baseValue: 0.05, description: '暴擊率 +{val}%', rarity: 'SR', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a22_greed_box', name: '貪婪魔盒', effectType: 'bossHighRarityDrop', baseValue: 0.1, description: '擊敗 Boss 有 {val}% 機率掉落紫色以上裝備', rarity: 'SR', passiveType: 'healthPercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a23_phantom_cloak', name: '幻影斗篷', effectType: 'dodgeDamageBoost', baseValue: 1.0, description: '閃避 Boss 攻擊後，下一擊傷害提升 {val}%', rarity: 'SR', passiveType: 'defensePercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a24_giant_spine', name: '巨人之脊', effectType: 'totalHealthMultiplier', baseValue: 0.25, description: '總生命值提升 {val}%', rarity: 'SR', passiveType: 'healthPercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a25_combo_shadow', name: '連擊殘影', effectType: 'doubleAttackChance', baseValue: 0.12, description: '普通攻擊有 {val}% 機率造成兩次傷害', rarity: 'SR', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a26_miser_ring', name: '守財奴指環', effectType: 'goldToAttack', baseValue: 0.2, description: '身上金幣每達 100 萬，攻擊力提升 1% (最高 {val}%)', rarity: 'SR', passiveType: 'defensePercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a27_vengeful_spikes', name: '復仇尖刺', effectType: 'damageReflect', baseValue: 0.15, description: '受到傷害時，反彈 {val}% 的傷害給 Boss（無視防禦）', rarity: 'SR', passiveType: 'healthPercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a28_tactical_manual', name: '戰術手冊', effectType: 'finalDamageMultiplier', baseValue: 0.08, description: '對 Boss 造成的最終傷害總計提升 {val}%', rarity: 'SR', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a29_lucky_rabbit', name: '幸運兔腳', effectType: 'gachaHighRarityBoost', baseValue: 0.5, description: '裝備抽卡出現「金裝以上」的機率額外提升 {val}%', rarity: 'SR', passiveType: 'healthPercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a30_eternal_amulet', name: '永恆護符', effectType: 'highHealthAttackUp', baseValue: 0.15, description: '當生命值高於 80% 時，攻擊力提升 {val}%', rarity: 'SR', passiveType: 'defensePercentage', passiveBaseValue: 0.01, levelGrowth: 0.01 },
  { id: 'a31_master_hammer', name: '鍛造大師錘', effectType: 'enhanceSlotBonusIncrease', baseValue: 0.01, description: '裝備欄位的額外加成效果，每等額外提升 {val}%', rarity: 'SR', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 0.001 }
];

export const getArtifactUpgradeCost = (currentTier: number) => {
  if (currentTier >= 10) return -1;
  return 40 + (currentTier - 1) * 10;
};

export const getArtifactEffectValue = (player: Player, effectType: ArtifactConfig['effectType']) => {
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

export const getItemConfig = (id: string, fallbackName?: string): ItemConfig => {
  if (BASE_ITEM_CONFIGS[id]) {
    return { id, ...BASE_ITEM_CONFIGS[id] };
  }

  if (id.startsWith('pet_fragment_')) {
    return {
      id,
      name: fallbackName || '專屬碎片',
      icon: '🧩',
      description: '可用於解鎖或強化對應寵物'
    };
  }

  return {
    id,
    name: fallbackName || '未知物品',
    icon: '📦',
    description: ''
  };
};

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
  { id: 'nirvana_phoenix', name: '不滅涅槃凰', effectType: 'healthPercentage', baseValue: 0.3, passiveType: 'defensePercentage', passiveBaseValue: 0.03, description: '出戰時在首領戰綻放涅槃之火，每3回合回復大量生命。', rarity: 'SSR', combatSkill: { type: 'heal', triggerTurn: 3, triggerCondition: 'boss', basePercent: 0.1, levelPercent: 0.03 } }
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

export const getEnhanceCost = (level: number, player: Player) => {
  const baseGold = (level + 1) * 200;
  const reduction = getArtifactEffectValue(player, 'enhanceCostReduction');
  const gold = Math.floor(baseGold * (1 - reduction));
  const stones = level >= 10 ? Math.floor(level / 5) * 2 : 0;
  return { gold, stones };
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
      // 修改點 1：除了找最低等級，還必須確保該部位低於玩家等級
      if (slotLevels[slot] < minLevel && slotLevels[slot] < player.level) {
        minLevel = slotLevels[slot];
        minSlot = slot;
      }
    }

    // 修改點 2：如果找不到 minSlot，代表「所有部位都已滿等」或「資源用盡」
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
      // 資源不足，停止強化
      break;
    }
  }

  // 計算缺少資源的提示邏輯
  let missingGold = 0;
  let missingStones = 0;
  let isMaxedOut = false; // 新增：用來判斷是否是因為「等級全滿」才無法強化

  if (!canUpgradeAny) {
    let minLevel = Infinity;
    let minSlot: typeof slots[number] | null = null;

    for (const slot of slots) {
      if (slotLevels[slot] < minLevel) {
        minLevel = slotLevels[slot];
        minSlot = slot;
      }
    }

    // 如果最低等級已經等於玩家等級，代表真的滿了
    if (minSlot && slotLevels[minSlot] >= player.level) {
      isMaxedOut = true;
    } else if (minSlot) {
      // 否則才是真的缺少資源
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
    isMaxedOut // 回傳這個標記，讓 UI 可以顯示「已達等級上限」
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
    const baseValue = config.baseValue * (1 + pet.level);

    if (config.passiveType === 'healthPercentage') hpPercent += effectiveValue;
    else if (config.passiveType === 'attackPercentage') atkPercent += effectiveValue;
    else if (config.passiveType === 'defensePercentage') defPercent += effectiveValue;

    //寵物主動效果
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

export const getTotalStats = (player: Player) => {
  const baseAttack = player.attributes.attack * 2;
  const baseDefense = player.attributes.defense * 2;
  const baseHealth = 100 + player.attributes.health * 20;

  const equipAttack = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'attack', player), 0);
  const equipDefense = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'defense', player), 0);
  const equipHealth = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'health', player), 0);
  const equipCritRate = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'critRate', player), 0);
  const equipCritDamage = Object.entries(player.equipment).reduce((sum, [type, eq]) => sum + getEnhancedStat(eq, player.slotLevels[type as Equipment['type']], 'critDamage', player), 0);

  const petSlotHealth = (player.petSlotLevel || 1) * 10;
  const petSlotAttack = (player.petSlotLevel || 1) * 5;

  const globalPets = getGlobalPetPassiveStats(player);

  const rawTotalAttack = baseAttack + equipAttack + petSlotAttack;
  const rawTotalDefense = baseDefense + equipDefense;
  const rawTotalHealth = baseHealth + equipHealth + petSlotHealth;

  const petHealthBuff = Math.floor(rawTotalHealth * globalPets.hpPercent);
  const petAttackBuff = Math.floor(rawTotalAttack * globalPets.atkPercent);
  const petDefenseBuff = Math.floor(rawTotalDefense * globalPets.defPercent);

  const globalArtifacts = getGlobalArtifactPassiveStats(player);
  const artifactPassiveHealthBuff = Math.floor(rawTotalHealth * globalArtifacts.hpPercent);
  const artifactPassiveAttackBuff = Math.floor(rawTotalAttack * globalArtifacts.atkPercent);
  const artifactPassiveDefenseBuff = Math.floor(rawTotalDefense * globalArtifacts.defPercent);

  // Artifact Base Flat Stats
  const artifactAttack = getArtifactEffectValue(player, 'baseAttack');
  const artifactDefense = getArtifactEffectValue(player, 'baseDefense');
  const artifactHealth = getArtifactEffectValue(player, 'baseHealth');

  const hpToDefenseBuff = Math.floor(rawTotalHealth * getArtifactEffectValue(player, 'hpToDefense'));
  const totalHealthMultiplier = getArtifactEffectValue(player, 'totalHealthMultiplier');

  // 守財奴指環: goldToAttack (上限 Cap 是 baseValue, Rate is 1% per 1M)
  // Wait, user specified "這指的是人物屬性的攻擊最終加成 例如所有攻擊力都計算完畢後攻擊力為1000,那麼穿戴該神器會變為1200(最高Lv10 30%)"
  // Meaning the MAX CAP scales, and it's a multiplier to totalAttack. We apply this later to totalAttack.

  // Artifact Multipliers
  const leadDefPercent = getArtifactEffectValue(player, 'defenseUpHealthDown'); // 5% per level def increase
  const leadHpPercent = leadDefPercent > 0 ? (0.02 * (leadDefPercent / 0.05)) : 0; // -2% per level hp decrease

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

  //每次重生暴擊率提升1%
  const totalCrit = player.attributes.critRate + equipCritRate + artifactCritRate + rebirthAttributeBonus.critRateBonus;
  //每次重生暴擊傷害提升50%
  const totalCritDmg = player.attributes.critDamage + equipCritDamage + artifactCritDmg + rebirthAttributeBonus.critDamageBonus;

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
  };
};

export const calculatePower = (player: Player): number => {
  const stats = getTotalStats(player);
  const cappedCritRate = Math.min(0.6, stats.critRate);
  return Math.floor((stats.attack * (1 + cappedCritRate * (0.5 + stats.critDamage))) + stats.health * 0.1 + stats.defense * 1.0);
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

export const getBossHealth = (stage: number) => {
  //前10關必贏
  if (stage <= 10) {
    return 100;
  }

  // 基礎線性部分
  const baseLinear = 100 + stage * 20;

  // 每 100 關提升一個指數階層 (1.25倍)
  const exponent = Math.floor(stage / 100);
  const multiplier = Math.pow(1.25, exponent);

  return Math.floor(baseLinear * multiplier);
};

export const getBossAttack = (stage: number) => {
  //前10關必贏
  if (stage <= 10) {
    return 10;
  }
  const baseLinear = 10 + stage * 9;

  // 每 100 關提升一個指數階層 (1.25倍)
  const exponent = Math.floor(stage / 100);
  const multiplier = Math.pow(1.12, exponent);

  return Math.floor(baseLinear * multiplier);
};

export const generateBoss = (stage: number): Boss => {
  const baseHealth = getBossHealth(stage);
  const baseAttack = getBossAttack(stage);
  const baseDefense = stage * 2;
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
  // 1. 定義品階基礎價值 (對標抽卡成本 100)
  const rarityBasePrice: Record<Equipment['rarity'], number> = {
    white: 10,    // 10% 回本
    green: 25,    // 25% 回本
    blue: 60,     // 60% 回本
    purple: 150,  // 150% 回本 (開始獲利)
    gold: 800,    // 大幅獲利
    red: 5000,    // 極稀有回饋
  };

  const base = rarityBasePrice[eq.rarity] || 10;

  // 2. 加入微量等級權重 (每 10 等 +1 🪙)
  // 這樣 100 等的紫裝會比 1 等的紫裝貴 10 塊，增加打寶成就感
  const levelBonus = Math.floor(eq.level / 10);

  return base + levelBonus;
};
const generateEquipmentStats = (
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
  // Probabilities: White: 40%, Green: 35%, Blue: 15%, Purple: 8.9%, Gold: 1%, Red: 0.1%
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

export const formatNumber = (num: number): string => {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toString();
};

//獲取重生掛機經驗和金錢加成,每次+100%,裝備欄位+100
export const getRebirthBonus = (player: Player) => {
  const rebirths = player.rebirths;
  const expBonus = rebirths * 1;
  const goldBonus = rebirths * 1;
  const equipmentSlotBonus = rebirths * 100;
  return { expBonus, goldBonus, equipmentSlotBonus };
};

//獲取重生後屬性加成
export const getRebirthAttributeBonus = (player: Player) => {
  const rebirths = player.rebirths;
  const healthBonus = rebirths * 0.2;
  const attackBonus = rebirths * 0.2;
  const defenseBonus = rebirths * 0.2;
  const critRateBonus = rebirths * 0.02;
  const critDamageBonus = rebirths * 10;
  return { healthBonus, attackBonus, defenseBonus, critRateBonus, critDamageBonus };
};