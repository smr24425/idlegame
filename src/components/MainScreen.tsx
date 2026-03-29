import React, { useEffect, useState } from 'react';
import { GameState } from '../types/game';
import { Button, Card, Switch } from 'antd-mobile';
import { getTotalStats } from '../utils/logic';
import { FormattedNumber } from './FormattedNumber';

interface MainScreenProps {
  gameState: GameState;
  onCollect: () => void;
  onChallengeBoss: () => void;
  autoChallenge: boolean;
  setAutoChallenge: (val: boolean) => void;
  onNavigate: (key: string) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  gameState,
  onCollect,
  onChallengeBoss,
  autoChallenge,
  setAutoChallenge,
  onNavigate
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

  const stats = getTotalStats(gameState.player);

  const expPerSecond = gameState.player.stage * 10;
  const expTotal = expPerSecond * (1 + stats.expGain);
  const moneyPerSecond = gameState.player.stage * 5;
  const moneyTotal = moneyPerSecond * (1 + stats.goldGain);

  const timeDiff = Math.floor((Date.now() - gameState.lastCollectTime) / 1000);
  const canCollect = timeDiff >= 60; // 滿 60 秒才可領取

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card title="收益" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)' }}>
        <p>經驗/秒: <FormattedNumber value={expPerSecond} /> {stats.expGain > 0 ? <span style={{ color: '#4CAF50' }}>(+{(stats.expGain * 100).toFixed(1)}%)</span> : ''} = <FormattedNumber value={expTotal} /></p>
        <p>金錢/秒: <FormattedNumber value={moneyPerSecond} /> {stats.goldGain > 0 ? <span style={{ color: '#FFD700' }}>(+{(stats.goldGain * 100).toFixed(1)}%)</span> : ''} = <FormattedNumber value={moneyTotal} /></p>
      </Card>
      <Card title="主畫面" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)' }}>
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

      <Card title="功能系統" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          <div onClick={() => onNavigate('pets')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', padding: '15px 5px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>🐾</span>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text)' }}>寵物</span>
          </div>
          <div onClick={() => onNavigate('artifacts')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', padding: '15px 5px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>🏺</span>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text)' }}>神器</span>
          </div>
          <div onClick={() => { if (gameState.player.rebirths >= 2) onNavigate('megapet'); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: gameState.player.rebirths >= 2 ? 'pointer' : 'not-allowed', background: 'rgba(255, 255, 255, 0.05)', padding: '15px 5px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative' }}>
            {gameState.player.rebirths < 2 && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <span style={{ fontSize: '24px' }}>⛓️</span>
              </div>
            )}
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>🐲</span>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text)' }}>萌獸</span>
          </div>
        </div>
      </Card>
    </div>
  );
};