import React, { useState } from 'react';
import { GameState } from '../types/game';
import { Card, Button, Switch, Dialog } from 'antd-mobile';
import { FormattedNumber } from './FormattedNumber';

interface MegaPetScreenProps {
  gameState: GameState;
  unlockMegaPet: () => { success: boolean; message: string };
  rerollMegaPetStats: (lock0: boolean, lock1: boolean, lock2: boolean) => { success: boolean; message: string };
  levelUpMegaPet: () => { success: boolean; message: string };
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

  const toggleLock = (index: number) => {
    const newLocks = [...locks] as [boolean, boolean, boolean];
    newLocks[index] = !newLocks[index];
    setLocks(newLocks);
  };

  const handleLevelUp = () => {
    const res = levelUpMegaPet();
    Dialog.alert({ content: res.message });
  };

  const handleReroll = () => {
    const res = rerollMegaPetStats(locks[0], locks[1], locks[2]);
    if (!res.success) {
      Dialog.alert({ content: res.message });
    }
  };

  const handleUnlock = () => {
    const res = unlockMegaPet();
    Dialog.alert({ content: res.message });
  };

  const { megaPet, rebirths, diamonds } = gameState.player;
  
  if (!megaPet.unlocked) {
    return (
      <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
        <Card title="萌獸系統解鎖" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text)', textAlign: 'center' }}>
          <p>開啟條件：需要達成 2 次轉生</p>
          <p>目前轉生次數：{rebirths}</p>
          <p>解鎖花費：5,000,000 鑽石</p>
          <Button color="primary" block disabled={rebirths < 2} onClick={handleUnlock}>
            解鎖萌獸
          </Button>
        </Card>
      </div>
    );
  }

  const lockedCount = locks.filter(l => l).length;
  let rerollCost = 10000;
  if (lockedCount === 1) rerollCost = 100000;
  if (lockedCount === 2) rerollCost = 200000;

  const fragmentItem = gameState.inventory.items.find(i => i.id === 'mega_pet_fragment');
  const shards = fragmentItem ? fragmentItem.quantity : 0;
  const levelUpCost = megaPet.level * 10;

  return (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <Card title={`萌獸 (Lv. ${megaPet.level})`} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text)' }}>
        <p style={{ textAlign: 'center', color: '#00E5FF', fontWeight: 'bold' }}>
          鑽石: <FormattedNumber value={diamonds} /> | 萌獸碎片: <FormattedNumber value={shards} />
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {megaPet.slots.map((slot, index) => (
            <div key={index} style={{ border: '1px solid rgba(255, 215, 0, 0.25)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--accent)' }}>{slot.type ? statNames[slot.type] : '未解鎖'}</span>
                {slot.type && <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>每級加成: +{statValues[slot.type]}</div>}
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
            重製花費：{rerollCost.toLocaleString()} 鑽石
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
