import React, { useEffect, useState } from 'react';
import { Player } from '../types/game';
import { Button, Dialog, Input } from 'antd-mobile';
import { AddOutline, MinusOutline } from 'antd-mobile-icons'; // 建議安裝 antd-mobile-icons

interface AttributePanelProps {
  player: Player;
  allocatePoint: (attr: keyof Player['attributes']) => void;
  visible: boolean;
  onClose: () => void;
}

export const AttributePanel: React.FC<AttributePanelProps> = ({
  player,
  allocatePoint,
  visible,
  onClose
}) => {
  const [tempAttributes, setTempAttributes] = useState(player.attributes);
  const [tempPoints, setTempPoints] = useState(player.availablePoints);

  useEffect(() => {
    if (visible) {
      setTempAttributes(player.attributes);
      setTempPoints(player.availablePoints);
    }
  }, [visible, player.attributes, player.availablePoints]);

  // 核心：統一處理點數變動
  const handlePointChange = (attr: keyof Player['attributes'], targetPoints: number, maxVal?: number) => {
    const isPercent = (attr === 'critRate' || attr === 'critDamage');
    const step = isPercent ? 0.01 : 1;

    // 1. 計算其他項已消耗點數
    let otherAttrSpent = 0;
    (Object.keys(tempAttributes) as Array<keyof Player['attributes']>).forEach(key => {
      if (key === attr) return;
      const s = (key === 'critRate' || key === 'critDamage') ? 0.01 : 1;
      const delta = Math.max(0, tempAttributes[key] - player.attributes[key]);
      otherAttrSpent += Math.round(delta / s);
    });

    // 2. 限制：不能超過可用總點數
    const maxCanSpend = player.availablePoints - otherAttrSpent;
    let finalPoints = Math.min(targetPoints, maxCanSpend);

    // 3. 限制：不能超過硬上限
    if (maxVal !== undefined) {
      const remainingToCap = maxVal - player.attributes[attr];
      const capPoints = isPercent ? Math.round(remainingToCap * 100) : remainingToCap;
      finalPoints = Math.min(finalPoints, capPoints);
    }

    // 4. 下限：不能低於 0（不能扣除原本就有的屬性）
    finalPoints = Math.max(0, finalPoints);

    // 更新狀態
    const nextValue = parseFloat((player.attributes[attr] + finalPoints * step).toFixed(2));
    setTempAttributes(prev => ({ ...prev, [attr]: nextValue }));
    setTempPoints(player.availablePoints - (otherAttrSpent + finalPoints));
  };

  const handleConfirm = () => {
    (Object.keys(tempAttributes) as Array<keyof Player['attributes']>).forEach(key => {
      const step = (key === 'critRate' || key === 'critDamage') ? 0.01 : 1;
      const pointsToSpend = Math.round((tempAttributes[key] - player.attributes[key]) / step);
      for (let i = 0; i < pointsToSpend; i++) allocatePoint(key);
    });
    onClose();
  };

  const renderAttrRow = (label: string, attr: keyof Player['attributes'], isPercent: boolean = false, maxVal?: number) => {
    const step = isPercent ? 0.01 : 1;
    const addedPoints = Math.round((tempAttributes[attr] - player.attributes[attr]) / step);
    const finalPreview = isPercent ? `${Math.round(tempAttributes[attr] * 100)}%` : tempAttributes[attr];

    return (
      <div style={{ marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 15 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 'bold' }}>{label}</span>
          <span style={{ color: '#1677ff', fontWeight: 'bold' }}>{finalPreview}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Min & - 按鈕 */}
          <Button size="mini" style={{ fontSize: '12px' }} onClick={() => handlePointChange(attr, 0, maxVal)}>Min</Button>
          <Button
            size="mini"
            style={{ fontSize: '12px' }}
            disabled={addedPoints <= 0}
            onClick={() => handlePointChange(attr, addedPoints - 1, maxVal)}
          >
            <MinusOutline />
          </Button>

          {/* 輸入框 */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: '#fff',
            padding: '0 4px'
          }}>
            <Input
              className='custom-input'
              type="number"
              value={addedPoints === 0 ? '' : addedPoints.toString()}
              placeholder="0"
              onChange={(val) => handlePointChange(attr, parseInt(val) || 0, maxVal)}
              style={{ '--font-size': '14px', textAlign: 'center' }}
            />
          </div>

          {/* + & Max 按鈕 */}
          <Button
            size="mini"
            style={{ fontSize: '12px' }}
            disabled={tempPoints <= 0}
            onClick={() => handlePointChange(attr, addedPoints + 1, maxVal)}
          >
            <AddOutline />
          </Button>
          <Button
            size="mini"
            style={{ fontSize: '12px' }}
            color="primary"
            onClick={() => handlePointChange(attr, 9999, maxVal)}
          >
            Max
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      title="調整屬性配點"
      content={
        <>
          <div style={{
            textAlign: 'center', padding: '12px', background: '#f0f7ff', borderRadius: '8px', marginBottom: 20
          }}>
            <div style={{ fontSize: 12, color: '#666' }}>可用配點</div>
            <div style={{ fontSize: 28, color: '#1677ff', fontWeight: 'bold' }}>{tempPoints}</div>
          </div>

          {renderAttrRow("生命加成", "health")}
          {renderAttrRow("攻擊力", "attack")}
          {/* {renderAttrRow("暴擊率", "critRate", true, 0.40)} */}
          {/* {renderAttrRow("暴擊傷害", "critDamage", true)} */}
          {renderAttrRow("防禦力", "defense")}
        </>
      }
      actions={[
        { key: 'confirm', text: '確認', bold: true, onClick: handleConfirm },
        { key: 'cancel', text: '取消', onClick: onClose },
      ]}
    />
  );
};