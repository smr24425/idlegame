import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Player, Equipment } from '../types/game';
import { getExpToNextLevel, getTotalStats, getEquipmentValue, getSalvageStones } from '../utils/logic';
import { initialPlayer } from './initialState';

const getInitialState = (): GameState => {
  const saved = localStorage.getItem('idleGameState');
  if (saved) {
    const parsed = JSON.parse(saved);
    parsed.player.expToNext = getExpToNextLevel(parsed.player.level);
    parsed.player.maxHealth = 100 + (parsed.player.attributes?.health || 0) * 20;
    parsed.player.artifacts = parsed.player.artifacts || {};
    parsed.player.equippedArtifactIds = parsed.player.equippedArtifactIds || ['', '', ''];
    parsed.player.health = Math.min(parsed.player.health, parsed.player.maxHealth);
    parsed.player.attributes = { ...initialPlayer.attributes, ...parsed.player.attributes };
    parsed.player.equipment = { ...initialPlayer.equipment, ...parsed.player.equipment };
    parsed.player.availablePoints = parsed.player.availablePoints || 0;
    parsed.player.stage = parsed.player.stage || 1;
    parsed.player.level = parsed.player.level || 1;
    parsed.player.exp = parsed.player.exp || 0;
    parsed.player.money = parsed.player.money || 0;
    parsed.player.diamonds = parsed.player.diamonds || 0;
    parsed.player.pets = parsed.player.pets || {};
    if (parsed.player.equippedPetId === undefined) parsed.player.equippedPetId = null;
    parsed.player.rebirths = parsed.player.rebirths || 0;
    // 萌獸系統轉移相容
    if (parsed.player.megaPet) {
      const oldMegaPet = parsed.player.megaPet;
      parsed.player.megaPets = [oldMegaPet, { unlocked: false, level: 1, slots: [{ type: null }, { type: null }, { type: null }] }, { unlocked: false, level: 1, slots: [{ type: null }, { type: null }, { type: null }] }];
      parsed.player.activeMegaPetIndex = oldMegaPet.unlocked ? 0 : null;
      delete parsed.player.megaPet;
    } else if (!parsed.player.megaPets) {
      parsed.player.megaPets = [
        { unlocked: false, level: 1, slots: [{ type: null }, { type: null }, { type: null }] },
        { unlocked: false, level: 1, slots: [{ type: null }, { type: null }, { type: null }] },
        { unlocked: false, level: 1, slots: [{ type: null }, { type: null }, { type: null }] }
      ];
      parsed.player.activeMegaPetIndex = null;
    }
    parsed.inventory = { equipment: parsed.inventory?.equipment || [], items: parsed.inventory?.items || [] };
    parsed.player.slotLevels = { ...initialPlayer.slotLevels, ...parsed.player.slotLevels };
    return parsed;
  }
  return {
    player: initialPlayer,
    currentBoss: null,
    isFighting: false,
    fightLog: [],
    lastCollectTime: Date.now(),
    inventory: { equipment: [], items: [] },
  };
};

