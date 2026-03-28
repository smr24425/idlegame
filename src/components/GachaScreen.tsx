import React, { useState } from 'react';
import { GameState, Equipment } from '../types/game';
import { Card, Button, Dialog, Switch } from 'antd-mobile';
import { FormattedNumber } from './FormattedNumber';
import { getItemConfig, getRarityStyles } from '../utils/logic';

interface GachaScreenProps {
  gameState: GameState;
  onDraw: (times: number, isAutoSell: boolean) => { success: boolean; equipments: Equipment[]; totalGainGold?: number };
  onDrawPet: (times: number) => { success: boolean; results: any[], message: string };
  onDrawArtifact: (times: number) => { success: boolean; results: any[], message: string };
  onDrawMegaPet: (times: number) => { success: boolean; message: string; results?: { type: string; amount: number }[] };
}

export const GachaScreen: React.FC<GachaScreenProps> = ({ gameState, onDraw, onDrawPet, onDrawArtifact, onDrawMegaPet }) => {
  const [resultEquipments, setResultEquipments] = useState<Equipment[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [lastDrawAmount, setLastDrawAmount] = useState<number>(1);

  const [resultPets, setResultPets] = useState<any[]>([]);
  const [petDialogVisible, setPetDialogVisible] = useState(false);
  const [lastPetDrawAmount, setLastPetDrawAmount] = useState<number>(1);

  const [resultArtifacts, setResultArtifacts] = useState<any[]>([]);
  const [artifactDialogVisible, setArtifactDialogVisible] = useState(false);
  const [lastArtifactDrawAmount, setLastArtifactDrawAmount] = useState<number>(1);
  const [isAutoSell, setIsAutoSell] = useState(true);
  const [totalGainGold, setTotalGainGold] = useState<number>(0);

  const [megaPetDialogVisible, setMegaPetDialogVisible] = useState(false);
  const [megaPetResults, setMegaPetResults] = useState<{ type: string; amount: number }[]>([]);
  const [lastMegaPetDrawAmount, setLastMegaPetDrawAmount] = useState<number>(1);

  const handleDraw = (times: number) => {
    const result = onDraw(times, isAutoSell);
    if (!result.success) {
      Dialog.alert({
        title: '金錢不足',
        content: `需要 ${times * 100} 金錢才能抽卡！`,
        confirmText: '確定'
      });
      return;
    }
    setLastDrawAmount(times);
    setResultEquipments(result.equipments);
    setDialogVisible(true);
    setTotalGainGold(result.totalGainGold || 0);
  };

  const handleDrawPet = (times: number) => {
    const res = onDrawPet(times);
    if (!res.success) {
      Dialog.alert({
        title: '鑽石不足',
        content: `需要 ${times * 100} 鑽石才能抽取！`,
        confirmText: '確定'
      });
      return;
    }
    setLastPetDrawAmount(times);
    setResultPets(res.results);
    setPetDialogVisible(true);
  };

  const handleDrawArtifact = (times: number) => {
    const res = onDrawArtifact(times);
    if (!res.success) {
      Dialog.alert({
        title: '鑽石不足',
        content: `需要 ${times * 100} 鑽石才能抽取！`,
        confirmText: '確定'
      });
      return;
    }
    setLastArtifactDrawAmount(times);
    setResultArtifacts(res.results);
    setArtifactDialogVisible(true);
  };

  const handleDrawMegaPet = (times: number) => {
    const res = onDrawMegaPet(times);
    if (!res.success) {
      Dialog.alert({ title: '鑽石不足', content: res.message, confirmText: '確定' });
      return;
    }
    setLastMegaPetDrawAmount(times);
    setMegaPetResults(res.results || []);
    setMegaPetDialogVisible(true);
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <Card title="裝備抽卡" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--accent)' }}>
          目前{getItemConfig('money').name}: {getItemConfig('money').icon} <FormattedNumber value={gameState.player.money} />
        </p>

        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
          每次抽卡花費 100 {getItemConfig('money').name}，獲得與當前等級相同的裝備！<br />
          有機率出現強力的 <span style={{ color: '#ff4444', fontWeight: 'bold' }}>紅色裝備</span>！
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', marginBottom: '20px' }}>
          <div style={{ color: 'var(--muted)', fontSize: '14px' }}>自動出售紅色以下裝備</div>
          <Switch
            aria-setsize={1}
            checked={isAutoSell}
            onChange={setIsAutoSell}
            style={{ marginLeft: '10px' }}
          />
        </div>

        <Button
          block
          size="large"
          color="primary"
          onClick={() => handleDraw(1)}
          style={{ marginBottom: '15px', background: 'linear-gradient(45deg, #FF9800, #FF5722)', border: 'none', fontWeight: 'bold', borderRadius: '8px' }}
        >
          單抽 ({getItemConfig('money').icon} 100)
        </Button>
        <Button
          block
          size="large"
          color="primary"
          onClick={() => handleDraw(10)}
          style={{ marginBottom: '15px', background: 'linear-gradient(45deg, #E91E63, #9C27B0)', border: 'none', fontWeight: 'bold', borderRadius: '8px' }}
        >
          十連抽 ({getItemConfig('money').icon} 1000)
        </Button>
        <Button
          block
          size="large"
          color="primary"
          onClick={() => handleDraw(100)}
          style={{ background: 'linear-gradient(45deg, #E91E63, #9C27B0)', border: 'none', fontWeight: 'bold', borderRadius: '8px' }}
        >
          百連抽 ({getItemConfig('money').icon} 10000)
        </Button>
      </Card>

      <Card title="寵物抽卡" style={{ marginTop: '15px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', marginBottom: '20px', color: '#00E5FF', fontWeight: 'bold' }}>
          目前{getItemConfig('diamonds').name}: {getItemConfig('diamonds').icon} <FormattedNumber value={gameState.player.diamonds} />
        </p>

        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
          每次抽取需要 100 {getItemConfig('diamonds').name}，獲取強力的永久增益寵物！<br />
          有機率獲得專屬特定寵物碎片與通用的{getItemConfig('pet_upgrade_fragment').icon}{getItemConfig('pet_upgrade_fragment').name}。
        </p>

        <Button
          block
          size="large"
          color="success"
          onClick={() => handleDrawPet(1)}
          style={{ marginBottom: '15px', fontWeight: 'bold', borderRadius: '8px' }}
        >
          單抽 ({getItemConfig('diamonds').icon} 100)
        </Button>
        <Button
          block
          size="large"
          color="warning"
          onClick={() => handleDrawPet(10)}
          style={{ fontWeight: 'bold', borderRadius: '8px' }}
        >
          十連抽 ({getItemConfig('diamonds').icon} 1000)
        </Button>
      </Card>

      <Card title="神器抽卡" style={{ marginTop: '15px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', marginBottom: '20px', color: '#00E5FF', fontWeight: 'bold' }}>
          目前{getItemConfig('diamonds').name}: {getItemConfig('diamonds').icon} <FormattedNumber value={gameState.player.diamonds} />
        </p>

        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
          每抽取一次花費 100 {getItemConfig('diamonds').name}。<br />
          有機率獲得完整神器（1%）或神器碎片，40 片可解鎖對應的神器！
        </p>

        <Button
          block
          size="large"
          color="primary"
          onClick={() => handleDrawArtifact(1)}
          style={{ marginBottom: '15px', background: 'linear-gradient(45deg, #1E88E5, #42A5F5)', border: 'none', fontWeight: 'bold', borderRadius: '8px' }}
        >
          單抽 ({getItemConfig('diamonds').icon} 100)
        </Button>
        <Button
          block
          size="large"
          color="primary"
          onClick={() => handleDrawArtifact(10)}
          style={{ background: 'linear-gradient(45deg, #FFB300, #FDD835)', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '8px' }}
        >
          十連抽 ({getItemConfig('diamonds').icon} 1000)
        </Button>
      </Card>

      <Card title="萌獸抽卡" style={{ marginTop: '15px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)', textAlign: 'center', position: 'relative' }}>
        {gameState.player.rebirths < 2 && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <span style={{ fontSize: '48px', marginBottom: '10px' }}>⛓️</span>
            <span style={{ color: '#FF5252', fontWeight: 'bold', fontSize: '18px' }}>需達成 2 次轉生</span>
          </div>
        )}
        <p style={{ fontSize: '18px', marginBottom: '20px', color: '#00E5FF', fontWeight: 'bold' }}>
          目前{getItemConfig('diamonds').name}: {getItemConfig('diamonds').icon} <FormattedNumber value={gameState.player.diamonds} />
        </p>

        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
          每抽取一次花費 1,000,000 {getItemConfig('diamonds').name}。<br />
          每次抽取可獲得 1~2 個萌獸碎片！
        </p>

        <Button
          block
          size="large"
          color="warning"
          onClick={() => handleDrawMegaPet(1)}
          style={{ marginBottom: '15px', fontWeight: 'bold', borderRadius: '8px' }}
        >
          單抽 ({getItemConfig('diamonds').icon} <FormattedNumber value={1000000} />)
        </Button>
        <Button
          block
          size="large"
          color="danger"
          onClick={() => handleDrawMegaPet(10)}
          style={{ fontWeight: 'bold', borderRadius: '8px' }}
        >
          十連抽 ({getItemConfig('diamonds').icon} <FormattedNumber value={10000000} />)
        </Button>
      </Card>

      <Dialog
        visible={dialogVisible}
        title="抽卡結果"
        onClose={() => setDialogVisible(false)}
        content={
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '10px' }}>
            {totalGainGold > 0 && (
              <div style={{ color: 'var(--muted)', textAlign: 'center', gridColumn: '1 / -1' }}>
                獲得 {getItemConfig('money').icon} {totalGainGold}
              </div>
            )}
            {resultEquipments.length > 0 ? resultEquipments.map((eq, idx) => {
              const rStyle = getRarityStyles(eq.rarity);
              return (
                <div key={idx} style={{
                  border: `2px solid ${rStyle.color}`,
                  borderRadius: '8px',
                  padding: '5px',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  boxShadow: rStyle.boxShadow
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 'bold' }}>{eq.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Lv {eq.level}</div>
                </div>
              )
            }) : <div style={{
              visibility: 'hidden',
              border: `2px solid`,
              borderRadius: '8px',
              padding: '5px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 'bold' }}>空</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>空</div>
            </div>}
          </div>
        }
        actions={[
          {
            key: 'again',
            text: lastDrawAmount === 10 ? '再次十連' : lastDrawAmount === 100 ? '再次百連抽' : '再次單抽',
            onClick: () => handleDraw(lastDrawAmount),
            style: { color: '#FF9800', fontWeight: 'bold' }
          },
          {
            key: 'ok',
            text: '確定',
            bold: true,
            onClick: () => setDialogVisible(false)
          }
        ]}
      />

      <Dialog
        visible={petDialogVisible}
        title={`抽卡結果 (距離保底: ${100 - (gameState.player.petGachaPity || 0)})`}
        onClose={() => setPetDialogVisible(false)}
        content={
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '10px' }}>
            {resultPets.map((r, idx) => {
              let borderColor = '#9E9E9E';
              let textColor = '#FFF';
              let name = '';
              let desc = '';
              let bgColor = 'rgba(0,0,0,0.3)';

              if (r.type === 'full') {
                const itemConfig = getItemConfig(`pet_fragment_${r.pet.id}`);
                const rStyle = getRarityStyles(itemConfig.rarity);
                borderColor = rStyle.color;
                textColor = rStyle.color;
                name = `${r.pet.rarity} ${r.pet.name}`;
                desc = '完整寵物';
                bgColor = itemConfig.rarity === 'gold' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(224, 64, 251, 0.1)';
              } else if (r.type === 'upgrade_fragment') {
                const itemConfig = getItemConfig('pet_upgrade_fragment');
                const rStyle = getRarityStyles(itemConfig.rarity);
                borderColor = rStyle.color;
                textColor = rStyle.color;
                name = `${itemConfig.icon}${itemConfig.name}`;
                desc = `x${r.amount}`;
              } else {
                const itemConfig = getItemConfig(`pet_fragment_${r.pet.id}`);
                const rStyle = getRarityStyles(itemConfig.rarity);
                borderColor = rStyle.color;
                textColor = rStyle.color;
                name = r.pet.name.substring(0, 3) + '碎';
                desc = `x${r.amount}`;
              }

              return (
                <div key={idx} style={{
                  border: `2px solid ${borderColor}`,
                  borderRadius: '8px',
                  padding: '5px',
                  textAlign: 'center',
                  background: bgColor,
                  boxShadow: r.type === 'full' ? `0 0 10px ${borderColor}` : 'none'
                }}>
                  <div style={{ fontSize: '11px', color: textColor, fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '2px', fontWeight: 'bold' }}>{desc}</div>
                </div>
              );
            })}
          </div>
        }
        actions={[
          {
            key: 'again',
            text: lastPetDrawAmount === 10 ? '再次十連' : '再次單抽',
            onClick: () => handleDrawPet(lastPetDrawAmount),
            style: { color: '#00E5FF', fontWeight: 'bold' }
          },
          {
            key: 'ok',
            text: '確定',
            bold: true,
            onClick: () => setPetDialogVisible(false)
          }
        ]}
      />

      <Dialog
        visible={artifactDialogVisible}
        title="抽卡結果"
        onClose={() => setArtifactDialogVisible(false)}
        content={
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '10px' }}>
            {resultArtifacts.map((r, idx) => {
              const itemConfig = getItemConfig(`artifact_fragment_${r.artifact.id}`);
              const rStyle = getRarityStyles(itemConfig.rarity);
              let borderColor = rStyle.color;
              let textColor = borderColor;
              let name = '';
              let desc = '';
              let bgColor = 'rgba(0,0,0,0.3)';
              let isFull = false;

              if (r.type === 'full') {
                isFull = true;
                name = `🏺 ${r.artifact.name}`;
                desc = '完整神器';
                bgColor = itemConfig.rarity === 'gold' ? 'rgba(255,215,0,0.1)' : (itemConfig.rarity === 'purple' ? 'rgba(224,64,251,0.1)' : 'rgba(76,175,80,0.1)');
              } else {
                name = `${r.artifact.name}碎片`;
                desc = `x${r.amount}`;
              }

              return (
                <div key={idx} style={{
                  border: `2px solid ${borderColor}`,
                  borderRadius: '8px',
                  padding: '5px',
                  textAlign: 'center',
                  background: bgColor,
                  boxShadow: isFull ? `0 0 10px ${borderColor}` : 'none'
                }}>
                  <div style={{ fontSize: '10px', color: textColor, fontWeight: 'bold' }}>{name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{desc}</div>
                </div>
              );
            })}
          </div>
        }
        actions={[
          {
            key: 'again',
            text: lastArtifactDrawAmount === 10 ? '再次十連' : '再次單抽',
            onClick: () => handleDrawArtifact(lastArtifactDrawAmount),
            style: { color: '#FF9800', fontWeight: 'bold' }
          },
          {
            key: 'ok',
            text: '確定',
            bold: true,
            onClick: () => setArtifactDialogVisible(false)
          }
        ]}
      />

      <Dialog
        visible={megaPetDialogVisible}
        title="抽卡結果"
        onClose={() => setMegaPetDialogVisible(false)}
        content={
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '10px' }}>
            {megaPetResults.map((r, idx) => {
              const itemConfig = getItemConfig('mega_pet_fragment');
              const rStyle = getRarityStyles(itemConfig.rarity);
              return (
                <div key={idx} style={{
                  border: `2px solid ${rStyle.color}`,
                  borderRadius: '8px',
                  padding: '5px',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  boxShadow: rStyle.boxShadow,
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>{itemConfig.icon}</div>
                  <div style={{ fontSize: '10px', color: rStyle.color, fontWeight: 'bold' }}>
                    {itemConfig.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text)', marginTop: '2px', fontWeight: 'bold' }}>x{r.amount}</div>
                </div>
              );
            })}
          </div>
        }
        actions={[
          {
            key: 'again',
            text: lastMegaPetDrawAmount === 10 ? '再次十連' : '再次單抽',
            onClick: () => handleDrawMegaPet(lastMegaPetDrawAmount),
            style: { color: lastMegaPetDrawAmount === 10 ? '#FF5252' : '#FF9800', fontWeight: 'bold' }
          },
          {
            key: 'ok',
            text: '確定',
            bold: true,
            onClick: () => setMegaPetDialogVisible(false)
          }
        ]}
      />

    </div>
  );
};
