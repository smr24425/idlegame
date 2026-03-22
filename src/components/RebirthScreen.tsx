import { Card, Button, Dialog } from 'antd-mobile';
import { GameState } from '../types/game';

interface RebirthScreenProps {
  gameState: GameState;
  onRebirth: () => void;
}

export const RebirthScreen: React.FC<RebirthScreenProps> = ({ gameState, onRebirth }) => {
  const { player } = gameState;
  const rebirths = player.rebirths || 0;

  const canRebirth = player.level >= 2000 + (rebirths * 500);

  const handleRebirthClick = () => {
    Dialog.confirm({
      content: '確定要進行重生嗎？只保留金錢、鑽石與寵物、神器等物品，其餘將會重置，並獲得永久能力加成！',
      onConfirm: async () => {
        onRebirth();
      },
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#FFD700', textAlign: 'center', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>重生系統</h1>

      <Card title="當前重生狀態" style={{ background: 'var(--card-bg)', color: 'white', marginTop: '20px', border: '1px solid #FFD700' }}>
        <p style={{ fontSize: '18px', textAlign: 'center' }}>
          已重生次數: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{rebirths}</span> 次
        </p>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px', marginTop: '15px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#00E5FF' }}>目前累積加成</h3>
          <p>❤️ 總生命加成: +{rebirths * 20}%</p>
          <p>⚔️ 總攻擊加成: +{rebirths * 20}%</p>
          <p>🛡️ 總防禦加成: +{rebirths * 20}%</p>
          <p>🎯 額外暴擊率: +{(rebirths * 1).toFixed(1)}%</p>
          <p>💥 額外暴擊傷害: +{(rebirths * 50).toFixed(1)}%</p>
          <p>⚔️ 裝備欄位等級提升: +{rebirths * 100}</p>
          <p>⚔️ 經驗加成和金錢加成 +{rebirths * 100}%</p>
        </div>
      </Card>

      <Card title="進行重生" style={{ background: 'var(--card-bg)', color: 'white', marginTop: '20px' }}>
        <p style={{ textAlign: 'center', color: canRebirth ? '#4CAF50' : '#F44336', fontWeight: 'bold' }}>
          重生條件: 達到 {2000 + (rebirths * 500)} 等級
        </p>
        <p style={{ textAlign: 'center', margin: '10px 0' }}>
          目前等級: {player.level} / {2000 + (rebirths * 500)}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '15px' }}>
          * 重生後將獲得各基礎屬性 +20%、暴擊率 +1%、暴擊傷害 +50% 的永久加成。
        </p>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '15px' }}>
          * 重生後將獲得裝備欄位等級 +100。
        </p>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '15px' }}>
          * 重生後將獲得經驗加成和金錢加成 +100%。
        </p>

        <Button
          block
          color="primary"
          disabled={!canRebirth}
          onClick={handleRebirthClick}
          style={{
            background: canRebirth ? 'linear-gradient(45deg, #FF9800, #F44336)' : '#555',
            border: 'none',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          {canRebirth ? '立即重生' : '等級不足'}
        </Button>
      </Card>
    </div>
  );
};
