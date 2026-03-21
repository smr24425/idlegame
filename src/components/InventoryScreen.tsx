import React, { useState } from 'react';
import { GameState, Equipment } from '../types/game';
import { getItemConfig, getEquipmentValue } from '../utils/gameLogic';
import { Card, Button, Dialog, Checkbox } from 'antd-mobile';
import { FormattedNumber } from './FormattedNumber';

interface InventoryScreenProps {
  gameState: GameState;
  onEquip: (equipmentId: string) => void;
  onSell: (equipmentId: string) => void;
  onBulkSell: (filters: number[]) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ gameState, onEquip, onSell, onBulkSell }) => {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [sellDialogVisible, setSellDialogVisible] = useState(false);
  const [sellFilters, setSellFilters] = useState<number[]>([]);

  const statNames = {
    health: '生命',
    attack: '攻擊',
    critRate: '暴擊率',
    critDamage: '暴擊傷害',
    defense: '防禦',
  };

  const formatStatValue = (key: string, value: number) => {
    if (key === 'critRate' || key === 'critDamage') {
      return `+${(value * 100).toFixed(1)}%`;
    }
    return `+${value}`;
  };

  const getBorderColor = (rarity: Equipment['rarity']) => {
    switch (rarity) {
      case 'white': return '#ccc';
      case 'green': return '#0f0';
      case 'blue': return '#00f';
      case 'purple': return '#f0f';
      case 'gold': return '#ff0';
      case 'red': return '#ff4444';
      default: return '#ccc';
    }
  };



  const getTypeName = (type: Equipment['type']) => {
    const names = {
      weapon: '武器',
      armor: '上衣',
      pants: '褲子',
      gloves: '手套',
      ring: '戒指',
      necklace: '項鍊',
    };
    return names[type];
  };

  const toggleFilter = (filterId: number) => {
    setSellFilters(prev =>
      prev.includes(filterId) ? prev.filter(i => i !== filterId) : [...prev, filterId]
    );
  };

  const filterLabels = [
    { id: 1, label: '白裝' },
    { id: 2, label: '綠裝' },
    { id: 3, label: '藍裝' },
    { id: 4, label: '紫裝' },
    { id: 5, label: '金裝' },
    { id: 6, label: '戰力低於當前裝備' },
  ];

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '20px' }}>
      <Card title="裝備" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)' }}>
        <Button
          block
          color="danger"
          onClick={() => setSellDialogVisible(true)}
          style={{ marginBottom: 10, background: 'var(--button)', border: 'none' }}
        >
          一鍵賣出
        </Button>
        {gameState.inventory.equipment.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>沒有裝備</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
            {gameState.inventory.equipment.map(eq => {
              const totalStats = getEquipmentValue(eq);
              const equipped = gameState.player.equipment[eq.type];
              const equippedPower = equipped ? getEquipmentValue(equipped) : 0;
              const diff = totalStats - equippedPower;
              const isSameQuality = equipped && eq.rarity === equipped.rarity;
              const displayDiff = isSameQuality ? 0 : diff;
              return (
                <div
                  key={eq.id}
                  style={{
                    width: '80px',
                    height: '80px',
                    border: `2px solid ${getBorderColor(eq.rarity)}`,
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.06)',
                    position: 'relative',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
                    transition: 'transform 0.2s ease',
                  }}
                  onClick={() => setSelectedEquipment(eq)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <div style={{ fontSize: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text)' }}>{getTypeName(eq.type)}</div>
                  <div style={{ fontSize: '10px', textAlign: 'center', color: 'var(--muted)' }}>Lv.{eq.level}</div>
                  {displayDiff !== 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: displayDiff > 0 ? '#4CAF50' : '#F44336',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '3px',
                      padding: '1px 4px',
                    }}>
                      {displayDiff > 0 && '+'}
                      <FormattedNumber value={displayDiff} />
                    </div>
                  )}
                  {isSameQuality && displayDiff === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'var(--muted)',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '3px',
                      padding: '1px 4px',
                    }}>
                      +0
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="物品" style={{ marginTop: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)' }}>
        {gameState.inventory.items.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>沒有物品</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
            {gameState.inventory.items.map(item => (
              <div
                key={item.id}
                style={{
                  width: '80px',
                  height: '80px',
                  border: `2px solid ${item.id === 'upgrade_stone' ? '#FFD700' : '#ccc'}`,
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.06)',
                  position: 'relative',
                  boxShadow: item.id === 'upgrade_stone' ? '0 0 15px rgba(255, 215, 0, 0.4)' : '0 8px 20px rgba(0, 0, 0, 0.35)',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                  {getItemConfig(item.id).icon}
                </div>
                <div style={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold', color: item.id === 'upgrade_stone' ? '#FFD700' : 'white' }}>
                  {getItemConfig(item.id, item.name).name}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'var(--text)',
                  textShadow: '1px 1px 2px black'
                }}>
                  x<FormattedNumber value={item.quantity} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog
        visible={sellDialogVisible}
        title="一鍵賣出設定"
        content={
          <div>
            <p>選擇要賣出的條件：</p>
            {filterLabels.map(filter => (
              <Checkbox
                key={filter.id}
                checked={sellFilters.includes(filter.id)}
                onChange={() => toggleFilter(filter.id)}
                style={{ marginBottom: 8 }}
              >
                {filter.label}
              </Checkbox>
            ))}
          </div>
        }
        closeOnAction
        onClose={() => setSellDialogVisible(false)}
        actions={[
          {
            key: 'confirm',
            text: '賣出',
            onClick: () => {
              onBulkSell(sellFilters);
              setSellFilters([]);
              setSellDialogVisible(false);
            },
          },
          {
            key: 'cancel',
            text: '取消',
          },
        ]}
      />

      {selectedEquipment && (
        <Dialog
          visible={!!selectedEquipment}
          title={
            <span style={{
              color: getBorderColor(selectedEquipment.rarity),
              textShadow: '0 0 10px ' + getBorderColor(selectedEquipment.rarity),
              fontWeight: 'bold',
              fontSize: '20px'
            }}>
              {selectedEquipment.name}
            </span>
          }
          content={
            <div className="equipment-dialog-content" style={{ border: '2px solid ' + getBorderColor(selectedEquipment.rarity) }}>
              <p style={{ margin: '8px 0', fontSize: '16px' }}>
                <span style={{ color: '#FFD700' }}>部位:</span> {getTypeName(selectedEquipment.type)}
              </p>
              <p style={{ margin: '8px 0', fontSize: '16px' }}>
                <span style={{ color: '#FFD700' }}>裝備等級:</span> Lv.{selectedEquipment.level}
              </p>
              <p style={{ margin: '8px 0', fontSize: '16px' }}>
                <span style={{ color: getBorderColor(selectedEquipment.rarity) }}>稀有度:</span> {selectedEquipment.rarity}
              </p>
              {selectedEquipment.mainStat && (
                <>
                  <p style={{ margin: '8px 0 5px 0', fontSize: '16px', color: '#FFD700', fontWeight: 'bold' }}>◇ 主屬性:</p>
                  <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                    <li key={selectedEquipment.mainStat.key}>
                      {statNames[selectedEquipment.mainStat.key as keyof typeof statNames] || selectedEquipment.mainStat.key}: {formatStatValue(selectedEquipment.mainStat.key, selectedEquipment.mainStat.value)}
                    </li>
                  </ul>
                </>
              )}
              {selectedEquipment.subStats && selectedEquipment.subStats.length > 0 ? (
                <>
                  <p style={{ margin: '8px 0 5px 0', fontSize: '16px', color: '#00E5FF' }}>◆ 附加屬性:</p>
                  <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                    {selectedEquipment.subStats.map((sub, idx) => (
                      <li key={idx}>
                        {statNames[sub.key as keyof typeof statNames] || sub.key}: {formatStatValue(sub.key, sub.value)}
                      </li>
                    ))}
                  </ul>
                </>
              ) : !selectedEquipment.mainStat && (
                <>
                  <p style={{ margin: '8px 0 5px 0', fontSize: '16px', color: '#FFD700' }}>裝備基礎屬性:</p>
                  <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                    {Object.entries(selectedEquipment.stats).map(([key, value]) => (
                      <li key={key}>
                        {statNames[key as keyof typeof statNames] || key}: {formatStatValue(key, value)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          }
          closeOnAction
          onClose={() => setSelectedEquipment(null)}
          actions={[
            {
              key: 'equip',
              text: '穿戴',
              bold: true,
              onClick: () => {
                onEquip(selectedEquipment.id);
                setSelectedEquipment(null);
              },
            },
            {
              key: 'sell',
              text: '賣出',
              danger: true,
              bold: true,
              onClick: () => {
                onSell(selectedEquipment.id);
                setSelectedEquipment(null);
              },
            },
            {
              key: 'cancel',
              text: '取消',
            },
          ]}
        />
      )}
    </div>
  );
};