import React from "react";
import { Button } from "antd-mobile";

interface StartScreenProps {
  userEmail: string | null;
  isSyncing: boolean;
  onLogout: () => void;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ userEmail, isSyncing, onLogout, onStart }) => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "white",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* RPG Background Elements */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `
          radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 60% 40%, rgba(255, 69, 0, 0.1) 0%, transparent 50%)
        `,
          zIndex: 0,
        }}
      />

      {/* Castle Silhouette */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "300px",
          height: "150px",
          background:
            "linear-gradient(to top, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)",
          clipPath:
            "polygon(0% 100%, 10% 80%, 20% 100%, 30% 70%, 40% 100%, 50% 60%, 60% 100%, 70% 80%, 80% 100%, 90% 90%, 100% 100%, 100% 0%, 0% 0%)",
          opacity: 0.3,
          zIndex: 1,
        }}
      />

      {/* Stars */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "4px",
          height: "4px",
          background: "#fff",
          borderRadius: "50%",
          animation: "twinkle 3s infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "20%",
          width: "6px",
          height: "6px",
          background: "#ffd700",
          borderRadius: "50%",
          animation: "twinkle 4s infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "70%",
          width: "3px",
          height: "3px",
          background: "#fff",
          borderRadius: "50%",
          animation: "twinkle 2s infinite",
        }}
      />

      {/* Magic Runes */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "10%",
          fontSize: "24px",
          color: "rgba(255, 215, 0, 0.3)",
          transform: "rotate(-15deg)",
          animation: "float 5s ease-in-out infinite",
        }}
      >
        ✦
      </div>
      <div
        style={{
          position: "absolute",
          top: "60%",
          right: "15%",
          fontSize: "20px",
          color: "rgba(138, 43, 226, 0.3)",
          transform: "rotate(20deg)",
          animation: "float 6s ease-in-out infinite",
        }}
      >
        ❋
      </div>

      {/* Game Title */}
      <div
        style={{
          fontSize: "3rem",
          fontWeight: "bold",
          textShadow:
            "0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)",
          zIndex: 1,
          animation: "glow 2s ease-in-out infinite alternate",
        }}
      >
        掛機谷
      </div>
      <p style={{ color: '#FFF', marginBottom: '30px' }}>
        當前版本: {__APP_VERSION__}
      </p>
      {/* Top right Logout */}
      {userEmail && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
          <Button
            color="danger"
            size="small"
            onClick={onLogout}
            loading={isSyncing}
            style={{ fontWeight: 'bold' }}
          >
            {isSyncing ? '同步中...' : '登出帳號'}
          </Button>
        </div>
      )}

      {userEmail && (
        <div style={{ marginBottom: "20px", background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', zIndex: 1 }}>
          <span style={{ color: '#00E5FF' }}>目前登入帳號：</span>
          <div style={{ color: '#FFF', fontWeight: 'bold', marginTop: '5px' }}>{userEmail}</div>
        </div>
      )}

      {/* Start Button */}
      <Button
        onClick={onStart}
        style={{
          width: "200px",
          height: "60px",
          fontSize: "1.2rem",
          fontWeight: "bold",
          background: "linear-gradient(45deg, #8b4513, #daa520)",
          border: "2px solid #ffd700",
          borderRadius: "30px",
          color: "white",
          boxShadow:
            "0 8px 32px rgba(218, 165, 32, 0.4), 0 4px 16px rgba(255, 215, 0, 0.2)",
          transition: "all 0.3s ease",
          zIndex: 1,
          cursor: "pointer",
        }}
      >
        開始遊戲
      </Button>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes glow {
            from { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6); }
            to { text-shadow: 0 0 30px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 215, 0, 0.8); }
          }
        `}
      </style>
    </div>
  );
};
