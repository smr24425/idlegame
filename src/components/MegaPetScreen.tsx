import React, { useState } from 'react';
import { GameState } from '../types/game';
import { Card, Button, Switch, Dialog } from 'antd-mobile';
import { FormattedNumber } from './FormattedNumber';

import { useDispatch } from 'react-redux';
import { gameActions } from '../store/gameSlice';

interface MegaPetScreenProps {
  gameState: GameState;
  unlockMegaPet: (index: number) => { success: boolean; message: string };
  rerollMegaPetStats: (index: number, lock0: boolean, lock1: boolean, lock2: boolean) => { success: boolean; message: string };
  levelUpMegaPet: (index: number) => { success: boolean; message: string };
}

const statNames: Record<string, string> = {
  attack: '攻擊',
  defense: '防禦',
  health: '生命',
  critRate: '暴擊率',
  critDamage: '暴擊傷害',
  expGain: '經驗加成',
  goldGain: '金錢加成',
  bossDamage: 'Boss傷害'
};

const statValues: Record<string, string> = {
  attack: '10%',
  defense: '10%',
  health: '10%',
  critRate: '1%',
  critDamage: '200%',
  expGain: '10%',
  goldGain: '10%',
  bossDamage: '10%'
};

const statBaseValues: Record<string, string> = {
  attack: '60%',
  defense: '60%',
  health: '60%',
  critRate: '3%',
  critDamage: '3000%',
  expGain: '300%',
  goldGain: '300%',
  bossDamage: '60%'
};

export const MegaPetScreen: React.FC<MegaPetScreenProps> = ({ gameState, unlockMegaPet, rerollMegaPetStats, levelUpMegaPet }) => {
  const [locks, setLocks] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [viewIndex, setViewIndex] = useState(0);
  const dispatch = useDispatch();

  const toggleLock = (index: number) => {
    const newLocks = [...locks] as [boolean, boolean, boolean];
    newLocks[index] = !newLocks[index];
    setLocks(newLocks);
  };

  const handleLevelUp = () => {
    const res = levelUpMegaPet(viewIndex);
    Dialog.alert({ content: res.message });
  };

  const handleReroll = () => {
    const res = rerollMegaPetStats(viewIndex, locks[0], locks[1], locks[2]);
    if (!res.success) {
      Dialog.alert({ content: res.message });
    }
  };

  const handleUnlock = () => {
    const res = unlockMegaPet(viewIndex);
    Dialog.alert({ content: res.message });
  };

  const { megaPets, activeMegaPetIndex, rebirths, diamonds } = gameState.player;
  const megaPet = megaPets ? megaPets[viewIndex] : null;

  const renderTabs = () => (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
      {[0, 1, 2].map((idx) => (
        <Button
          key={idx}
          color={viewIndex === idx ? 'primary' : 'default'}
          onClick={() => {
            setViewIndex(idx);
            setLocks([false, false, false]); // Reset locks on switch
          }}
          style={{ flex: 1 }}
        >
          {`萌獸 ${idx + 1}`}
        </Button>
      ))}
    </div>
  );

  if (!megaPet || !megaPet.unlocked) {
    const unlockCost = 200000000 * Math.pow(2, viewIndex);
    return (
      <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
        {renderTabs()}
        <Card title={`萌獸系統解鎖 (萌獸 ${viewIndex + 1})`} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text)', textAlign: 'center' }}>
          <p>開啟條件：需要達成 2 次轉生</p>
          <p>目前轉生次數：{rebirths}</p>
          <p>解鎖花費：{unlockCost.toLocaleString()} 鑽石</p>
          <Button color="primary" block disabled={rebirths < 2} onClick={handleUnlock}>
            解鎖萌獸
          </Button>
        </Card>
      </div>
    );
  }

  const lockedCount = locks.filter(l => l).length;
  let rerollCost = 10000000;
  if (lockedCount === 1) rerollCost = 20000000;
  if (lockedCount === 2) rerollCost = 50000000;

  const fragmentItem = gameState.inventory.items.find(i => i.id === 'mega_pet_fragment');
  const shards = fragmentItem ? fragmentItem.quantity : 0;
  const levelUpCost = 100 + megaPet.level * 20;

  return (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      {renderTabs()}
      <Card title={`萌獸 ${viewIndex + 1} (Lv. ${megaPet.level})`} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text)' }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <Button
            color={activeMegaPetIndex === viewIndex ? 'success' : 'primary'}
            fill={activeMegaPetIndex === viewIndex ? 'solid' : 'outline'}
            onClick={() => { dispatch(gameActions.setActiveMegaPetIndex(activeMegaPetIndex === viewIndex ? null : viewIndex)); }}
          >
            {activeMegaPetIndex === viewIndex ? '⭐ 出戰中 ⭐' : '設為上陣'}
          </Button>
        </div>

        <p style={{ textAlign: 'center', color: '#00E5FF', fontWeight: 'bold' }}>
          鑽石: <FormattedNumber value={diamonds} /> | 萌獸碎片: <FormattedNumber value={shards} />
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {megaPet.slots.map((slot, index) => (
            <div key={index} style={{ border: '1px solid rgba(255, 215, 0, 0.25)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--accent)' }}>{slot.type ? statNames[slot.type] : '未解鎖'}</span>
                {slot.type && (
                  <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>
                    <span style={{ color: '#00E5FF' }}>總加成:</span> 基本 {statBaseValues[slot.type]} + Lv*{statValues[slot.type]}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: locks[index] ? '#FF5252' : 'var(--muted)' }}>{locks[index] ? '已鎖定' : '鎖定'}</span>
                <Switch
                  checked={locks[index]}
                  onChange={() => toggleLock(index)}
                  style={{
                    '--checked-color': '#FF5252',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            重製花費：<FormattedNumber value={rerollCost} /> 鑽石
            <span
              onClick={() => {
                Dialog.alert({
                  title: '能力值獲取機率',
                  content: (
                    <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
                      <p>攻擊力: 29.3%</p>
                      <p>防禦力: 29.3%</p>
                      <p>生命值: 29.3%</p>
                      <p>暴擊率: 5.0%</p>
                      <p>暴擊傷害: 5.0%</p>
                      <p>經驗加成: 1.0%</p>
                      <p>金錢加成: 1.0%</p>
                      <p>Boss傷害: 0.1%</p>
                    </div>
                  )
                });
              }}
              style={{ marginLeft: '10px', cursor: 'pointer', fontSize: '18px' }}
            >
              ❓
            </span>
          </p>
          <Button color="warning" block onClick={handleReroll} disabled={lockedCount === 3} style={{ fontWeight: 'bold', borderRadius: '8px' }}>
            重製屬性
          </Button>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid rgba(255, 215, 0, 0.25)', paddingTop: '20px' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '10px' }}>升級進度：{shards} / {levelUpCost} 萌獸碎片</p>
          <Button color="success" block disabled={shards < levelUpCost} onClick={handleLevelUp} style={{ fontWeight: 'bold', borderRadius: '8px' }}>
            升級萌獸
          </Button>
        </div>
      </Card>
    </div>
  );
};
