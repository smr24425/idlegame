import React, { useState } from 'react';
import { GameState, PetConfig } from '../types/game';
import { PET_CONFIGS, PET_UPGRADE_COSTS, calculateBulkPetSlotUpgrade } from '../utils/gameLogic';
import { FormattedNumber } from './FormattedNumber';
import { getItemConfig } from '../utils/gameLogic';
import { Card, Button, Toast, Dialog } from 'antd-mobile';

interface PetScreenProps {
  gameState: GameState;
  upgradePet: (petId: string) => { success: boolean; message: string };
  equipPet: (petId: string | null) => void;
  upgradePetSlot: () => { success: boolean; message: string };
  bulkUpgradePetSlot: () => { success: boolean; message: string; levels: number };
}

export const PetScreen: React.FC<PetScreenProps> = ({
  gameState,
  upgradePet,
  equipPet,
  upgradePetSlot,
  bulkUpgradePetSlot
}) => {
  const [showBulkPreview, setShowBulkPreview] = useState(false);

  const getEffectText = (config: PetConfig) => {
    const val = config.baseValue * 100;
    switch (config.effectType) {
      case 'goldGain': return `掛機金幣 +${val}%`;
      case 'expGain': return `掛機經驗 +${val}%`;
      case 'dropRate': return `高階掉落率 +${val}%`;
      case 'dualResource': return `經驗與金幣雙 +${val}%`;
      case 'healthPercentage': return `生命值 +${val}%`;
      case 'attackPercentage': return `攻擊力 +${val}%`;
      case 'defensePercentage': return `防禦力 +${val}%`;
      default: return '';
    }
  };

  const getPassiveText = (config: PetConfig) => {
    switch (config.passiveType) {
      case 'healthPercentage': return `生命值`;
      case 'attackPercentage': return `攻擊力`;
      case 'defensePercentage': return `防禦力`;
      default: return '';
    }
  };

  const slotLevel = gameState.player.petSlotLevel || 1;
  const slotGoldCost = slotLevel * 1000;
  const isBreakthrough = slotLevel % 10 === 0;
  const slotFragmentCost = isBreakthrough ? Math.floor(slotLevel / 10) * 10 : 0;

  const ownedUpgradeFragments = gameState.inventory.items.find(i => i.id === 'pet_upgrade_fragment')?.quantity || 0;

  const handleSlotUpgrade = () => {
    const res = upgradePetSlot();
    if (!res.success) Toast.show(res.message);
    else Toast.show('欄位升級成功！');
  };

  const handleBulkSlotUpgrade = () => {
    setShowBulkPreview(true);
  };

  const equippedConfig = gameState.player.equippedPetId ? PET_CONFIGS.find(c => c.id === gameState.player.equippedPetId) : null;
  const equippedPet = equippedConfig ? gameState.player.pets[equippedConfig.id] : null;

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>

      {/* 出戰與欄位升級區塊 */}
      <Card title="當前出戰配置" style={{ marginBottom: '15px', background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          {/* 出戰寵物展示 */}
          <div style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid #FFD700', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#FFD700' }}>👑 目前出戰</h3>
            {equippedConfig && equippedPet ? (
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#FFF', fontSize: '18px' }}>
                  <span style={{ color: equippedConfig.rarity === 'SSR' ? '#FFD700' : '#E040FB', marginRight: '5px' }}>
                    {equippedConfig.rarity}
                  </span>
                  {equippedConfig.name} <span style={{ color: '#4CAF50', fontSize: '14px' }}>Lv.{equippedPet.level}</span>
                </h4>
                <p style={{ margin: 0, color: '#4CAF50', fontWeight: 'bold' }}>加成: {getEffectText(equippedConfig).split('+')[0]} +{Math.floor(equippedConfig.baseValue * 100 * (1 + equippedPet.level))}%</p>
                <Button size="small" color="danger" style={{ marginTop: '10px' }} onClick={() => equipPet(null)}>卸下寵物</Button>
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--muted)' }}>尚未裝備任何寵物</p>
            )}
          </div>

          {/* 欄位升級區塊 */}
          <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFF' }}>寵物等級 Lv.{slotLevel}</span>
              <div>
                <Button size="small" color="primary" onClick={handleSlotUpgrade} style={{ marginRight: '8px' }}>升級</Button>
                <Button size="small" color="warning" onClick={handleBulkSlotUpgrade}>一鍵升級</Button>
              </div>
            </div>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#4CAF50' }}>主角基礎生命 +{slotLevel * 10} | 主角基礎攻擊 +{slotLevel * 5}</p>
            <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--muted)' }}>
              <span>消耗金幣: <span style={{ color: gameState.player.money >= slotGoldCost ? '#FFD700' : '#F44336' }}><FormattedNumber value={slotGoldCost} /></span></span>
              {isBreakthrough && (
                <span>{getItemConfig('pet_upgrade_fragment').icon}{getItemConfig('pet_upgrade_fragment').name}: <span style={{ color: ownedUpgradeFragments >= slotFragmentCost ? '#00E5FF' : '#F44336' }}>{ownedUpgradeFragments} / {slotFragmentCost}</span></span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card title="寵物圖鑑與合成" style={{ marginBottom: '15px', background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '10px' }}>收集碎片解鎖寵物。重複抽取可獲得碎片用於強化升級。</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {PET_CONFIGS.map(config => {
            const playerPet = gameState.player.pets[config.id];
            const isOwned = !!playerPet;
            const isEquipped = gameState.player.equippedPetId === config.id;
            const level = playerPet ? playerPet.level : -1;

            const ownedFragments = gameState.inventory.items.find(i => i.id === `pet_fragment_${config.id}`)?.quantity || 0;

            const baseCost = level === -1 ? 1 : PET_UPGRADE_COSTS[level];
            const upgradeCost = baseCost ? baseCost * 30 : null;

            return (
              <div key={config.id} style={{
                padding: '10px',
                border: isEquipped ? '2px solid #4CAF50' : '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                background: isOwned ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)',
                opacity: isOwned ? 1 : 0.6
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#FFF', fontSize: '15px' }}>
                      <span style={{ color: config.rarity === 'SSR' ? '#FFD700' : '#E040FB', marginRight: '5px' }}>
                        {config.rarity}
                      </span>
                      {config.name} {isOwned && <span style={{ fontSize: '12px', color: '#4CAF50' }}>Lv.{level}</span>}
                    </h3>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text)' }}>
                      <span style={{ color: '#00E5FF', fontWeight: 'bold' }}>[出戰主動] </span>
                      {getEffectText(config)}
                      {isOwned && level > 0 && <span style={{ color: '#00E5FF', marginLeft: '5px' }}>目前: +{Math.floor(config.baseValue * 100 * (1 + level))}%</span>}
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text)' }}>
                      <span style={{ color: '#E040FB', fontWeight: 'bold' }}>[圖鑑被動] </span>
                      {getPassiveText(config)} +{Math.floor(config.passiveBaseValue * 100)}%
                      {isOwned && level > 0 && <span style={{ color: '#E040FB', marginLeft: '5px' }}>目前: +{Math.floor(config.passiveBaseValue * 100 * (1 + level))}%</span>}
                    </p>
                    {config.combatSkill && (
                      <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#FF5252' }}>
                        ⚔️ 首領戰每 {config.combatSkill.triggerTurn} 回合回復 {Math.floor(config.combatSkill.basePercent * 100)}% (+{Math.floor(config.combatSkill.levelPercent * 100)}%/Lv) 生命
                      </p>
                    )}
                    <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
                      {config.description}
                    </p>
                  </div>
                  {isOwned && (
                    <Button
                      size="small"
                      color={isEquipped ? 'default' : 'primary'}
                      onClick={() => equipPet(isEquipped ? null : config.id)}
                      style={{ background: isEquipped ? 'transparent' : undefined, color: isEquipped ? '#FFF' : undefined, border: isEquipped ? '1px solid #FFF' : undefined }}
                    >
                      {isEquipped ? '已出戰' : '出戰'}
                    </Button>
                  )}
                </div>

                {upgradeCost !== null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '12px', color: ownedFragments >= upgradeCost ? '#4CAF50' : '#F44336' }}>
                      碎片: {ownedFragments} / {upgradeCost}
                    </div>
                    <Button
                      size="small"
                      color={isOwned ? 'success' : 'warning'}
                      onClick={() => {
                        const res = upgradePet(config.id);
                        if (!res.success) Toast.show(res.message);
                        else Toast.show(isOwned ? '寵物升級成功！' : '解鎖成功！');
                      }}
                      disabled={ownedFragments < upgradeCost}
                    >
                      {isOwned ? '強化升級' : '解鎖寵物'}
                    </Button>
                  </div>
                )}
                {isOwned && upgradeCost === null && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#FFD700', textAlign: 'center' }}>
                    已達最高等級 MAX
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {showBulkPreview && (() => {
        const preview = calculateBulkPetSlotUpgrade(slotLevel, gameState.player.money, ownedUpgradeFragments);
        return (
          <Dialog
            visible={showBulkPreview}
            title={<span style={{ color: '#FFD700', fontWeight: 'bold' }}>一鍵升級預覽</span>}
            content={(
              <div style={{ textAlign: 'center' }}>
                {preview.levelsGained > 0 ? (
                  <>
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,215,0,0.3)', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                      <div style={{ color: '#FFD700', fontSize: '16px', fontWeight: 'bold' }}>寵物等級預估</div>
                      <div style={{ fontSize: '14px', marginTop: '5px' }}>Lv.{slotLevel} ➔ <span style={{ color: '#4CAF50' }}>Lv.{preview.newLevel}</span></div>
                    </div>
                    <div style={{ borderTop: '1px dashed #666', paddingTop: '10px' }}>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: 'var(--text)' }}>預計總消耗：</p>
                      <p style={{ margin: '5px 0', color: '#FFD700', fontWeight: 'bold', fontSize: '16px' }}>{getItemConfig('money').icon} <FormattedNumber value={preview.totalGoldSpent} /> {getItemConfig('money').name}</p>
                      {preview.totalFragmentsSpent > 0 && <p style={{ margin: '5px 0', color: '#00E5FF', fontWeight: 'bold', fontSize: '16px' }}>{getItemConfig('pet_upgrade_fragment').icon} <FormattedNumber value={preview.totalFragmentsSpent} /> {getItemConfig('pet_upgrade_fragment').name}</p>}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '20px 0' }}>
                    <p style={{ color: '#F44336', fontSize: '16px', fontWeight: 'bold' }}>無法進行一鍵升級！</p>
                    <p style={{ color: 'var(--text)', fontSize: '14px', marginTop: '10px' }}>您的金幣或寵物強化石不足以升至下一等級。</p>
                  </div>
                )}
              </div>
            )}
            actions={[
              ...(preview.levelsGained > 0 ? [{
                key: 'confirm',
                text: '確認消耗升級',
                bold: true,
                onClick: () => {
                  const res = bulkUpgradePetSlot();
                  if (res.success) Toast.show(res.message);
                  setShowBulkPreview(false);
                }
              }] : []),
              {
                key: 'cancel',
                text: '取消',
                onClick: () => setShowBulkPreview(false)
              }
            ]}
          />
        );
      })()}

    </div>
  );
};
