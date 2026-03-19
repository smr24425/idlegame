import { ConfigProvider, TabBar, Dialog, Toast } from "antd-mobile";
import { useState, useEffect, useRef } from "react";
import { useGameState } from "./hooks/useGameState";
import { useUIState } from "./hooks/useUIState";
import { TopBar } from "./components/TopBar";
import { MainScreen } from "./components/MainScreen";
import { CharacterScreen } from "./components/CharacterScreen";
import { CombatScreen } from "./components/CombatScreen";
import { AttributePanel } from "./components/AttributePanel";
import { InventoryScreen } from "./components/InventoryScreen";
import { StartScreen } from "./components/StartScreen";
import { GachaScreen } from "./components/GachaScreen";
import { PetScreen } from "./components/PetScreen";
import { AuthScreen } from "./components/AuthScreen";
import { generateEquipment, getActivePetBonus } from "./utils/gameLogic";
import { auth } from "./firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { uploadCloudSave, downloadCloudSave } from "./utils/cloudSync";
const tabs = [
  {
    key: "main",
    title: "主畫面",
    icon: "🏠",
  },
  {
    key: "character",
    title: "人物",
    icon: "👤",
  },
  {
    key: "inventory",
    title: "背包",
    icon: "🎒",
  },
  {
    key: "gacha",
    title: "抽卡",
    icon: "🎲",
  },
  {
    key: "pets",
    title: "寵物",
    icon: "🐾",
  },
];

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [autoChallenge, setAutoChallenge] = useState(false);
  const [exchangeModalVisible, setExchangeModalVisible] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState('1000');

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isManualLogin, setIsManualLogin] = useState(false);
  const isFirstLoad = useRef(true);

  // ...
  const {
    gameState,
    collectRewards,
    allocatePoint,
    startFight,
    endFight,
    equipItem,
    unequipItem,
    autoEquipBest,
    addEquipmentToInventory,
    sellItem,
    sellItemsByFilter,
    drawGacha,
    enhanceSlot,
    applyAutoEnhance,
    exchangeGoldForDiamonds,
    drawPetGacha,
    upgradePetSlot,
    bulkUpgradePetSlot,
    upgradePet,
    equipPet,
    loadCloudState
  } = useGameState();
  const {
    uiState,
    setActiveKey,
    setShowAttributes,
    setCollectDialog,
    setFightResultDialog,
  } = useUIState();

  const handleCollect = () => {
    const result = collectRewards();
    setCollectDialog({
      visible: true,
      exp: result.expGained,
      money: result.moneyGained,
      time: result.timeDiff,
      equipments: result.equipments,
    });
  };

  const handleChallengeBoss = () => {
    startFight();
    setActiveKey("combat"); // Switch to combat screen
  };

  const handleFightEnd = (
    result: "win" | "lose",
    finalPlayerHealth: number,
  ) => {
    // End the fight in state (advances stage / rewards on win, stops fighting)
    endFight(result, finalPlayerHealth);

    // Drop equipment based on the stage you just cleared
    if (result === "win") {
      const dropBonus = getActivePetBonus(gameState.player, 'dropRate');
      const equipment = generateEquipment(gameState.player.stage, 0.3, dropBonus);
      if (equipment) {
        addEquipmentToInventory(equipment);
      }

      if (autoChallenge) {
        Toast.show({
          content: `挑戰成功！掉落裝備：${equipment ? equipment.name : '無'}`,
          duration: 1200,
        });
        startFight();
        return; // Skip dialog tracking entirely
      }
    } else {
      if (autoChallenge) {
        setAutoChallenge(false); // Stop auto challenge on loss
      }
    }

    setFightResultDialog({ visible: true, result });
  };

  const closeFightResult = () => {
    setFightResultDialog({ visible: false, result: uiState.fightResultDialog.result });
    setActiveKey("main"); // Back to main
  };

  const renderContent = () => {
    if (uiState.activeKey === "combat" && gameState.isFighting) {
      return (
        <CombatScreen
          gameState={gameState}
          onFightEnd={handleFightEnd}
          autoChallenge={autoChallenge}
          setAutoChallenge={setAutoChallenge}
        />
      );
    }
    switch (uiState.activeKey) {
      case "main":
        return (
          <MainScreen
            gameState={gameState}
            onCollect={handleCollect}
            onChallengeBoss={handleChallengeBoss}
            autoChallenge={autoChallenge}
            setAutoChallenge={setAutoChallenge}
          />
        );
      case "character":
        return (
          <CharacterScreen
            player={gameState.player}
            inventoryStones={gameState.inventory.items.find(i => i.id === 'upgrade_stone')?.quantity || 0}
            onOpenAttributes={() => setShowAttributes(true)}
            onUnequip={unequipItem}
            onAutoEquipBest={autoEquipBest}
            onEnhanceSlot={(type) => {
              const res = enhanceSlot(type);
              if (!res.success && res.message) {
                Dialog.alert({ content: res.message });
              }
            }}
            onApplyAutoEnhance={applyAutoEnhance}
          />
        );
      case "inventory":
        return (
          <InventoryScreen
            gameState={gameState}
            onEquip={(id: string) => {
              const eq = gameState.inventory.equipment.find((e) => e.id === id);
              if (eq) equipItem(eq);
            }}
            onSell={(id: string) => sellItem(id)}
            onBulkSell={(filters: number[]) => sellItemsByFilter(filters)}
          />
        );
      case "gacha":
        return (
          <GachaScreen
            gameState={gameState}
            onDraw={drawGacha}
            onDrawPet={drawPetGacha}
          />
        );
      case "pets":
        return (
          <PetScreen
            gameState={gameState}
            upgradePetSlot={upgradePetSlot}
            bulkUpgradePetSlot={bulkUpgradePetSlot}
            upgradePet={upgradePet}
            equipPet={equipPet}
          />
        );
      default:
        return null;
    }
  };

  // Auth Effect hooks
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      } else {
        // If user changed after first load AND user exists, it's a manual login
        if (user) {
          setIsManualLogin(true);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCloudStart = async () => {
    if (!currentUser) return;

    // 只有在剛手動輸入帳號密碼登入時，才去雲端抓資料。如是自動登入則直接用本地資料
    if (isManualLogin) {
      Toast.show({ icon: 'loading', content: '載入雲端資料中...', duration: 0 });
      const cloudState = await downloadCloudSave(currentUser.uid);
      Toast.clear();
      loadCloudState(cloudState);
      setIsManualLogin(false);
    }

    setIsStarted(true);
  };

  const handleManualDownload = async () => {
    if (!currentUser) return;
    Toast.show({ icon: 'loading', content: '下載雲端資料中...', duration: 0 });
    const cloudState = await downloadCloudSave(currentUser.uid);
    Toast.clear();
    if (cloudState) {
      loadCloudState(cloudState);
      Toast.show('已成功下載雲端進度！');
    } else {
      Toast.show('雲端沒有發現存檔紀錄。');
    }
  };

  const handleCloudLogout = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    const success = await uploadCloudSave(currentUser.uid, gameState);
    setIsSyncing(false);
    if (success) {
      Toast.show('資料已備份至雲端，登出成功！');
      await signOut(auth);
      setIsStarted(false);
    } else {
      Toast.show('資料同步失敗，請檢查網路連線。');
    }
  };

  const handleManualSync = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    Toast.show({ icon: 'loading', content: '同步資料中...', duration: 0 });
    const success = await uploadCloudSave(currentUser.uid, gameState);
    Toast.clear();
    setIsSyncing(false);
    if (success) {
      Toast.show('同步成功！進度已備份至雲端。');
    } else {
      Toast.show('同步失敗，請稍後再試。');
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', justifyContent: 'center', alignItems: 'center', background: '#000', color: '#FFF' }}>
        系統載入中...
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  if (!isStarted) {
    return (
      <ConfigProvider>
        <StartScreen
          userEmail={currentUser.email}
          isSyncing={isSyncing}
          onLogout={handleCloudLogout}
          onStart={handleCloudStart}
        />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider>
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-gradient)",
          color: "var(--text)",
        }}
      >
        <TopBar
          player={gameState.player}
          onOpenExchange={() => setExchangeModalVisible(true)}
          onSync={handleManualSync}
          onDownload={handleManualDownload}
        />
        <div style={{ flex: 1, overflow: "auto", paddingBottom: "calc(60px + env(safe-area-inset-bottom))" }}>
          {renderContent()}
        </div>
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "rgba(10, 10, 25, 0.9)",
            borderTop: "1px solid rgba(255, 215, 0, 0.25)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <TabBar activeKey={uiState.activeKey} onChange={setActiveKey} style={{ background: 'transparent' }}>
            {tabs.map((item) => {
              const isActive = uiState.activeKey === item.key;
              return (
                <TabBar.Item
                  key={item.key}
                  icon={<span style={{ color: isActive ? 'var(--accent)' : 'var(--muted)', fontSize: 18 }}>{item.icon}</span>}
                  title={<span style={{ color: isActive ? 'var(--accent)' : 'var(--muted)', fontSize: 12 }}>{item.title}</span>}
                />
              );
            })}
          </TabBar>
        </div>
        <AttributePanel
          player={gameState.player}
          allocatePoint={allocatePoint}
          visible={uiState.showAttributes}
          onClose={() => setShowAttributes(false)}
        />
        <Dialog
          visible={uiState.collectDialog.visible}
          title="獲得收益"
          content={`獲得了 ${uiState.collectDialog.time} 秒的收益！\n經驗: +${uiState.collectDialog.exp}\n金錢: +${uiState.collectDialog.money}${uiState.collectDialog.equipments.length > 0 ? `\n裝備: ${uiState.collectDialog.equipments.map((eq) => eq.name).join(", ")}` : ""}`}
          closeOnAction
          onClose={() =>
            setCollectDialog({
              visible: false,
              exp: 0,
              money: 0,
              time: 0,
              equipments: [],
            })
          }
          actions={[
            {
              key: "ok",
              text: "確定",
              bold: true
            },
          ]}
        />
        <Dialog
          visible={uiState.fightResultDialog.visible}
          title={
            uiState.fightResultDialog.result === "win" ? "勝利！" : "失敗！"
          }
          content={
            uiState.fightResultDialog.result === "win"
              ? "恭喜你打敗了Boss！"
              : "很遺憾，你輸了。"
          }
          closeOnAction
          onClose={closeFightResult}
          actions={[
            {
              key: "ok",
              text: "確定",
              bold: true
            },
          ]}
        />
        <Dialog
          visible={exchangeModalVisible}
          title="資源兌換"
          content={
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '15px' }}>每 100 金幣可兌換 1 鑽石</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  value={exchangeAmount}
                  onChange={e => setExchangeAmount(e.target.value)}
                  type="number"
                  style={{ width: '100px', background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '4px', border: '1px solid #666', color: 'white' }}
                />
              </div>
              <p style={{ marginTop: '10px', color: '#00E5FF', fontSize: '14px' }}>預計獲得: 💎 {Math.floor(parseInt(exchangeAmount || '0') / 100)}</p>
            </div>
          }
          actions={[
            {
              key: 'cancel',
              text: '取消',
              onClick: () => setExchangeModalVisible(false),
            },
            {
              key: 'ok',
              text: '兌換',
              bold: true,
              onClick: () => {
                const amount = parseInt(exchangeAmount);
                if (isNaN(amount) || amount <= 0 || amount % 100 !== 0) {
                  Toast.show('請輸入100的倍數');
                  return;
                }
                if (gameState.player.money < amount) {
                  Toast.show('金幣不足');
                  return;
                }
                exchangeGoldForDiamonds(amount);
                Toast.show('兌換成功！');
                setExchangeModalVisible(false);
              }
            }
          ]}
        />
      </div>
    </ConfigProvider>
  );
}

export default App;
