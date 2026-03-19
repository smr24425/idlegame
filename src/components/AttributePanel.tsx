import { Player } from '../types/game';
import { Button, Dialog } from 'antd-mobile';
import { useState } from 'react';

interface AttributePanelProps {
  player: Player;
  allocatePoint: (attr: keyof Player['attributes']) => void;
  visible: boolean;
  onClose: () => void;
}

export const AttributePanel: React.FC<AttributePanelProps> = ({ player, allocatePoint, visible, onClose }) => {
  const [tempAttributes, setTempAttributes] = useState(player.attributes);
  const [tempPoints, setTempPoints] = useState(player.availablePoints);

  const handleIncrease = (attr: keyof Player['attributes']) => {
    if (tempPoints > 0) {
      setTempAttributes(prev => ({
        ...prev,
        [attr]: attr === 'critRate' || attr === 'critDamage'
          ? parseFloat((prev[attr] + 0.01).toFixed(2))
          : prev[attr] + 1,
      }));
      setTempPoints(prev => prev - 1);
    }
  };

  const handleDecrease = (attr: keyof Player['attributes']) => {
    const minValue = attr === 'critRate' || attr === 'critDamage' ? player.attributes[attr] : player.attributes[attr];
    const step = attr === 'critRate' || attr === 'critDamage' ? 0.01 : 1;
    if (tempAttributes[attr] > minValue) {
      setTempAttributes(prev => ({
        ...prev,
        [attr]: attr === 'critRate' || attr === 'critDamage'
          ? parseFloat((prev[attr] - step).toFixed(2))
          : prev[attr] - step,
      }));
      setTempPoints(prev => prev + 1);
    }
  };

  const handleConfirm = () => {
    // Apply changes
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

  return (
    <Dialog
      visible={visible}
      title="屬性分配"
      content={
        <div>
          <p>可用點數: {tempPoints}</p>
          <div style={{ marginBottom: 10 }}>
            <p>生命加成: {tempAttributes.health}</p>
            <Button size="small" onClick={() => handleDecrease('health')}>-</Button>
            <Button size="small" onClick={() => handleIncrease('health')} disabled={tempPoints <= 0}>+</Button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <p>攻擊: {tempAttributes.attack}</p>
            <Button size="small" onClick={() => handleDecrease('attack')}>-</Button>
            <Button size="small" onClick={() => handleIncrease('attack')} disabled={tempPoints <= 0}>+</Button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <p>暴擊率: {(tempAttributes.critRate * 100).toFixed(1)}%</p>
            <Button size="small" onClick={() => handleDecrease('critRate')}>-</Button>
            <Button size="small" onClick={() => handleIncrease('critRate')} disabled={tempPoints <= 0}>+</Button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <p>暴擊傷害: {(tempAttributes.critDamage * 100).toFixed(1)}%</p>
            <Button size="small" onClick={() => handleDecrease('critDamage')}>-</Button>
            <Button size="small" onClick={() => handleIncrease('critDamage')} disabled={tempPoints <= 0}>+</Button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <p>防禦: {tempAttributes.defense}</p>
            <Button size="small" onClick={() => handleDecrease('defense')}>-</Button>
            <Button size="small" onClick={() => handleIncrease('defense')} disabled={tempPoints <= 0}>+</Button>
          </div>
        </div>
      }
      closeOnAction={false}
      actions={[
        {
          key: 'cancel',
          text: '取消',
          onClick: handleCancel,
        },
        {
          key: 'confirm',
          text: '確認',
          bold: true,
          onClick: handleConfirm,
        },
      ]}
    />
  );
};