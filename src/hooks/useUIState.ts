import { useState, useEffect } from 'react';

export interface UIState {
  activeKey: string;
  showAttributes: boolean;
  collectDialog: { visible: boolean; exp: number; money: number; time: number; equipments: any[] };
  fightResultDialog: { visible: boolean; result: 'win' | 'lose' | null };
}

const initialUIState: UIState = {
  activeKey: 'main',
  showAttributes: false,
  collectDialog: { visible: false, exp: 0, money: 0, time: 0, equipments: [] },
  fightResultDialog: { visible: false, result: null },
};

export const useUIState = () => {
  const [uiState, setUIState] = useState<UIState>(() => {
    const saved = localStorage.getItem('idleGameUIState');
    if (saved) {
      try {
        return { ...initialUIState, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse UI state from localStorage', e);
      }
    }
    return initialUIState;
  });

  useEffect(() => {
    localStorage.setItem('idleGameUIState', JSON.stringify(uiState));
  }, [uiState]);

  const setActiveKey = (key: string) => {
    setUIState(prev => ({ ...prev, activeKey: key }));
  };

  const setShowAttributes = (show: boolean) => {
    setUIState(prev => ({ ...prev, showAttributes: show }));
  };

  const setCollectDialog = (dialog: UIState['collectDialog']) => {
    setUIState(prev => ({ ...prev, collectDialog: dialog }));
  };

  const setFightResultDialog = (dialog: UIState['fightResultDialog']) => {
    setUIState(prev => ({ ...prev, fightResultDialog: dialog }));
  };

  return {
    uiState,
    setActiveKey,
    setShowAttributes,
    setCollectDialog,
    setFightResultDialog,
  };
};