export const gameSlice = createSlice({
  name: 'game',
  initialState: getInitialState(),
  reducers: {
    // Basic mutations
    setState(state, action: PayloadAction<Partial<GameState>>) {
      Object.assign(state, action.payload);
    },
    setPlayerState(state, action: PayloadAction<Partial<Player>>) {
      Object.assign(state.player, action.payload);
    },
    updateLastCollectTime(state, action: PayloadAction<number>) {
      state.lastCollectTime = action.payload;
    },
    addExpAndMoney(state, action: PayloadAction<{ exp: number; money: number }>) {
      state.player.exp += action.payload.exp;
      state.player.money += action.payload.money;
    },
    addEquipments(state, action: PayloadAction<Equipment[]>) {
      state.inventory.equipment.push(...action.payload);
    },
    addItems(state, action: PayloadAction<{ id: string; name: string; quantity: number }[]>) {
      for (const item of action.payload) {
        if (item.quantity <= 0) continue;
        const idx = state.inventory.items.findIndex(i => i.id === item.id);
        if (idx >= 0) state.inventory.items[idx].quantity += item.quantity;
        else state.inventory.items.push({ id: item.id, name: item.name, type: 'material', quantity: item.quantity });
      }
    },
    pushLog(state, action: PayloadAction<string>) {
      state.fightLog.push(action.payload);
    },
    clearLog(state) {
      state.fightLog = [];
    },
    levelUp(state) {
      let newLevel = state.player.level;
      let newExp = state.player.exp;
      let newAvailablePoints = state.player.availablePoints;

      while (newExp >= getExpToNextLevel(newLevel)) {
        newExp -= getExpToNextLevel(newLevel);
        newLevel += 1;
        newAvailablePoints += 5;
      }

      state.player.level = newLevel;
      state.player.exp = newExp;
      state.player.expToNext = getExpToNextLevel(newLevel);
      state.player.availablePoints = newAvailablePoints;
      
      const totalStats = getTotalStats(state.player);
      state.player.maxHealth = totalStats.health;
      state.player.health = Math.min(state.player.health, state.player.maxHealth);
    },
    allocatePoint(state, action: PayloadAction<keyof Player['attributes']>) {
      if (state.player.availablePoints <= 0) return;
      const attr = action.payload;
      if (attr === 'critRate' || attr === 'critDamage') {
        state.player.attributes[attr] = parseFloat((state.player.attributes[attr] + 0.01).toFixed(2)) as number;
      } else {
        state.player.attributes[attr]++;
      }
      state.player.availablePoints--;
      const newMaxHealth = getTotalStats(state.player).health;
      state.player.maxHealth = newMaxHealth;
      state.player.health = Math.min(state.player.health, newMaxHealth);
    },
    equipItem(state, action: PayloadAction<Equipment>) {
      const equip = action.payload;
      const type = equip.type;
      const oldItem = state.player.equipment[type];
      state.player.equipment[type] = equip;
      state.inventory.equipment = state.inventory.equipment.filter(e => e.id !== equip.id);
      if (oldItem) state.inventory.equipment.push(oldItem);
    },
    unequipItem(state, action: PayloadAction<keyof Player['equipment']>) {
      const type = action.payload;
      const item = state.player.equipment[type];
      if (item) {
        state.player.equipment[type] = null;
        state.inventory.equipment.push(item);
      }
    },
    sellItem(state, action: PayloadAction<string>) {
      const eqId = action.payload;
      const idx = state.inventory.equipment.findIndex(e => e.id === eqId);
      if (idx === -1) return;
      const item = state.inventory.equipment[idx];
      const gold = getEquipmentValue(item);
      const stones = getSalvageStones(item);
      state.player.money += gold;
      state.inventory.equipment.splice(idx, 1);
      
      if (stones > 0) {
        const sIdx = state.inventory.items.findIndex(i => i.id === 'upgrade_stone');
        if (sIdx >= 0) state.inventory.items[sIdx].quantity += stones;
        else state.inventory.items.push({ id: 'upgrade_stone', name: '裝備強化石', type: 'material', quantity: stones });
      }
    },
    updatePlayerHealth(state, action: PayloadAction<number>) {
      state.player.health = Math.max(0, action.payload);
    },
    decreaseItemQuantity(state, action: PayloadAction<{ id: string; amount: number }>) {
      const { id, amount } = action.payload;
      const item = state.inventory.items.find(i => i.id === id);
      if (item) item.quantity = Math.max(0, item.quantity - amount);
    },
    decreaseMoney(state, action: PayloadAction<number>) {
      state.player.money -= action.payload;
    },
    decreaseDiamonds(state, action: PayloadAction<number>) {
      state.player.diamonds -= action.payload;
    },
    setEquipmentSlotLevel(state, action: PayloadAction<{ slot: keyof Player['equipment'], level: number }>) {
      state.player.slotLevels[action.payload.slot] = action.payload.level;
    },
    setAutoEnhanceResult(state, action: PayloadAction<{ totalGoldSpent: number, totalStonesSpent: number, finalLevels: any }>) {
      state.player.money -= action.payload.totalGoldSpent;
      const sIdx = state.inventory.items.findIndex(i => i.id === 'upgrade_stone');
      if (sIdx >= 0) state.inventory.items[sIdx].quantity -= action.payload.totalStonesSpent;
      state.player.slotLevels = action.payload.finalLevels;
    },
    // Gacha actions that mutate cleanly
    addGachaEquipmentsSync(state, action: PayloadAction<{ equipments: Equipment[], cost: number }>) {
      state.player.money -= action.payload.cost;
      state.inventory.equipment.push(...action.payload.equipments);
    },
    sellGachaTrashEquipmentsSync(state, action: PayloadAction<{ equipments: Equipment[], cost: number, goldReturn: number, stonesReturn: number }>) {
      state.player.money -= action.payload.cost;
      state.player.money += action.payload.goldReturn;
      
      if (action.payload.stonesReturn > 0) {
        const sIdx = state.inventory.items.findIndex(i => i.id === 'upgrade_stone');
        if (sIdx >= 0) state.inventory.items[sIdx].quantity += action.payload.stonesReturn;
        else state.inventory.items.push({ id: 'upgrade_stone', name: '裝備強化石', type: 'material', quantity: action.payload.stonesReturn });
      }

      state.inventory.equipment.push(...action.payload.equipments);
    },

    // Pet / Artifact basic state setters
    setEquippedPet(state, action: PayloadAction<string | null>) {
      state.player.equippedPetId = action.payload;
    },
    addPetDuplicate(state, action: PayloadAction<{ id: string, amount: number }>) {
      if (state.player.pets[action.payload.id]) {
        state.player.pets[action.payload.id].duplicates += action.payload.amount;
      } else {
        state.player.pets[action.payload.id] = { configId: action.payload.id, level: 0, duplicates: action.payload.amount };
      }
    },
    levelUpPet(state, action: PayloadAction<{ id: string, cost: number }>) {
      state.player.pets[action.payload.id].duplicates -= action.payload.cost;
      state.player.pets[action.payload.id].level += 1;
    },
    upgradePetSlotSync(state, action: PayloadAction<{ gold: number, fragments: number, levels: number }>) {
      state.player.money -= action.payload.gold;
      const fragIdx = state.inventory.items.findIndex(i => i.id === 'pet_upgrade_fragment');
      if (fragIdx >= 0) state.inventory.items[fragIdx].quantity -= action.payload.fragments;
      state.player.petSlotLevel += action.payload.levels;
    },
    addArtifactFragment(state, action: PayloadAction<{ id: string, amount: number }>) {
      if (state.player.artifacts[action.payload.id]) {
        state.player.artifacts[action.payload.id].fragments += action.payload.amount;
      } else {
        state.player.artifacts[action.payload.id] = { configId: action.payload.id, level: 0, fragments: action.payload.amount };
      }
    },
    upgradeArtifactSync(state, action: PayloadAction<{ id: string, cost: number }>) {
      state.player.artifacts[action.payload.id].fragments -= action.payload.cost;
      state.player.artifacts[action.payload.id].level += 1;
    },
    setActiveMegaPetIndex: (state, action: PayloadAction<number | null>) => {
      state.player.activeMegaPetIndex = action.payload;
    },
    equipArtifactSync(state, action: PayloadAction<{ slot: number, id: string }>) {
      state.player.equippedArtifactIds[action.payload.slot] = action.payload.id;
    },
    unequipArtifactSync(state, action: PayloadAction<{ slot: number }>) {
      state.player.equippedArtifactIds[action.payload.slot] = '';
    },
    buyPetStonesSync(state, action: PayloadAction<{ cost: number, amount: number }>) {
      state.player.diamonds -= action.payload.cost;
      const idx = state.inventory.items.findIndex(i => i.id === 'pet_upgrade_fragment');
      if (idx >= 0) state.inventory.items[idx].quantity += action.payload.amount;
      else state.inventory.items.push({ id: 'pet_upgrade_fragment', name: '幼龍碎片', type: 'material', quantity: action.payload.amount });
    },
    megaPetGachaSync(state, action: PayloadAction<{ cost: number, fragmentsGot: number }>) {
      state.player.diamonds -= action.payload.cost;
      const fIdx = state.inventory.items.findIndex(i => i.id === 'mega_pet_fragment');
      if (fIdx >= 0) state.inventory.items[fIdx].quantity += action.payload.fragmentsGot;
      else state.inventory.items.push({ id: 'mega_pet_fragment', name: '萌獸碎片', type: 'material', quantity: action.payload.fragmentsGot });
    },
    unlockMegaPetSync(state, action: PayloadAction<{ cost: number, index: number }>) {
      const idx = state.inventory.items.findIndex(i => i.id === 'mega_pet_fragment');
      if (idx >= 0) state.inventory.items[idx].quantity -= action.payload.cost;
      state.player.megaPets[action.payload.index].unlocked = true;
      if (state.player.activeMegaPetIndex === null) state.player.activeMegaPetIndex = action.payload.index;
    },
    upgradeMegaPetSync(state, action: PayloadAction<{ cost: number, index: number }>) {
      const idx = state.inventory.items.findIndex(i => i.id === 'mega_pet_fragment');
      if (idx >= 0) state.inventory.items[idx].quantity -= action.payload.cost;
      state.player.megaPets[action.payload.index].level += 1;
    },
    rerollMegaPetSlotSync(state, action: PayloadAction<{ petIndex: number, slotIndex: number, newType: string, cost: number }>) {
      const idx = state.inventory.items.findIndex(i => i.id === 'mega_pet_fragment');
      if (idx >= 0) state.inventory.items[idx].quantity -= action.payload.cost;
      state.player.megaPets[action.payload.petIndex].slots[action.payload.slotIndex].type = action.payload.newType;
    },
    rebirthSync(state, action: PayloadAction<any>) {
      Object.assign(state, action.payload);
    }
  }
});

export const gameActions = gameSlice.actions;
export default gameSlice.reducer;
