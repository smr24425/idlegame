import { Boss } from '../../types/game';

export const getBossHealth = (stage: number) => {
  if (stage <= 10) {
    return 100;
  }
  const baseLinear = 100 + stage * 20;
  const exponent = Math.floor(stage / 100);
  const multiplier = Math.pow(1.25, exponent);
  return Math.floor(baseLinear * multiplier);
};

export const getBossAttack = (stage: number) => {
  if (stage <= 10) {
    return 10;
  }
  const baseLinear = 10 + stage * 9;
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
