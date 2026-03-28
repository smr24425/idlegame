import { useState } from 'react';
import { GameState } from '../types/game';
import { ARTIFACT_CONFIGS, getArtifactUpgradeCost, getRarityStyles } from '../utils/logic';
import { Card, Button, Toast } from 'antd-mobile';

interface ArtifactScreenProps {
  gameState: GameState;
  upgradeArtifact: (configId: string) => { success: boolean; message: string };
  equipArtifact: (configId: string, slotIndex: number) => void;
  unequipArtifact: (slotIndex: number) => void;
}

export const ArtifactScreen: React.FC<ArtifactScreenProps> = ({
  gameState,
  upgradeArtifact,
  equipArtifact,
  unequipArtifact,
}) => {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('R');



  const handleUpgrade = (configId: string) => {
    const result = upgradeArtifact(configId);
    if (result.success) {
      Toast.show({ content: result.message, icon: 'success' });
    } else {
      Toast.show({ content: result.message, icon: 'fail' });
    }
  };

  const handleEquip = (configId: string, slotIndex: number) => {
    const isOwned = gameState.player.artifacts[configId]?.level > 0;
    if (isOwned) {
      equipArtifact(configId, slotIndex);
      setSelectedArtifactId(null);
      Toast.show({ content: '穿戴成功' });
    } else {
      Toast.show({ content: '尚未獲取此神器' });
    }
  };

  const handleUnequip = (slotIndex: number) => {
    unequipArtifact(slotIndex);
    Toast.show({ content: '取消穿戴' });
  };

  // Ensure slots length is 3 securely
  const equippedIds = [...gameState.player.equippedArtifactIds];
  while (equippedIds.length < 3) equippedIds.push('');

  return (
    <div style={{ padding: '0 0 20px 0', height: '100%', overflowY: 'auto' }}>

      {/* 裝備中的神器 */}
      <Card title="裝備中的神器" style={{ margin: '10px' }} className="dark-card">
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {equippedIds.slice(0, 3).map((artifactId, index) => {
            const config = ARTIFACT_CONFIGS.find(c => c.id === artifactId);
            const playerArtifact = artifactId ? gameState.player.artifacts[artifactId] : null;

            return (
              <div
                key={`slot-${index}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '10px',
                  borderRadius: '8px',
                  border: config ? `1px solid ${getRarityStyles(config.rarity).color}` : '1px dashed #666',
                  cursor: config ? 'pointer' : 'default'
                }}
                onClick={() => config && handleUnequip(index)}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: '#222',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  boxShadow: config ? `0 0 10px ${getRarityStyles(config.rarity).color}` : 'none',
                  fontSize: '24px'
                }}>
                  {config ? '🏺' : '❌'}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                  {config ? config.name : '空欄位'}
                </div>
                {playerArtifact && (
                  <div style={{ fontSize: '10px', color: '#888' }}>
                    Lv.{playerArtifact.level}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 圖鑑列表 */}
      <Card
        title="神器圖鑑與合成"
        style={{ margin: '10px', background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        headerStyle={{ width: '100%', display: 'flex', }}
        className="dark-card"
      >
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          {['R', 'SR', 'SSR'].map(rarity => (
            <Button
              key={rarity}
              size="small"
              onClick={() => setActiveTab(rarity)}
              style={{
                flex: 1,
                background: activeTab === rarity ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${getRarityStyles(rarity).color}`,
                color: 'white',
                fontWeight: activeTab === rarity ? 'bold' : 'normal'
              }}
            >
              {rarity}級
            </Button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {ARTIFACT_CONFIGS.filter(c => c.rarity === activeTab).map(config => {
            const artifactState = gameState.player.artifacts[config.id];
            const isOwned = artifactState && artifactState.level > 0;
            const level = artifactState ? artifactState.level : 0;
            const fragments = artifactState ? artifactState.fragments : 0;

            let upgradeCost = getArtifactUpgradeCost(level === 0 ? 1 : level);
            const isMax = upgradeCost === -1;
            const canUpgrade = !isMax && fragments >= upgradeCost;

            return (
              <div
                key={config.id}
                onClick={() => setSelectedArtifactId(config.id)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isOwned ? getRarityStyles(config.rarity).color : '#333'}`,
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  filter: isOwned ? 'none' : 'grayscale(1)',
                  opacity: isOwned ? 1 : 0.6,
                  cursor: 'pointer',
                  boxShadow: isOwned ? `0 4px 12px ${getRarityStyles(config.rarity).color}33` : 'none'
                }}
              >
                {(canUpgrade || (!isOwned && fragments >= 40)) && (
                  <div style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                    !
                  </div>
                )}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', background: '#222',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                  marginBottom: '5px', boxShadow: isOwned ? `0 0 8px ${getRarityStyles(config.rarity).color}` : 'none'
                }}>
                  🏺
                </div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', textAlign: 'center', textShadow: isOwned ? `0 0 5px ${getRarityStyles(config.rarity).color}` : 'none' }}>
                  {config.name}
                </div>
                <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>
                  {isOwned ? `Lv.${level}` : '未解鎖'}
                </div>

                {!isMax ? (
                  <div style={{
                    marginTop: '5px', width: '100%', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%', background: canUpgrade ? '#4CAF50' : '#2196F3',
                      width: `${Math.min(100, (fragments / upgradeCost) * 100)}%`
                    }} />
                  </div>
                ) : (
                  <div style={{ marginTop: '5px', fontSize: '10px', color: '#FFD700' }}>MAX</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 神器詳情 Dialog */}
      {selectedArtifactId && (() => {
        const config = ARTIFACT_CONFIGS.find(c => c.id === selectedArtifactId);
        if (!config) return null;

        const artifactState = gameState.player.artifacts[config.id];
        const isOwned = artifactState && artifactState.level > 0;
        const level = artifactState ? artifactState.level : 0;
        const fragments = artifactState ? artifactState.fragments : 0;
        const upgradeCost = getArtifactUpgradeCost(Math.max(1, level));
        const isMax = upgradeCost === -1;
        const canUpgrade = !isMax && fragments >= upgradeCost;

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div style={{
              background: '#1A1A2E', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '400px',
              border: `1px solid ${getRarityStyles(config.rarity).color}`, boxShadow: `0 0 20px ${getRarityStyles(config.rarity).color}33`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🏺</span>
                  <span style={{ textShadow: `0 0 8px ${getRarityStyles(config.rarity).color}` }}>{config.name}</span>
                </h3>
                <span style={{ fontSize: '20px', cursor: 'pointer', color: '#888' }} onClick={() => setSelectedArtifactId(null)}>✕</span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 10px 0', color: '#ccc', fontSize: '14px', lineHeight: '1.5' }}>
                  {(() => {
                    const displayLevel = Math.max(1, level);
                    const displayVal = config.levelGrowth !== undefined
                      ? (config.baseValue + (displayLevel - 1) * config.levelGrowth)
                      : (config.baseValue * displayLevel);

                    const isFlat = ['baseAttack', 'baseDefense', 'baseHealth'].includes(config.effectType);
                    const formattedVal = isFlat ? displayVal : parseFloat((displayVal * 100).toFixed(1));

                    const parts = config.description.split('{val}');
                    if (parts.length > 1) {
                      return (
                        <span>
                          {parts[0]}
                          <span style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '16px' }}>{formattedVal}</span>
                          {parts[1]}
                        </span>
                      );
                    }
                    return config.description;
                  })()}
                </p>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text)' }}>
                  <span style={{ color: '#E040FB', fontWeight: 'bold' }}>[圖鑑被動] </span>
                  {config.passiveType === 'attackPercentage' ? '所有角色攻擊力 ' : config.passiveType === 'defensePercentage' ? '所有角色防禦力 ' : '所有角色生命值 '}
                  +{Math.floor((config.passiveBaseValue || 0.01) * 100)}% / 級
                </p>
                {isOwned && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333' }}>
                    <p style={{ margin: 0, color: '#4CAF50', fontWeight: 'bold' }}>
                      目前圖鑑累計加成: +{Math.floor((config.passiveBaseValue || 0.01) * 100 * level)}%
                    </p>
                  </div>
                )}
              </div>

              {!isMax && (
                <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '12px' }}>升級進度</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: canUpgrade ? '#4CAF50' : '#2196F3', width: `${Math.min(100, (fragments / upgradeCost) * 100)}%`, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: canUpgrade ? '#4CAF50' : '#fff' }}>
                      {fragments} / {upgradeCost}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <Button
                  block
                  color="primary"
                  disabled={isMax || fragments < upgradeCost}
                  onClick={() => handleUpgrade(config.id)}
                >
                  {isMax ? '已達最高等級' : (isOwned ? '進階神器' : '解鎖神器')}
                </Button>

                {isOwned && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <span style={{ alignSelf: 'center', color: '#888', fontSize: '12px' }}>裝備至：</span>
                    {[0, 1, 2].map(slot => (
                      <Button
                        key={slot}
                        size="small"
                        onClick={() => handleEquip(config.id, slot)}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white' }}
                      >
                        欄位 {slot + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
