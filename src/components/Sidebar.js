'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Import RPG components
import ProfileTab from './rpg/ProfileTab';
import SkillsTab from './rpg/SkillsTab';
import InventoryTab from './rpg/InventoryTab';
import ShopTab from './rpg/ShopTab';
import MarketTab from './rpg/MarketTab';
import CraftingTab from './rpg/CraftingTab';

export default function Sidebar({
  player,
  selectedTerritory,
  formatRemainingTime,
  handleDeclareWar,
  handleBattleAction,
  handleHarvest,
  battleLogs,

  // Navigation States
  sidebarTab,
  setSidebarTab,

  // Active battles tracking
  territories = [],
  focusTerritory,

  // RPG States & Handlers
  equippedAtk,
  equippedDef,
  equippedAgi,
  equippedCrit,
  equippedSummary,
  handleUpgradeSkill,
  handleEquipItem,
  handleUnequipItem,
  handleSellItem,

  // Shop Handlers
  chestRates,
  ratesSum,
  handleOpenChest,
  handleBuyShopItem,
  handleRateChange,
  submitChestRates,

  // Market states & handlers
  marketBuyType,
  setMarketBuyType,
  marketBuyRarity,
  setMarketBuyRarity,
  marketBuyName,
  setMarketBuyName,
  marketBuyPrice,
  setMarketBuyPrice,
  marketTemplates,
  orderBook,
  myOrders,
  handlePlaceBuyOrder,
  handleCancelOrder,

  // Crafting handlers
  recipes,
  handleCraftItem
}) {
  const router = useRouter();
  const [inventorySubTab, setInventorySubTab] = useState('inv');

  // Handle protected actions (redirect to login if visitor)
  const executeProtectedAction = (actionFn) => {
    if (!player || !player.id) {
      router.push('/login');
    } else {
      actionFn();
    }
  };

  // Calculate active battles
  const activeBattles = territories.filter(t => t.battles && t.battles.length > 0);

  // Helper variables for selected territory dossier
  let ongoingBattle = null;
  let isOwnedByUs = false;
  let currentOwner = 'Netral';
  let troopsCount = 100;
  let hasActiveResource = false;
  let isHarvestable = false;
  let resourceLabel = '';
  let isAdjacent = false;

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

  const handleLogout = () => {
    localStorage.removeItem('player');
    router.push('/login');
  };

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
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

        <div className="header-buttons">
          {player && <button className="logout-btn" onClick={handleLogout}>Keluar</button>}
        </div>
      </div>

      <div className="sidebar-banner">
        <div className="banner-overlay">
          <h2 className="banner-title" style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>
            {sidebarTab === 'profile' && "Daftar Profil Panglima"}
            {sidebarTab === 'skill' && "Latihan & Peningkatan Kemampuan"}
            {sidebarTab === 'inventory' && "Tas Inventaris & Pandai Besi"}
            {sidebarTab === 'market' && "Bursa Efek Peralatan"}
            {sidebarTab === 'battles' && "Informasi Tempur Nusantara"}
            {sidebarTab === 'detail' && "Dossier Informasi Wilayah"}
          </h2>
        </div>
      </div>

      {/* Main Sidebar Body - Vertical Side Navigation */}
      <div className="sidebar-body">
        {/* Left Side-Navigation Menu */}
        <div className="sidebar-menu">
          <div 
            className={`sidebar-menu-item ${sidebarTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setSidebarTab('profile')}
          >
            <span className="sidebar-menu-item-icon">👤</span>
            <span>Profil</span>
          </div>

          <div 
            className={`sidebar-menu-item ${sidebarTab === 'skill' ? 'active' : ''}`} 
            onClick={() => setSidebarTab('skill')}
          >
            <span className="sidebar-menu-item-icon">⚡</span>
            <span>Skill</span>
          </div>

          <div 
            className={`sidebar-menu-item ${sidebarTab === 'inventory' ? 'active' : ''}`} 
            onClick={() => setSidebarTab('inventory')}
          >
            <span className="sidebar-menu-item-icon">🎒</span>
            <span>Barang</span>
          </div>

          <div 
            className={`sidebar-menu-item ${sidebarTab === 'market' ? 'active' : ''}`} 
            onClick={() => setSidebarTab('market')}
          >
            <span className="sidebar-menu-item-icon">📈</span>
            <span>Pasar</span>
          </div>

          <div 
            className={`sidebar-menu-item ${sidebarTab === 'battles' ? 'active' : ''}`} 
            onClick={() => setSidebarTab('battles')}
          >
            <span className="sidebar-menu-item-icon">⚔️</span>
            <span>Tempur</span>
          </div>

          <div 
            className={`sidebar-menu-item ${sidebarTab === 'detail' ? 'active' : ''}`} 
            onClick={() => setSidebarTab('detail')}
          >
            <span className="sidebar-menu-item-icon">🗺️</span>
            <span>Detail</span>
          </div>
        </div>

        {/* Right Side Content Panel */}
        <div className="sidebar-content">
          {/* Tab 1: Profile */}
          {sidebarTab === 'profile' && player && (
            <ProfileTab 
              player={player} 
              equippedAtk={equippedAtk}
              equippedDef={equippedDef}
              equippedAgi={equippedAgi}
              equippedCrit={equippedCrit}
              equippedSummary={equippedSummary}
            />
          )}
          {sidebarTab === 'profile' && !player && (
            <div className="empty-state">Silakan login untuk memantau profil panglima Anda.</div>
          )}

          {/* Tab 2: Skills */}
          {sidebarTab === 'skill' && player && (
            <SkillsTab 
              player={player} 
              handleUpgradeSkill={handleUpgradeSkill} 
            />
          )}
          {sidebarTab === 'skill' && !player && (
            <div className="empty-state">Silakan login untuk melatih dan meningkatkan kemampuan panglima.</div>
          )}

          {/* Tab 3: Inventory & Shops */}
          {sidebarTab === 'inventory' && player && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="modal-tabs" style={{ gap: '4px', marginBottom: '12px', paddingBottom: '5px', display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <button className={`tab-btn ${inventorySubTab === 'inv' ? 'active' : ''}`} onClick={() => setInventorySubTab('inv')} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>🎒 Tas</button>
                <button className={`tab-btn ${inventorySubTab === 'shop' ? 'active' : ''}`} onClick={() => setInventorySubTab('shop')} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>🎁 Toko</button>
                <button className={`tab-btn ${inventorySubTab === 'craft' ? 'active' : ''}`} onClick={() => setInventorySubTab('craft')} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>⚒️ Tempa</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {inventorySubTab === 'inv' && (
                  <InventoryTab 
                    player={player}
                    equippedAtk={equippedAtk}
                    equippedDef={equippedDef}
                    equippedAgi={equippedAgi}
                    equippedCrit={equippedCrit}
                    equippedSummary={equippedSummary}
                    handleEquipItem={handleEquipItem}
                    handleUnequipItem={handleUnequipItem}
                    handleSellItem={handleSellItem}
                  />
                )}

                {inventorySubTab === 'shop' && (
                  <ShopTab 
                    player={player}
                    chestRates={chestRates}
                    ratesSum={ratesSum}
                    handleOpenChest={handleOpenChest}
                    handleBuyShopItem={handleBuyShopItem}
                    handleRateChange={handleRateChange}
                    submitChestRates={submitChestRates}
                  />
                )}

                {inventorySubTab === 'craft' && (
                  <CraftingTab 
                    player={player}
                    recipes={recipes}
                    handleCraftItem={handleCraftItem}
                  />
                )}
              </div>
            </div>
          )}
          {sidebarTab === 'inventory' && !player && (
            <div className="empty-state">Silakan login untuk menggunakan tas inventaris dan toko.</div>
          )}

          {/* Tab 4: Trading Market */}
          {sidebarTab === 'market' && player && (
            <MarketTab 
              marketBuyType={marketBuyType}
              setMarketBuyType={setMarketBuyType}
              marketBuyRarity={marketBuyRarity}
              setMarketBuyRarity={setMarketBuyRarity}
              marketBuyName={marketBuyName}
              setMarketBuyName={setMarketBuyName}
              marketBuyPrice={marketBuyPrice}
              setMarketBuyPrice={setMarketBuyPrice}
              marketTemplates={marketTemplates}
              orderBook={orderBook}
              myOrders={myOrders}
              handlePlaceBuyOrder={handlePlaceBuyOrder}
              handleCancelOrder={handleCancelOrder}
            />
          )}
          {sidebarTab === 'market' && !player && (
            <div className="empty-state">Silakan login untuk ikut bertransaksi di bursa peralatan.</div>
          )}

          {/* Tab 5: Active Battles Listing */}
          {sidebarTab === 'battles' && (
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#a5b4fc', textTransform: 'uppercase' }}>
                Pertempuran Aktif ({activeBattles.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                {activeBattles.length > 0 ? (
                  activeBattles.map(t => {
                    const battle = t.battles[0];
                    const attackerName = battle.attacker_kingdom?.name || 'Kerajaan Lain';
                    const defenderName = t.kingdom?.name || 'Wilayah Netral';
                    const hpVal = t.troops_count || 0;
                    const progressPct = Math.max(0, Math.min(100, ((100 - hpVal) / 100) * 100));

                    return (
                      <div 
                        key={t.code} 
                        className="territory-card" 
                        style={{ margin: 0, padding: '12px', background: 'rgba(244, 63, 94, 0.03)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>⚔️ {t.name}</strong>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                              <span style={{ color: battle.attacker_kingdom?.color_hex }}>{attackerName}</span> vs <span style={{ color: t.kingdom?.color_hex || '#cbd5e1' }}>{defenderName}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => focusTerritory(t.code)} 
                            className="rpg-btn" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          >
                            Pantau / Gabung
                          </button>
                        </div>

                        {/* Micro HP Progress bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '3px', color: '#f43f5e', fontWeight: 'bold' }}>
                          <span>Pemberontakan / Penaklukan</span>
                          <span>{Math.round(progressPct)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ 
                            width: `${progressPct}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #f43f5e, #be123c)'
                          }}></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 10px', fontSize: '0.85rem' }}>
                    🕊️ Nusantara aman. Tidak ada pertempuran aktif saat ini.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Territory Detail Dossier */}
          {sidebarTab === 'detail' && (
            <div>
              {!selectedTerritory ? (
                <div className="empty-state">
                  Pilih wilayah di peta atau klik salah satu pertempuran aktif di menu ⚔️ Tempur.
                </div>
              ) : (
                <div className="territory-card" style={{ margin: 0 }}>
                  <div className="t-title">{selectedTerritory.name}</div>
                  <div className="t-owner">{selectedTerritory.parent}{selectedTerritory.province}</div>
                  <div className="t-stats" style={{ padding: '10px', marginBottom: '12px' }}>
                    <div>👑 Kepemilikan: <strong style={{ color: selectedTerritory.currentTData?.kingdom?.color_hex || '#fff' }}>{currentOwner}</strong></div>
                    <div>❤️ HP: <strong>{troopsCount}</strong> / 100</div>
                  </div>

                  {/* Battle progress indicator */}
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

                  {/* Combat Controls */}
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

                  {/* Resource harvesting panel */}
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

                  {/* Battle Logs feed */}
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
          )}
        </div>
      </div>
    </div>
  );
}
