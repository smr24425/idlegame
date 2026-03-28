import { Rarity } from '../../types/game';

export const getRarityStyles = (rarity: Rarity | string | undefined) => {
  switch (rarity) {
    case 'white': return { color: '#cccccc', boxShadow: '0 0 10px rgba(204, 204, 204, 0.4)' };
    case 'green': return { color: '#00ff00', boxShadow: '0 0 10px rgba(0, 255, 0, 0.4)' };
    case 'blue': return { color: '#0000ff', boxShadow: '0 0 10px rgba(0, 0, 255, 0.4)' };
    case 'purple': return { color: '#ff00ff', boxShadow: '0 0 10px rgba(255, 0, 255, 0.4)' };
    case 'gold': return { color: '#FFD700', boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)' };
    case 'red': return { color: '#FF5252', boxShadow: '0 0 15px rgba(255, 82, 82, 0.4)' };

    // Legacy support for Artifacts/Pets
    case 'R': return { color: '#cccccc', boxShadow: '0 0 10px rgba(204, 204, 204, 0.4)' };
    case 'SR': return { color: '#ff00ff', boxShadow: '0 0 10px rgba(255, 0, 255, 0.4)' };
    case 'SSR': return { color: '#FFD700', boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)' };

    default: return { color: '#cccccc', boxShadow: '0 0 10px rgba(204, 204, 204, 0.4)' };
  }
};
