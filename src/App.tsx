import { ConfigProvider, TabBar, Dialog, Toast } from "antd-mobile";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector, Provider } from "react-redux";
import { store, RootState, AppDispatch } from "./store/store";
import {
  collectRewards, startFight, endFight, autoEquipBest, doRebirth,
  enhanceSlot, applyAutoEnhance, sellItemsByFilter, drawGacha,
  drawPetGacha, drawArtifactGacha, drawMegaPetGacha, upgradePetSlot,
  bulkUpgradePetSlot, upgradePet, unlockMegaPet, rerollMegaPetStats,
  levelUpMegaPet, upgradeArtifact, exchangeGoldForDiamonds
} from "./store/gameThunks";
import { gameActions } from "./store/gameSlice";
import { useGameLoop } from "./hooks/useGameLoop";
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
import { ArtifactScreen } from "./components/ArtifactScreen";
import { AuthScreen } from "./components/AuthScreen";
import { RebirthScreen } from "./components/RebirthScreen";
import { generateEquipment, getActivePetBonus, getItemConfig } from "./utils/logic";
import { auth } from "./firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { uploadCloudSave, downloadCloudSave } from "./utils/cloudSync";
import { MegaPetScreen } from "./components/MegaPetScreen";
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
    key: "rebirth",
    title: "重生",
    icon: "🔥",
  },
];

