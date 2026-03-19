import React, { useState } from 'react';
import { Player } from '../types/game';
import { calculatePower } from '../utils/gameLogic';
import { FormattedNumber } from './FormattedNumber';
import { Dialog, Toast } from 'antd-mobile';

interface TopBarProps {
  player: Player;
  onOpenExchange: () => void;
  onSync: () => void | Promise<void>;
  onDownload: () => void | Promise<void>;
}

export const TopBar: React.FC<TopBarProps> = ({ player, onOpenExchange, onSync, onDownload }) => {
  const power = calculatePower(player);

  const handleSettingsClick = () => {
    Dialog.show({
      title: '遊戲設定',
      content: (
        <div style={{ textAlign: 'center', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <button
              onClick={() => {
                Dialog.clear();
                onSync();
              }}
              style={{
                background: 'linear-gradient(45deg, #00C853, #64DD17)',
                color: 'white', border: 'none', borderRadius: '8px',
                padding: '12px 24px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%',
                boxShadow: '0 4px 10px rgba(100,221,23,0.3)'
              }}
            >
              ☁️ 備份至雲端
            </button>
            <p style={{ marginTop: '5px', fontSize: '12px', color: '#888', margin: '5px 0 0 0' }}>
              覆蓋雲端紀錄 (上傳)
            </p>
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
            <button
              onClick={() => {
                Dialog.clear();
                onDownload();
              }}
              style={{
                background: 'linear-gradient(45deg, #1E88E5, #42A5F5)',
                color: 'white', border: 'none', borderRadius: '8px',
                padding: '12px 24px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%',
                boxShadow: '0 4px 10px rgba(30,136,229,0.3)'
              }}
            >
              📥 從雲端下載
            </button>
            <p style={{ marginTop: '5px', fontSize: '12px', color: '#888', margin: '5px 0 0 0' }}>
              讀取雲端紀錄 (會覆蓋本地)
            </p>
          </div>
        </div>
      ),
      closeOnAction: true,
      actions: [[{ key: 'cancel', text: '關閉' }]]
    });
  };

  return (
    <div style={{ padding: '12px 16px', background: 'rgba(10, 10, 25, 0.9)', borderBottom: '1px solid rgba(255, 215, 0, 0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>

        {/* Settings Gear */}
        <div style={{ marginRight: '12px' }}>
          <button
            onClick={handleSettingsClick}
            style={{
              background: 'transparent', border: 'none', fontSize: '24px',
              cursor: 'pointer', display: 'flex', alignItems: 'center'
            }}
          >
            ⚙️
          </button>
        </div>

        <div style={{ flex: 1, marginRight: '10px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)' }}>等級 {player.level}</p>
          <div style={{ position: 'relative', height: '20px', backgroundColor: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255, 215, 0, 0.3)', borderRadius: '10px' }}>
            <div
              style={{
                height: '100%',
                width: `${(player.exp / player.expToNext) * 100}%`,
                background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.8), rgba(255, 165, 0, 0.7))',
                borderRadius: '8px',
                transition: 'width 0.3s ease',
              }}
            />
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>
              <FormattedNumber value={player.exp} /> / <FormattedNumber value={player.expToNext} />
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#00E5FF' }}>💎 <FormattedNumber value={player.diamonds} /></p>
            <button
              onClick={onOpenExchange}
              style={{ background: '#00E5FF', color: '#000', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px rgba(0, 229, 255, 0.4)' }}
            >
              +
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--accent)' }}>💰 <FormattedNumber value={player.money} /></p>
          <p style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, var(--accent), var(--accent2))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.6)',
            animation: 'pulse 2s infinite'
          }}>
            ⚡ 戰力值 <FormattedNumber value={power} />
          </p>
        </div>
      </div>
    </div>
  );
};