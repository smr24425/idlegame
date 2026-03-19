import { GameState } from '../types/game';
import { Card } from 'antd-mobile';
import { useEffect, useState, useRef } from 'react';
import { getTotalStats, PET_CONFIGS } from '../utils/gameLogic';

interface CombatScreenProps {
  gameState: GameState;
  onFightEnd: (result: 'win' | 'lose', finalPlayerHealth: number) => void;
  autoChallenge: boolean;
  setAutoChallenge: (val: boolean) => void;
}

export const CombatScreen: React.FC<CombatScreenProps> = ({ gameState, onFightEnd, autoChallenge, setAutoChallenge }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [playerHealth, setPlayerHealth] = useState(gameState.player.health);
  const [bossHealth, setBossHealth] = useState(gameState.currentBoss?.health || 0);
  const fightStartedRef = useRef(false);
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameState.currentBoss) return;

    // 每次進入新 boss (或再挑戰) 時，重置戰鬥狀態
    fightStartedRef.current = false;
    setLogs([]);
    setPlayerHealth(gameState.player.health);
    setBossHealth(gameState.currentBoss.maxHealth);
  }, [gameState.currentBoss, gameState.player.health]);

  // 自動滾動到日誌最底部
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (!gameState.currentBoss) return;
    if (fightStartedRef.current) return;

    let isCancelled = false;
    fightStartedRef.current = true;

    const fight = async () => {
      let pHealth = gameState.player.health; // Properly maintained by startFight state
      let bHealth = gameState.currentBoss?.maxHealth ?? 0;
      // Calculate player combat stats (base + equipment + pets)
      const stats = getTotalStats(gameState.player);
      const playerAttack = stats.attack;
      const playerDefense = stats.defense;
      const playerCritRate = Math.min(1, stats.critRate);
      const playerCritDamage = stats.critDamage;

      const bossAttack = gameState.currentBoss!.attack;
      const bossDefense = gameState.currentBoss!.defense;

      const newLogs: string[] = [`挑戰 ${gameState.currentBoss!.name}！`];
      setLogs(newLogs);
      setPlayerHealth(pHealth);
      setBossHealth(bHealth);

      let turn = 0;
      
      const activePetId = gameState.player.equippedPetId;
      const activePet = activePetId ? gameState.player.pets[activePetId] : null;
      const activePetConfig = activePet ? PET_CONFIGS.find(p => p.id === activePet.configId) : null;

      while (pHealth > 0 && bHealth > 0) {
        if (isCancelled) return;
        
        turn++;
        if (activePetConfig?.combatSkill) {
          const skill = activePetConfig.combatSkill;
          if (skill.triggerCondition === 'boss' && (turn - 1) % skill.triggerTurn === 0) {
            if (skill.type === 'heal') {
              const healFactor = skill.basePercent + (skill.levelPercent * activePet!.level);
              const healAmount = Math.floor(stats.health * healFactor);
              pHealth = Math.min(stats.health, pHealth + healAmount);
              setPlayerHealth(pHealth);
              newLogs.push(`✨ ${activePetConfig.name} 發動技能：回復 ${healAmount} 點生命！`);
              setLogs([...newLogs]);
            }
          }
        }

        // Player turn
        const isCrit = Math.random() < playerCritRate;
        const critMultiplier = isCrit ? 1.5 + playerCritDamage : 1;
        const baseDamage = Math.max(1, playerAttack - bossDefense);
        const playerDamage = Math.max(1, Math.floor(baseDamage * critMultiplier));
        bHealth = Math.max(0, bHealth - playerDamage);
        setBossHealth(bHealth);
        newLogs.push(`你造成 ${playerDamage} 傷害${isCrit ? '（暴擊）' : ''}！`);
        setLogs([...newLogs]);

        if (bHealth <= 0) {
          newLogs.push('你贏了！');
          setLogs([...newLogs]);
          setTimeout(() => {
            if (!isCancelled) onFightEnd('win', Math.max(0, pHealth));
          }, 300);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        if (isCancelled) return;

        // Boss turn
        const bossDamage = Math.max(1, bossAttack - playerDefense);
        pHealth = Math.max(0, pHealth - bossDamage);
        setPlayerHealth(pHealth);
        newLogs.push(`Boss 造成 ${bossDamage} 傷害！`);
        setLogs([...newLogs]);

        if (pHealth <= 0) {
          newLogs.push('你輸了！');
          setLogs([...newLogs]);
          setTimeout(() => {
            if (!isCancelled) onFightEnd('lose', Math.max(0, pHealth));
          }, 300);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };

    fight();

    return () => {
      isCancelled = true;
      fightStartedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentBoss]);

  const bossMaxHealth = gameState.currentBoss?.maxHealth || 1;
  const playerMaxHealth = getTotalStats(gameState.player).health;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Health Bars at Top */}
      <div style={{ padding: '14px', background: 'rgba(10, 10, 25, 0.9)', borderBottom: '1px solid rgba(255, 215, 0, 0.25)', position: 'relative' }}>
        {autoChallenge && (
          <button 
            onClick={() => setAutoChallenge(false)}
            style={{ 
              position: 'absolute', 
              top: '12px', 
              right: '14px', 
              zIndex: 10, 
              background: '#F44336', 
              color: 'white', 
              border: '1px solid #D32F2F', 
              borderRadius: '20px', 
              padding: '4px 12px', 
              fontSize: '12px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)'
            }}
          >
            🛑 停止自動
          </button>
        )}
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)' }}>Boss 生命</p>
          <div style={{ position: 'relative', height: '20px', backgroundColor: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255, 215, 0, 0.3)', borderRadius: '10px' }}>
            <div
              style={{
                height: '100%',
                width: `${(bossHealth / bossMaxHealth) * 100}%`,
                background: 'linear-gradient(90deg, rgba(255, 80, 80, 0.9), rgba(255, 30, 30, 0.8))',
                borderRadius: '8px',
                transition: 'width 0.5s ease',
              }}
            />
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>
              {bossHealth} / {bossMaxHealth}
            </span>
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)' }}>你的生命</p>
          <div style={{ position: 'relative', height: '20px', backgroundColor: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255, 215, 0, 0.3)', borderRadius: '10px' }}>
            <div
              style={{
                height: '100%',
                width: `${(playerHealth / playerMaxHealth) * 100}%`,
                background: 'linear-gradient(90deg, rgba(100, 255, 100, 0.8), rgba(0, 200, 100, 0.8))',
                borderRadius: '8px',
                transition: 'width 0.5s ease',
              }}
            />
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>
              {playerHealth} / {playerMaxHealth}
            </span>
          </div>
        </div>
      </div>

      {/* Combat Content */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '14px' }}>
        <h1 style={{ textAlign: 'center', margin: '10px 0', color: 'var(--accent)' }}>戰鬥中</h1>
        <div ref={logsRef} style={{ height: 'calc(100% - 56px)', overflow: 'auto' }}>
          <Card title="戰鬥日誌" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)', color: 'var(--text)' }}>
            {logs.map((log, index) => (
              <p key={index} style={{ margin: '6px 0', color: 'var(--muted)' }}>{log}</p>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};