function App() {
  const hasLocalData = !!localStorage.getItem('idleGameState');
  const [isStarted, setIsStarted] = useState(false);
  const [autoChallenge, setAutoChallenge] = useState(false);
  const [exchangeModalVisible, setExchangeModalVisible] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState('1000');

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(!hasLocalData);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isManualLogin, setIsManualLogin] = useState(false);
  const isFirstLoad = useRef(true);

  // ...
  const dispatch = useDispatch<AppDispatch>();
  const gameState = useSelector((state: RootState) => state.game);
  useGameLoop();
  const {
    uiState,
    setActiveKey,
    setShowAttributes,
    setCollectDialog,
    setFightResultDialog,
  } = useUIState();

  const handleCollect = () => {
    const result = dispatch(collectRewards());
    setCollectDialog({
      visible: true,
      exp: result.expGained,
      money: result.moneyGained,
      time: result.timeDiff,
      equipments: result.equipments,
    });
  };

  const handleChallengeBoss = () => {
    dispatch(startFight());
    setActiveKey("combat"); // Switch to combat screen
  };

  const handleFightEnd = (
    result: "win" | "lose",
    finalPlayerHealth: number,
  ) => {
    // End the fight in state (advances stage / rewards on win, stops fighting)
    dispatch(endFight(result, finalPlayerHealth));

    // Drop equipment based on the stage you just cleared
    if (result === "win") {
      const dropBonus = getActivePetBonus(gameState.player, 'dropRate');
      const equipment = generateEquipment(gameState.player.stage, 0.3, dropBonus);
      if (equipment) {
        dispatch(gameActions.addEquipments([equipment]));
      }

      if (autoChallenge) {
        Toast.show({
          content: `挑戰成功！掉落裝備：${equipment ? equipment.name : '無'}`,
          duration: 1200,
        });
        dispatch(startFight());
        return; // Skip dialog tracking entirely
      }

      setFightResultDialog({
        visible: true,
        result: "win",
      });
    } else {
      setAutoChallenge(false); // Disable auto on death
      setFightResultDialog({ visible: true, result: "lose" });
    }
  };

  const closeFightResult = () => {
    setFightResultDialog({ visible: false, result: uiState.fightResultDialog.result });
    setActiveKey("main"); // Back to main
  };

  const renderContent = () => {
    return (
      <>
        {uiState.activeKey === "main" && (
          <MainScreen
            gameState={gameState}
            onCollect={handleCollect}
            onChallengeBoss={handleChallengeBoss}
            autoChallenge={autoChallenge}
            setAutoChallenge={setAutoChallenge}
            onNavigate={setActiveKey}
          />
        )}
        {uiState.activeKey === "character" && (
          <CharacterScreen
            player={gameState.player}
            inventoryStones={gameState.inventory.items.find(i => i.id === 'upgrade_stone')?.quantity || 0}
            onOpenAttributes={() => setShowAttributes(true)}
            onUnequip={(type) => dispatch(gameActions.unequipItem(type))}
            onAutoEquipBest={() => dispatch(autoEquipBest())}
            onEnhanceSlot={(type) => {
              const res = dispatch(enhanceSlot(type)) as any;
              if (!res?.success && res?.message) {
                Dialog.alert({ content: res.message });
              }
            }}
            onApplyAutoEnhance={() => {
              const res = dispatch(applyAutoEnhance()) as any;
              return res?.canUpgradeAny || false;
            }}
          />
        )}
        {uiState.activeKey === "inventory" && (
          <InventoryScreen
            gameState={gameState}
            onEquip={(id: string) => {
              const eq = gameState.inventory.equipment.find(e => e.id === id);
              if (eq) dispatch(gameActions.equipItem(eq));
            }}
            onSell={(id: string) => dispatch(gameActions.sellItem(id))}
            onBulkSell={(filters: number[]) => dispatch(sellItemsByFilter(filters))}
          />
        )}
        {uiState.activeKey === "combat" && (
          <CombatScreen
            gameState={gameState}
            onFightEnd={handleFightEnd}
            autoChallenge={autoChallenge}
            setAutoChallenge={setAutoChallenge}
          />
        )}
        {uiState.activeKey === "gacha" && (
          <GachaScreen
            gameState={gameState}
            onDraw={(times, autoSell) => dispatch(drawGacha(times, autoSell)) as any}
            onDrawPet={(times) => dispatch(drawPetGacha(times)) as any}
            onDrawArtifact={(times) => dispatch(drawArtifactGacha(times)) as any}
            onDrawMegaPet={(times) => dispatch(drawMegaPetGacha(times)) as any}
          />
        )}
        {uiState.activeKey === "pets" && (
          <PetScreen
            gameState={gameState}
            equipPet={(id) => dispatch(gameActions.setEquippedPet(id))}
            upgradePetSlot={() => dispatch(upgradePetSlot()) as any}
            bulkUpgradePetSlot={() => dispatch(bulkUpgradePetSlot()) as any}
            upgradePet={(id) => dispatch(upgradePet(id)) as any}
          />
        )}
        {uiState.activeKey === "megapet" && (
          <MegaPetScreen
            gameState={gameState}
            unlockMegaPet={(index) => dispatch(unlockMegaPet(index)) as any}
            rerollMegaPetStats={(index, l0, l1, l2) => dispatch(rerollMegaPetStats(index, l0, l1, l2)) as any}
            levelUpMegaPet={(index) => dispatch(levelUpMegaPet(index)) as any}
          />
        )}
        {uiState.activeKey === "artifacts" && (
          <ArtifactScreen
            gameState={gameState}
            upgradeArtifact={(id) => dispatch(upgradeArtifact(id)) as any}
            equipArtifact={(id, slot) => dispatch(gameActions.equipArtifactSync({ slot, id }))}
            unequipArtifact={(slot) => dispatch(gameActions.unequipArtifactSync({ slot }))}
          />
        )}
        {uiState.activeKey === "rebirth" && (
          <RebirthScreen
            gameState={gameState}
            onRebirth={() => {
              dispatch(doRebirth());
              setActiveKey('main');
            }}
          />
        )}
      </>
    );
  };

  // Auth Effect hooks
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      } else {
        if (user) {
          setIsManualLogin(true);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCloudStart = async () => {
    if (currentUser && isManualLogin) {
      Toast.show({ icon: 'loading', content: '載入雲端資料中...', duration: 0 });
      const cloudState = await downloadCloudSave(currentUser.uid);
      Toast.clear();
      if (cloudState) dispatch(gameActions.setState(cloudState));
      setIsManualLogin(false);
    }

    setIsStarted(true);
  };

  const handleManualSync = async () => {
    if (!currentUser) {
      Toast.show('尚未登入，請稍後再試。若在無網路狀態下將無法備份。');
      return;
    }
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

  const handleManualDownload = async () => {
    if (!currentUser) {
      Toast.show('尚未登入，請稍後再試。若在無網路狀態下將無法下載。');
      return;
    }
    Toast.show({ icon: 'loading', content: '下載雲端資料中...', duration: 0 });
    const cloudState = await downloadCloudSave(currentUser.uid);
    Toast.clear();
    if (cloudState) {
      dispatch(gameActions.setState(cloudState));
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

  if (!isStarted) {
    if (hasLocalData) {
      return (
        <ConfigProvider>
          <StartScreen
            userEmail={currentUser?.email || ''}
            isSyncing={isSyncing}
            onLogout={handleCloudLogout}
            onStart={handleCloudStart}
          />
        </ConfigProvider>
      );
    }

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

    return (
      <ConfigProvider>
        <StartScreen
          userEmail={currentUser?.email || ''}
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
        <div style={{
          paddingTop: 'env(safe-area-inset-top)'
        }}>
          <TopBar
            player={gameState.player}
            onOpenExchange={() => setExchangeModalVisible(true)}
            onSync={handleManualSync}
            onDownload={handleManualDownload}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: "auto" }}>
          {renderContent()}
        </div>

        <div
          style={{
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
          allocatePoint={(attr) => dispatch(gameActions.allocatePoint(attr))}
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
              <p style={{ marginTop: '10px', color: '#00E5FF', fontSize: '14px' }}>預計獲得: {getItemConfig('diamonds').icon} {Math.floor(parseInt(exchangeAmount || '0') / 100)}</p>
            </div>
          }
          actions={[
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
                dispatch(exchangeGoldForDiamonds(amount));
                Toast.show('兌換成功！');
                setExchangeModalVisible(false);
              }
            },
            {
              key: 'cancel',
              text: '取消',
              onClick: () => setExchangeModalVisible(false),
            },
          ]}
        />
      </div>
    </ConfigProvider>
  );
}

export default function AppWrapper() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
