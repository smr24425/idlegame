# 掛機RPG遊戲

使用 React、Antd Mobile 和 PWA 支持構建的獨立掛機RPG遊戲。

## 功能

- 等級系統與經驗值
- 關卡進度與Boss戰鬥
- 角色屬性（力量、敏捷、智力）與點數分配
- 回合制戰鬥對抗Boss
- 根據當前關卡自動收入
- 本地保存進度以供離線遊玩
- 移動端優化UI
- PWA 以供安裝應用體驗

## 遊戲玩法

- 每分鐘根據當前關卡自動獲得經驗和金錢（手動收集）
- 升級以分配屬性點數
- 在每個關卡挑戰Boss以進度
- 贏得戰鬥以進度並獲得獎勵
- 底部導航欄切換主畫面和人物頁面
- 戰鬥自動執行，顯示實時日誌

## 開始使用

1. 安裝依賴: `npm install`
2. 啟動開發服務器: `npm run dev`
3. 生產構建: `npm run build`

## 技術

- 使用 TypeScript 的 React
- Antd Mobile 用於UI組件
- Vite 用於構建工具
- 使用 vite-plugin-pwa 的 PWA 支持