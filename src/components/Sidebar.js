'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar({
  player,
  selectedTerritory,
  formatRemainingTime,
  handleDeclareWar,
  handleBattleAction,
  handleHarvest,
  battleLogs
}) {
  const router = useRouter();

  // Helper variables for sidebar selection
  let isAdjacent = false;
  let ongoingBattle = null;
  let isOwnedByUs = false;
  let currentOwner = 'Netral';
  let troopsCount = 100;
  let hasActiveResource = false;
  let isHarvestable = false;
  let resourceLabel = '';

  if (selectedTerritory && selectedTerritory.currentTData) {
    const tData = selectedTerritory.currentTData;
    isOwnedByUs = tData.kingdom && player && tData.kingdom.id === player.kingdom_id;
    currentOwner = tData.kingdom ? tData.kingdom.name : 'Netral';
    troopsCount = tData.troops_count !== undefined ? tData.troops_count : 100;

    if (tData.battles && tData.battles.length > 0) {
      ongoingBattle = tData.battles[0];
    }

    if (tData.resource_type) {
      hasActiveResource = true;
      if (tData.resource_type === 'wood') resourceLabel = 'Kayu 🪵';
      else if (tData.resource_type === 'iron') resourceLabel = 'Besi ⚙️';
      else if (tData.resource_type === 'spices') resourceLabel = 'Rempah-rempah 🌶️';
      
      if (isOwnedByUs) {
        isHarvestable = true;
      }
    }
  }

  // Handle protected actions (redirect to login if visitor)
  const executeProtectedAction = (actionFn) => {
    if (!player || !player.id) {
      router.push('/login');
    } else {
      actionFn();
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {player ? (
          <div className="player-profile">
            <div className="player-avatar">{player.username.charAt(0).toUpperCase()}</div>
            <div className="player-stats">
              <div className="name">
                Lv.{player.level || 1} {player.username} {player.role === 'KING' ? '(👑 Raja)' : '(Prajurit)'}
              </div>
              <div className="kingdom" style={{ color: player.kingdom.color_hex }}>
                Kerajaan {player.kingdom.name} (💰 {player.gold} G)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 'bold', width: '65px' }}>
                    ⚔️ STM: {player.stamina}/{100 + ((player.def_level || 1) - 1) * 10}
                  </span>
                  <div style={{ background: 'rgba(255,255,255,0.15)', width: '60px', height: '5px', borderRadius: '2.5px', overflow: 'hidden' }}>
                    <div style={{ 
                      background: '#10b981', 
                      width: `${Math.min(100, Math.floor((player.stamina / (100 + ((player.def_level || 1) - 1) * 10)) * 100))}%`, 
                      height: '100%' 
                    }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 'bold', width: '65px' }}>
                    ⚡ ENG: {player.energy}/{100 + ((player.eco_level || 1) - 1) * 10}
                  </span>
                  <div style={{ background: 'rgba(255,255,255,0.15)', width: '60px', height: '5px', borderRadius: '2.5px', overflow: 'hidden' }}>
                    <div style={{ 
                      background: '#fbbf24', 
                      width: `${Math.min(100, Math.floor((player.energy / (100 + ((player.eco_level || 1) - 1) * 10)) * 100))}%`, 
                      height: '100%' 
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="player-profile">
            <div className="player-avatar">?</div>
            <div className="player-stats">
              <div className="name">Tamu / Pengunjung</div>
              <div className="kingdom" style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>
                Silakan masuk untuk berinteraksi
              </div>
              <div style={{ marginTop: '5px' }}>
                <Link href="/login" className="rpg-btn" style={{ padding: '4px 10px', fontSize: '0.7rem', textDecoration: 'none' }}>
                  Masuk / Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-banner">
        <div className="banner-overlay">
          <h2 className="banner-title">Status Wilayah</h2>
        </div>
      </div>

      <div className="sidebar-content">
        {!selectedTerritory ? (
          <div className="empty-state">
            Pilih wilayah di peta untuk melihat detail atau memulai penyerangan.
          </div>
        ) : (
          <div className="territory-card">
            <div className="t-title">{selectedTerritory.name}</div>
            <div className="t-owner">{selectedTerritory.parent}{selectedTerritory.province}</div>
            <div className="t-stats">
              <div>👑 Kepemilikan: <strong style={{ color: selectedTerritory.currentTData?.kingdom?.color_hex || '#fff' }}>{currentOwner}</strong></div>
              <div>❤️ HP: <strong>{troopsCount}</strong> / 100</div>
            </div>

            {/* Ongoing Conquest Indicator */}
            {ongoingBattle && (
              <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                  <span>Progress Penaklukan</span>
                  <span>{Math.round(Math.max(0, Math.min(100, ((100 - troopsCount) / 100) * 100)))}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ 
                    width: `${Math.max(0, Math.min(100, ((100 - troopsCount) / 100) * 100))}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #f43f5e 0%, #ef4444 50%, #fb7185 100%)', 
                    boxShadow: '0 0 10px rgba(244, 63, 94, 0.5)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {ongoingBattle ? (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  onClick={() => executeProtectedAction(() => handleBattleAction('help_attack'))} 
                  className="btn-attack" 
                  style={{ flex: 1, backgroundColor: '#ef4444', marginTop: 0 }}
                >
                  Bantu Serang!
                </button>
                <button 
                  onClick={() => executeProtectedAction(() => handleBattleAction('help_defend'))} 
                  className="btn-attack" 
                  style={{ flex: 1, backgroundColor: '#3b82f6', marginTop: 0 }}
                >
                  Bantu Bertahan!
                </button>
              </div>
            ) : (
              <button 
                onClick={() => executeProtectedAction(handleDeclareWar)} 
                className="btn-attack" 
                disabled={isOwnedByUs}
              >
                {isOwnedByUs ? "Aman / Dikuasai" : (player?.role === 'KING' ? "Deklarasi Perang!" : (player ? "Menunggu Deklarasi Raja" : "Masuk untuk Berperang"))}
              </button>
            )}

            {/* Resources Panel */}
            {hasActiveResource ? (
              isHarvestable ? (
                <div style={{ marginTop: '15px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '6px' }}>Sumber Daya Teridentifikasi:</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '4px' }}>{resourceLabel}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '10px' }}>
                    ⏳ Tersedia selama: <strong style={{ color: '#fff' }}>{formatRemainingTime(selectedTerritory.currentTData.resource_expires_at)}</strong>
                  </div>
                  <button 
                    onClick={() => executeProtectedAction(() => handleHarvest(selectedTerritory.currentTData.id))} 
                    className="btn-attack" 
                    style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', marginTop: 0, width: '100%' }}
                  >
                    ⛏️ Panen Sumber Daya (⚡ 10)
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '15px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '6px' }}>Sumber Daya Teridentifikasi:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#a1a1aa', marginBottom: '4px' }}>{resourceLabel}</div>
                  <div style={{ fontSize: '0.7rem', color: '#71717a' }}>
                    ⏳ Tersedia selama: {formatRemainingTime(selectedTerritory.currentTData.resource_expires_at)}
                  </div>
                </div>
              )
            ) : (
              <div style={{ marginTop: '15px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center', color: '#71717a', fontSize: '0.75rem' }}>
                📭 Tidak ada sumber daya alam aktif di wilayah ini saat ini
              </div>
            )}

            {/* Combat Feeds */}
            {battleLogs.length > 0 && (
              <div style={{ marginTop: '15px', fontSize: '0.8rem', padding: '12px', borderRadius: '10px', background: 'rgba(10,10,15,0.7)', border: '1px solid rgba(255,255,255,0.06)', maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {battleLogs.map((log, index) => (
                  <div key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '6px', lineHeight: '1.4' }}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
