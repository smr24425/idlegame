import { Player, Equipment } from '../types/game';
import { ProgressBar, Card, Button, Dialog } from 'antd-mobile';
import { useState } from 'react';
import { getEnhanceCost, calculateAutoEnhance, getTotalStats, getArtifactEffectValue, getActivePetBonus, getItemConfig, getRarityStyles } from '../utils/gameLogic';
import { FormattedNumber } from './FormattedNumber';

interface CharacterScreenProps {
  player: Player;
  inventoryStones: number;
  onOpenAttributes: () => void;
  onUnequip: (type: keyof Player['equipment']) => void;
  onAutoEquipBest: () => void;
  onEnhanceSlot: (type: Equipment['type']) => void;
  onApplyAutoEnhance: () => boolean;
}

export const CharacterScreen: React.FC<CharacterScreenProps> = ({ player, inventoryStones, onOpenAttributes, onUnequip, onAutoEquipBest, onEnhanceSlot, onApplyAutoEnhance }) => {
  const [selectedSlot, setSelectedSlot] = useState<Equipment['type'] | null>(null);
  const [showAutoEnhancePreview, setShowAutoEnhancePreview] = useState(false);

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

  const playerStats = getTotalStats(player);

  const formatStatDisplay = (statKey: keyof typeof player.attributes) => {
    const stats = playerStats;

    if (statKey === 'critRate' || statKey === 'critDamage') {
      const base = player.attributes[statKey];
      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      // @ts-ignore
      const rebirthVal = stats[`rebirth${capitalize(statKey)}Bonus`] || 0;
      // @ts-ignore
      const equipVal = stats[`equip${capitalize(statKey)}`] || 0;
      // @ts-ignore
      const artifactVal = stats[`artifact${capitalize(statKey)}`] || 0;

      return (
        <span>
          {(stats[statKey] * 100).toFixed(1)}% (
          <span style={{ color: '#4CAF50', marginLeft: '5px' }}>基礎: {(base * 100).toFixed(1)}%</span>
          {' + '}
          <span style={{ color: '#00E5FF' }}>裝備: {(equipVal * 100).toFixed(1)}%</span>
          {' + '}
          <span style={{ color: '#FFD700' }}>神器: {(artifactVal * 100).toFixed(1)}%</span>
          {rebirthVal > 0 && (
            <>
              {' + '}
              <span style={{ color: '#FF9800' }}>重生加成: +{(rebirthVal * 100).toFixed(1)}%</span>
            </>
          )}
          )
        </span>
      );
    }

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const capKey = capitalize(statKey);
    // @ts-ignore
    const baseVal = stats[`base${capKey}`] || 0;
    // @ts-ignore
    const equipVal = stats[`equip${capKey}`] || 0;
    // @ts-ignore
    const petVal = (stats[`petSlot${capKey}`] || 0) + (stats[`pet${capKey}Buff`] || 0);
    // @ts-ignore
    const rebirthVal = stats[`rebirth${capKey}Bonus`] || 0;

    const artifactVal = Math.max(0, stats[statKey] - (baseVal + equipVal + petVal + rebirthVal));

    return (
      <span>
        {Math.floor(stats[statKey])} (
        <span style={{ color: '#4CAF50', marginLeft: '5px' }}>基礎: {Math.floor(baseVal)}</span>
        {' + '}
        <span style={{ color: '#00E5FF' }}>裝備: {Math.floor(equipVal)}</span>
        {' + '}
        <span style={{ color: '#E040FB' }}>寵物: {Math.floor(petVal)}</span>
        {' + '}
        <span style={{ color: '#FFD700' }}>神器: {Math.floor(artifactVal)}</span>
        {rebirthVal > 0 && (
          <>
            {' + '}
            <span style={{ color: '#FF9800' }}>重生加成: {Math.floor(rebirthVal)}</span>
          </>
        )}
        )
      </span>
    );
  };

  const equipmentSlots = [
    { type: 'weapon' as const, name: '武器' },
    { type: 'armor' as const, name: '上衣' },
    { type: 'pants' as const, name: '褲子' },
    { type: 'gloves' as const, name: '手套' },
    { type: 'ring' as const, name: '戒指' },
    { type: 'necklace' as const, name: '項鍊' },
  ];


  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.05) 0%, transparent 50%), radial-gradient(circle at 60% 40%, rgba(255, 69, 0, 0.05) 0%, transparent 50%)',
        zIndex: 0
      }} />

      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '6px',
        height: '6px',
        background: 'rgba(255, 215, 0, 0.6)',
        borderRadius: '50%',
        animation: 'floatParticles 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: '4px',
        height: '4px',
        background: 'rgba(138, 43, 226, 0.6)',
        borderRadius: '50%',
        animation: 'floatParticles 6s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '80%',
        width: '5px',
        height: '5px',
        background: 'rgba(255, 69, 0, 0.6)',
        borderRadius: '50%',
        animation: 'floatParticles 7s ease-in-out infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div>
          <Card title="人物統計" style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            color: 'white',
            border: '2px solid #ffd700',
            boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
            borderRadius: '15px'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>
                等級: {player.level}
              </p>
              <p style={{ margin: '5px 0' }}>經驗: <FormattedNumber value={player.exp} /> / <FormattedNumber value={player.expToNext} /></p>
              <ProgressBar percent={(player.exp / player.expToNext) * 100} style={{ marginBottom: '10px' }} />
              <p style={{ margin: '5px 0' }}>金錢: <FormattedNumber value={player.money} /></p>
              <p style={{ margin: '5px 0' }}>關卡: {player.stage}</p>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#ffd700', textShadow: '0 0 5px rgba(255, 215, 0, 0.8)' }}>屬性</h3>
              <p style={{ margin: '8px 0', fontSize: '16px' }}>生命: {formatStatDisplay('health')}</p>
              <p style={{ margin: '8px 0', fontSize: '16px' }}>攻擊: {formatStatDisplay('attack')}</p>
              <p style={{ margin: '8px 0', fontSize: '16px' }}>暴擊率: {formatStatDisplay('critRate')}</p>
              <p style={{ margin: '8px 0', fontSize: '16px' }}>暴擊傷害: {formatStatDisplay('critDamage')}</p>
              <p style={{ margin: '8px 0', fontSize: '16px' }}>防禦: {formatStatDisplay('defense')}</p>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(0, 229, 255, 0.3)', marginTop: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#00E5FF', textShadow: '0 0 5px rgba(0, 229, 255, 0.8)' }}>額外加成 (神器與寵物)</h3>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>閃避率: {(getArtifactEffectValue(player, 'dodgeRate') * 100).toFixed(1)}%</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>經驗加成: {(playerStats.expGain * 100).toFixed(1)}%</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>金幣加成: {(playerStats.goldGain * 100).toFixed(1)}%</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>關卡裝備額外掉落: +{(getActivePetBonus(player, 'dropRate') * 100).toFixed(1)}%</p>
              {/* @ts-ignore */}
              {playerStats.bossDamage > 0 && <p style={{ margin: '5px 0', fontSize: '14px' }}>Boss 傷害提昇: {(playerStats.bossDamage * 100).toFixed(1)}%</p>}
              <p style={{ margin: '5px 0', fontSize: '14px' }}>掛機強化石 ({getItemConfig('upgrade_stone').icon}) 掉落機率: {(5 + getArtifactEffectValue(player, 'upgradeStoneDropRate') * 100).toFixed(1)}%</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>掛機幼龍碎片 ({getItemConfig('pet_upgrade_fragment').icon}) 掉落機率: {(2 + getArtifactEffectValue(player, 'petStoneDropRate') * 100).toFixed(1)}%</p>
            </div>

            <div style={{ marginTop: '15px' }}>
              <p style={{ margin: '5px 0', color: '#4CAF50', fontWeight: 'bold' }}>可用點數: {player.availablePoints}</p>
              <Button
                onClick={onOpenAttributes}
                block
                disabled={player.availablePoints <= 0}
                style={{
                  background: player.availablePoints > 0 ? 'linear-gradient(45deg, #4CAF50, #66BB6A)' : '#666',
                  border: 'none',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
              >
                分配屬性
              </Button>
            </div>
          </Card>

          <Card title="裝備" style={{
            background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
            color: 'white',
            border: '2px solid #DAA520',
            boxShadow: '0 8px 32px rgba(218, 165, 32, 0.3)',
            borderRadius: '15px',
            marginTop: '20px'
          }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 12 }}>
              <Button
                color="primary"
                onClick={onAutoEquipBest}
                style={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #DAA520, #FFD700)',
                  border: '2px solid #FFD700',
                  borderRadius: '15px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(218, 165, 32, 0.4)',
                  fontSize: '12px'
                }}
              >
                ⚔️ 自動穿戴
              </Button>
              <Button
                color="primary"
                onClick={() => setShowAutoEnhancePreview(true)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #FF5722, #E91E63)',
                  border: 'none',
                  borderRadius: '15px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(233, 30, 99, 0.4)',
                  fontSize: '12px'
                }}
              >
                ✨ 自動強化
              </Button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '15px',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid rgba(218, 165, 32, 0.3)'
            }}>
              {equipmentSlots.map(slot => {
                const eq = player.equipment[slot.type];
                return (
                  <div
                    key={slot.type}
                    style={{
                      width: '90px',
                      height: '90px',
                      border: eq ? `3px solid ${getRarityStyles(eq.rarity).color}` : '3px dashed rgba(255, 255, 255, 0.5)',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: eq ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                      boxShadow: eq ? '0 4px 15px rgba(0, 0, 0, 0.3)' : 'none',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => setSelectedSlot(slot.type)}
                    onMouseEnter={(e) => {
                      if (eq) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (eq) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                  >
                    {eq && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getRarityStyles(eq.rarity).color,
                        boxShadow: getRarityStyles(eq.rarity).boxShadow
                      }} />
                    )}
                    <div style={{
                      fontSize: '14px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}>
                      {slot.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      textAlign: 'center',
                      color: eq ? '#FFD700' : 'rgba(255, 255, 255, 0.7)'
                    }}>
                      {eq ? `Lv.${eq.level}` : '未裝備'}
                    </div>
                    {player.slotLevels[slot.type] > 0 && (
                      <div style={{ position: 'absolute', bottom: '0', background: 'rgba(0,0,0,0.8)', width: '100%', textAlign: 'center', fontSize: '11px', color: '#4CAF50', fontWeight: 'bold', borderTop: '1px solid rgba(76, 175, 80, 0.5)' }}>
                        強化 +{player.rebirths ? player.slotLevels[slot.type] + player.rebirths * 100 : player.slotLevels[slot.type]}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </Card>
          {(() => {
            if (!selectedSlot) return null;
            const eq = player.equipment[selectedSlot];
            const slotLevel = player.slotLevels[selectedSlot];
            const { gold, stones } = getEnhanceCost(slotLevel, player);
            const currentMult = (slotLevel * 1) + "%";
            const nextMult = ((slotLevel + 1) * 1) + "%";

            return (
              <Dialog
                visible={!!selectedSlot}
                title={
                  <span style={{
                    color: eq ? getRarityStyles(eq.rarity).color : 'white',
                    textShadow: eq ? '0 0 10px ' + getRarityStyles(eq.rarity).color : 'none',
                    fontWeight: 'bold',
                    fontSize: '20px'
                  }}>
                    {eq ? eq.name : `${equipmentSlots.find(s => s.type === selectedSlot)?.name}欄位`}
                  </span>
                }
                content={(
                  <div className="equipment-dialog-content" style={{ border: '2px solid ' + (eq ? getRarityStyles(eq.rarity).color : '#666'), overflow: 'hidden' }}>
                    {eq ? (
                      <>
                        <p style={{ margin: '8px 0', fontSize: '16px' }}>
                          <span style={{ color: '#FFD700' }}>類型:</span> {equipmentSlots.find(s => s.type === selectedSlot)?.name}
                        </p>
                        <p style={{ margin: '8px 0', fontSize: '16px' }}>
                          <span style={{ color: '#FFD700' }}>等級:</span> {eq.level}
                        </p>
                        <p style={{ margin: '8px 0', fontSize: '16px' }}>
                          <span style={{ color: getRarityStyles(eq.rarity).color }}>稀有度:</span> {eq.rarity}
                        </p>
                        {eq.mainStat && (
                          <>
                            <p style={{ margin: '8px 0 5px 0', fontSize: '16px', color: '#FFD700', fontWeight: 'bold' }}>◇ 主屬性:</p>
                            <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                              <li key={eq.mainStat.key}>
                                {statNames[eq.mainStat.key as keyof typeof statNames] || eq.mainStat.key}: {formatStatValue(eq.mainStat.key, eq.mainStat.value)}
                              </li>
                            </ul>
                          </>
                        )}
                        {eq.subStats && eq.subStats.length > 0 ? (
                          <>
                            <p style={{ margin: '8px 0 5px 0', fontSize: '16px', color: '#00E5FF' }}>◆ 附加屬性:</p>
                            <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                              {eq.subStats.map((sub, idx) => (
                                <li key={idx}>
                                  {statNames[sub.key as keyof typeof statNames] || sub.key}: {formatStatValue(sub.key, sub.value)}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : !eq.mainStat && (
                          <>
                            <p style={{ margin: '8px 0 5px 0', fontSize: '16px', color: '#FFD700' }}>裝備基礎屬性:</p>
                            <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                              {Object.entries(eq.stats).map(([key, value]) => (
                                <li key={key}>
                                  {statNames[key as keyof typeof statNames] || key}: {formatStatValue(key, value)}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </>
                    ) : (
                      <p style={{ color: 'var(--muted)', textAlign: 'center', margin: '20px 0' }}>此欄位尚未裝備物品</p>
                    )}

                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#FFD700', fontWeight: 'bold' }}>
                        欄位強化 (Lv.{slotLevel})
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#4CAF50' }}>
                        主屬性加成: +{currentMult} ➔ <span style={{ color: '#FFD700' }}>+{nextMult}</span>
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        升級消耗: {getItemConfig('money').icon} {gold} {getItemConfig('money').name} {stones > 0 ? `+ ${getItemConfig('upgrade_stone').icon} ${stones} ${getItemConfig('upgrade_stone').name}` : ''}
                      </p>
                      <Button
                        color="primary"
                        block
                        style={{ marginTop: '10px', background: 'linear-gradient(45deg, #FF9800, #FF5722)', border: 'none', fontWeight: 'bold', borderRadius: '8px' }}
                        onClick={() => onEnhanceSlot(selectedSlot)}
                      >
                        強化欄位
                      </Button>
                    </div>
                  </div>
                )}
                onClose={() => setSelectedSlot(null)}
                actions={[
                  ...(eq ? [{
                    key: 'unequip',
                    text: '卸下裝備',
                    danger: true,
                    bold: true,
                    onClick: () => {
                      onUnequip(selectedSlot);
                      setSelectedSlot(null);
                    }
                  }] : []),
                  {
                    key: 'cancel',
                    text: '關閉',
                    onClick: () => setSelectedSlot(null)
                  },
                ]}
              />
            );
          })()}

          {showAutoEnhancePreview && (() => {
            const preview = calculateAutoEnhance(player, inventoryStones);
            return (
              <Dialog
                visible={showAutoEnhancePreview}
                title={<span style={{ color: '#FFD700', fontWeight: 'bold' }}>自動強化預覽</span>}
                content={(
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {preview.canUpgradeAny ? (
                      <>
                        <p style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--muted)' }}>將為以下欄位進行強化：</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' }}>
                          {Object.entries(preview.upgrades).map(([slot, levels]) => {
                            if (levels === 0) return null;
                            const slotName = equipmentSlots.find(s => s.type === slot)?.name;
                            const oldLevel = player.slotLevels[slot as Equipment['type']];
                            return (
                              <div key={slot} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,215,0,0.3)', padding: '5px', borderRadius: '5px', textAlign: 'center' }}>
                                <div style={{ color: '#FFD700', fontSize: '14px', fontWeight: 'bold' }}>{slotName}</div>
                                <div style={{ fontSize: '12px' }}>Lv.{oldLevel} ➔ <span style={{ color: '#4CAF50' }}>Lv.{oldLevel + levels}</span></div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ borderTop: '1px dashed #666', paddingTop: '10px' }}>
                          <p style={{ margin: '5px 0', fontSize: '14px', color: 'var(--text)' }}>預計總消耗：</p>
                          <p style={{ margin: '5px 0', color: '#FFD700', fontWeight: 'bold', fontSize: '16px' }}>{getItemConfig('money').icon} <FormattedNumber value={preview.totalGoldSpent} /> {getItemConfig('money').name}</p>
                          {preview.totalStonesSpent > 0 && <p style={{ margin: '5px 0', color: '#FF9800', fontWeight: 'bold', fontSize: '16px' }}>{getItemConfig('upgrade_stone').icon} <FormattedNumber value={preview.totalStonesSpent} /> {getItemConfig('upgrade_stone').name}</p>}
                        </div>
                      </>
                    ) : preview.isMaxedOut ? (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <p style={{ color: '#F44336', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>無法進行自動強化！</p>
                        <p style={{ margin: '5px 0', color: 'var(--text)', fontSize: '14px' }}>所有欄位都已達到最大等級！</p>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <p style={{ color: '#F44336', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>無法進行自動強化！</p>
                        <p style={{ margin: '5px 0', color: 'var(--text)', fontSize: '14px' }}>需要以下資源才能對最低等級的欄位進行一次升級：</p>
                        {preview.missingGold > 0 && <p style={{ margin: '5px 0', color: '#FFD700', fontWeight: 'bold' }}>缺 {getItemConfig("money").icon} {preview.missingGold}</p>}
                        {preview.missingStones > 0 && <p style={{ margin: '5px 0', color: '#FF9800', fontWeight: 'bold' }}>缺 {getItemConfig("upgrade_stone").icon} {preview.missingStones}</p>}
                      </div>
                    )}
                  </div>
                )}
                actions={[
                  ...(preview.canUpgradeAny ? [{
                    key: 'confirm',
                    text: '確認自動強化',
                    bold: true,
                    onClick: () => {
                      onApplyAutoEnhance();
                      setShowAutoEnhancePreview(false);
                    }
                  }] : []),
                  {
                    key: 'cancel',
                    text: '關閉',
                    onClick: () => setShowAutoEnhancePreview(false)
                  }
                ]}
              />
            );
          })()}

        </div>
      </div>
    </div>
  );
};