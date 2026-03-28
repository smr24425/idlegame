import { Player } from '../types/game';
import { getExpToNextLevel } from '../utils/logic';

export const initialPlayer: Player = {
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
  equippedArtifactIds: ['', '', ''],
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
  rebirths: 0,
  megaPet: {
    unlocked: false,
    level: 1,
    slots: [{ type: null }, { type: null }, { type: null }]
  }
};
