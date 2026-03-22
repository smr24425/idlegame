import React, { useEffect, useState } from 'react';
import { GameState } from '../types/game';
import { Button, Card, Switch } from 'antd-mobile';
import { getActivePetBonus, getRebirthBonus } from '../utils/gameLogic';
import { FormattedNumber } from './FormattedNumber';

interface MainScreenProps {
  gameState: GameState;
  onCollect: () => void;
  onChallengeBoss: () => void;
  autoChallenge: boolean;
  setAutoChallenge: (val: boolean) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  gameState,
  onCollect,
  onChallengeBoss,
  autoChallenge,
  setAutoChallenge
}) => {
  // --- 新增：強制每秒更新畫面的 State ---
  const [, setTick] = useState(0);

  useEffect(() => {
    // 每 1000 毫秒 (1秒) 更新一次 state，觸發重新渲染
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    // 組件卸載時清除計時器，避免記憶體洩漏
    return () => clearInterval(timer);
  }, []);
  // ------------------------------------

  //寵物加成
  const expBonus = getActivePetBonus(gameState.player, 'expGain');
  const goldBonus = getActivePetBonus(gameState.player, 'goldGain');

  //重生加成
  const rebirthExpBonus = getRebirthBonus(gameState.player).expBonus;
  const rebirthGoldBonus = getRebirthBonus(gameState.player).goldBonus;

  const expPerSecond = gameState.player.stage * 10;
  const expTotal = expPerSecond * (1 + expBonus + rebirthExpBonus);
  const moneyPerSecond = gameState.player.stage * 5;
  const moneyTotal = moneyPerSecond * (1 + goldBonus + rebirthGoldBonus);

  const timeDiff = Math.floor((Date.now() - gameState.lastCollectTime) / 1000);
  const canCollect = timeDiff >= 60; // 滿 60 秒才可領取

  return (
    <div style={{ padding: '20px' }}>
      <Card title="收益" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)' }}>
        <p>經驗/秒: <FormattedNumber value={expPerSecond} />{expBonus > 0 ? <span> (寵物+{Math.round(expBonus * 100)}%)</span> : ''} {rebirthExpBonus > 0 ? <span> (重生+{Math.round(rebirthExpBonus * 100)}%)</span> : ''} = <FormattedNumber value={expTotal} /></p>
        <p>金錢/秒: <FormattedNumber value={moneyPerSecond} />{goldBonus > 0 ? <span> (寵物+{Math.round(goldBonus * 100)}%)</span> : ''} {rebirthGoldBonus > 0 ? <span> (重生+{Math.round(rebirthGoldBonus * 100)}%)</span> : ''} = <FormattedNumber value={moneyTotal} /></p>
      </Card>
      <Card title="主畫面" style={{ marginTop: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)' }}>
        <Button
          color="primary"
          onClick={onCollect}
          block
          style={{
            marginBottom: 10,
            background: 'linear-gradient(45deg, rgba(255, 215, 0, 0.95), rgba(255, 170, 0, 0.85))',
            border: '1px solid rgba(255, 215, 0, 0.5)',
            boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)'
          }}
          disabled={!canCollect}
        >
          領取經驗 ({Math.floor(timeDiff / 60)}分{timeDiff % 60}秒)
        </Button>
        <Button
          color="danger"
          onClick={onChallengeBoss}
          block
          style={{
            background: 'linear-gradient(45deg, rgba(255, 90, 90, 0.9), rgba(200, 40, 40, 0.9))',
            border: '1px solid rgba(255, 60, 60, 0.6)',
            boxShadow: '0 8px 20px rgba(255, 60, 60, 0.3)'
          }}
        >
          挑戰 Boss (關卡 {gameState.player.stage})
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, padding: '0 10px' }}>
          <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>打贏後自動挑戰下一關</span>
          <Switch
            checked={autoChallenge}
            onChange={setAutoChallenge}
            style={{
              '--checked-color': '#4CAF50',
              '--height': '24px',
              '--width': '42px',
            }}
          />
        </div>
      </Card>
    </div>
  );
};