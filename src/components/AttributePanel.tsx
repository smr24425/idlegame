import { Player } from '../types/game';
import { Button, Dialog, Space } from 'antd-mobile'; // 加入 Space 讓排版整齊
import { useEffect, useState } from 'react';

interface AttributePanelProps {
  player: Player;
  allocatePoint: (attr: keyof Player['attributes']) => void;
  visible: boolean;
  onClose: () => void;
}

export const AttributePanel: React.FC<AttributePanelProps> = ({ player, allocatePoint, visible, onClose }) => {
  const [tempAttributes, setTempAttributes] = useState(player.attributes);
  const [tempPoints, setTempPoints] = useState(player.availablePoints);

  // 單次增加邏輯
  const handleIncrease = (attr: keyof Player['attributes']) => {
    if (tempPoints > 0) {
      if (attr === 'critRate' && tempAttributes.critRate >= 0.40) return;

      setTempAttributes(prev => ({
        ...prev,
        [attr]: attr === 'critRate' || attr === 'critDamage'
          ? parseFloat((prev[attr] + 0.01).toFixed(2))
          : prev[attr] + 1,
      }));
      setTempPoints(prev => prev - 1);
    }
  };

  // 全投邏輯 (Max)
  const handleMax = (attr: keyof Player['attributes']) => {
    if (tempPoints <= 0) return;

    let pointsToAdd = tempPoints;

    // 暴擊率特殊處理：不能超過 0.40
    if (attr === 'critRate') {
      const remainingCrit = 0.40 - tempAttributes.critRate;
      if (remainingCrit <= 0) return;
      const maxCritPoints = Math.floor(remainingCrit * 100);
      pointsToAdd = Math.min(tempPoints, maxCritPoints);
    }

    setTempAttributes(prev => ({
      ...prev,
      [attr]: attr === 'critRate' || attr === 'critDamage'
        ? parseFloat((prev[attr] + pointsToAdd * 0.01).toFixed(2))
        : prev[attr] + pointsToAdd,
    }));
    setTempPoints(prev => prev - pointsToAdd);
  };

  // 單次減少邏輯
  const handleDecrease = (attr: keyof Player['attributes']) => {
    const minValue = player.attributes[attr];
    const step = attr === 'critRate' || attr === 'critDamage' ? 0.01 : 1;
    if (tempAttributes[attr] > minValue) {
      setTempAttributes(prev => ({
        ...prev,
        [attr]: parseFloat((prev[attr] - step).toFixed(2)),
      }));
      setTempPoints(prev => prev + 1);
    }
  };

  // 全部收回邏輯 (Min)
  const handleMin = (attr: keyof Player['attributes']) => {
    const minValue = player.attributes[attr];
    if (tempAttributes[attr] <= minValue) return;

    const diff = tempAttributes[attr] - minValue;
    const pointsToReturn = (attr === 'critRate' || attr === 'critDamage')
      ? Math.round(diff * 100)
      : diff;

    setTempAttributes(prev => ({
      ...prev,
      [attr]: minValue,
    }));
    setTempPoints(prev => prev + pointsToReturn);
  };

  // 確認與取消邏輯保持不變...
  const handleConfirm = () => {
    Object.keys(tempAttributes).forEach(key => {
      const attr = key as keyof Player['attributes'];
      const delta = tempAttributes[attr] - player.attributes[attr];
      if (delta <= 0) return;
      const step = attr === 'critRate' || attr === 'critDamage' ? 0.01 : 1;
      const pointsToSpend = Math.round(delta / step);
      for (let i = 0; i < pointsToSpend; i++) {
        allocatePoint(attr);
      }
    });
    onClose();
  };

  const handleCancel = () => {
    setTempAttributes(player.attributes);
    setTempPoints(player.availablePoints);
    onClose();
  };

  useEffect(() => {
    if (visible) {
      setTempAttributes(player.attributes);
      setTempPoints(player.availablePoints);
    }
  }, [player, visible]);

  // 渲染屬性列的元件，減少重覆代碼
  const renderAttrRow = (label: string, attr: keyof Player['attributes'], isPercent: boolean = false, maxVal?: number) => (
    <div style={{ marginBottom: 15, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold', color: '#1677ff' }}>
          {isPercent ? `${(tempAttributes[attr] * 100).toFixed(1)}%` : tempAttributes[attr]}
        </span>
      </div>
      <Space>
        <Button size="mini" onClick={() => handleMin(attr)}>Min</Button>
        <Button size="mini" onClick={() => handleDecrease(attr)}>-</Button>
        <Button size="mini" onClick={() => handleIncrease(attr)}
          disabled={tempPoints <= 0 || (maxVal !== undefined && tempAttributes[attr] >= maxVal)}>
          +
        </Button>
        <Button size="mini" color="primary" onClick={() => handleMax(attr)}
          disabled={tempPoints <= 0 || (maxVal !== undefined && tempAttributes[attr] >= maxVal)}>
          Max
        </Button>
      </Space>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      title="屬性分配"
      content={
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 16 }}>
            可用點數: <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{tempPoints}</span>
          </div>
          {renderAttrRow("生命加成", "health")}
          {renderAttrRow("攻擊力", "attack")}
          {renderAttrRow("暴擊率", "critRate", true, 0.40)}
          {renderAttrRow("暴擊傷害", "critDamage", true)}
          {renderAttrRow("防禦力", "defense")}
        </div>
      }
      actions={[
        { key: 'confirm', text: '確認保存', bold: true, onClick: handleConfirm },
        { key: 'cancel', text: '取消修改', onClick: handleCancel },
      ]}
    />
  );
};