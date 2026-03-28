import { PetConfig, ArtifactConfig, Rarity } from '../../types/game';

export interface ItemConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity?: Rarity;
}

export const BASE_ITEM_CONFIGS: Record<string, Omit<ItemConfig, 'id'>> = {
  money: { name: '金幣', icon: '🪙', description: '基本的交易貨幣', rarity: 'white' },
  diamonds: { name: '鑽石', icon: '💎', description: '珍貴的抽卡資源', rarity: 'blue' },
  upgrade_stone: { name: '強化石', icon: '🔮', description: '用於強化裝備的神祕石頭', rarity: 'gold' },
  pet_upgrade_fragment: { name: '幼龍碎片', icon: '💠', description: '通用的寵物強化素材', rarity: 'purple' },
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
  { id: 'a15_medal_courage', name: '勇氣勳章', effectType: 'finalDamageMultiplier', baseValue: 0.05, description: '對 Boss 造成的傷害總計提升 {val}%', rarity: 'R', passiveType: 'attackPercentage', passiveBaseValue: 0.01, levelGrowth: 0.005 },
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

export const PET_UPGRADE_COSTS = [1, 2, 4, 8, 16, 32];

export const MEGA_PET_STAT_BASE: Record<string, number> = {
  attack: 0.6,
  defense: 0.6,
  health: 0.6,
  critRate: 0.03,
  critDamage: 30, // 3000%
  expGain: 3, // 300%
  goldGain: 3, // 300%
  bossDamage: 0.6, // 60%
};

export const MEGA_PET_STAT_GROWTH: Record<string, number> = {
  attack: 0.1,  // 10%
  defense: 0.1,
  health: 0.1,
  critRate: 0.01, // 1%
  critDamage: 2,  // 200%
  expGain: 0.1,
  goldGain: 0.1,
  bossDamage: 0.1,
};

export const PET_CONFIGS: PetConfig[] = [
  { id: 'fortune_cat', name: '金角招財貓', effectType: ['goldGain'], baseValue: 0.1, passiveType: 'healthPercentage', passiveBaseValue: 0.01, description: '搖一搖手，金幣自然跟著走。', rarity: 'SR' },
  { id: 'gold_beetle', name: '黃金甲殼蟲', effectType: ['goldGain'], baseValue: 0.1, passiveType: 'defensePercentage', passiveBaseValue: 0.01, description: '身體由純金打造，路過都會掉金粉。', rarity: 'SR' },
  { id: 'wise_owl', name: '智慧小梟', effectType: ['expGain'], baseValue: 0.1, passiveType: 'attackPercentage', passiveBaseValue: 0.01, description: '牠看過的書比你打過的怪還多。', rarity: 'SR' },
  { id: 'time_rabbit', name: '時光沙漏兔', effectType: ['expGain'], baseValue: 0.1, passiveType: 'healthPercentage', passiveBaseValue: 0.01, description: '牠能縮短大腦吸收戰鬥技巧的時間。', rarity: 'SR' },
  { id: 'treasure_hound', name: '尋寶獵犬', effectType: ['dropRate'], baseValue: 0.1, passiveType: 'attackPercentage', passiveBaseValue: 0.01, description: '嗅覺靈敏，總能從死掉的怪身上翻出寶貝。', rarity: 'SR' },
  { id: 'lucky_frog', name: '幸運青蛙', effectType: ['dropRate'], baseValue: 0.1, passiveType: 'defensePercentage', passiveBaseValue: 0.01, description: '呱！據說摸摸牠的頭，運氣會變好。', rarity: 'SR' },
  { id: 'steel_turtle', name: '鋼鐵巨龜', effectType: ['healthPercentage'], baseValue: 0.1, passiveType: 'healthPercentage', passiveBaseValue: 0.01, description: '穩如泰山，賦予主人如甲殼般的生命力。', rarity: 'SR' },
  { id: 'flame_tiger', name: '烈焰幼虎', effectType: ['attackPercentage'], baseValue: 0.1, passiveType: 'attackPercentage', passiveBaseValue: 0.01, description: '體內燃燒著戰意，讓主人的武器更鋒利。', rarity: 'SR' },
  { id: 'gargoyle_imp', name: '石像小鬼', effectType: ['defensePercentage'], baseValue: 0.1, passiveType: 'defensePercentage', passiveBaseValue: 0.01, description: '堅硬的外皮是主人最強的後盾。', rarity: 'SR' },
  { id: 'holy_unicorn', name: '神聖獨角獸', effectType: ['defensePercentage'], baseValue: 0.1, passiveType: 'healthPercentage', passiveBaseValue: 0.01, description: '淨化氣息，提升主人抵禦傷害的能力。', rarity: 'SR' },
  { id: 'time_dragon', name: '時序幻龍', effectType: ['goldGain', 'expGain'], baseValue: 0.5, passiveType: 'attackPercentage', passiveBaseValue: 0.03, description: '扭曲時序，出戰時經驗與金幣雙重巨量提升。', rarity: 'SSR' },
  { id: 'nirvana_phoenix', name: '不滅涅槃凰', effectType: ['healthPercentage'], baseValue: 0.3, passiveType: 'defensePercentage', passiveBaseValue: 0.03, description: '出戰時在首領戰綻放涅槃之火，每3回合回復大量生命。', rarity: 'SSR', combatSkill: { type: 'heal', triggerTurn: 3, triggerCondition: 'boss', basePercent: 0.1, levelPercent: 0.03 } }
];

export const getItemConfig = (id: string, fallbackName?: string): ItemConfig => {
  if (BASE_ITEM_CONFIGS[id]) {
    return { id, ...BASE_ITEM_CONFIGS[id] };
  }

  if (id === 'mega_pet_fragment') {
    return {
      id,
      name: fallbackName || '萌獸碎片',
      icon: '🧩',
      description: '極度稀有的萌獸強化與解鎖素材',
      rarity: 'red'
    };
  }

  if (id.startsWith('pet_fragment_')) {
    const petId = id.replace('pet_fragment_', '');
    const petConfig = PET_CONFIGS.find(p => p.id === petId);
    let r: Rarity = 'blue';
    if (petConfig) {
       if (petConfig.rarity === 'SR') r = 'purple';
       if (petConfig.rarity === 'SSR') r = 'gold';
    }
    return {
      id,
      name: fallbackName || (petConfig ? `${petConfig.name}碎片` : '專屬碎片'),
      icon: '🧩',
      description: '可用於解鎖或強化對應寵物',
      rarity: r
    };
  }

  if (id.startsWith('artifact_fragment_')) {
    const artifactId = id.replace('artifact_fragment_', '');
    const artifactConfig = ARTIFACT_CONFIGS.find(a => a.id === artifactId);
    let r: Rarity = 'blue';
    if (artifactConfig) {
      if (artifactConfig.rarity === 'SR') r = 'purple';
      if (artifactConfig.rarity === 'SSR') r = 'gold';
    }
    return {
      id,
      name: fallbackName || (artifactConfig ? `${artifactConfig.name}碎片` : '神器碎片'),
      icon: '🧩',
      description: '可用於解鎖對應神器',
      rarity: r
    };
  }

  return {
    id,
    name: fallbackName || '未知物品',
    icon: '📦',
    description: '',
    rarity: 'white'
  };
};
