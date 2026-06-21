'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Zap, Backpack, TrendingUp, Swords, Map as MapIcon, LogOut, Info, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Import RPG components
import ProfileTab from './rpg/ProfileTab';
import SkillsTab from './rpg/SkillsTab';
import InventoryTab from './rpg/InventoryTab';
import ShopTab from './rpg/ShopTab';
import MarketTab from './rpg/MarketTab';
import CraftingTab from './rpg/CraftingTab';
import KingdomTab from './rpg/KingdomTab';

const SIDEBAR_MENUS = [
  { id: 'profile',   icon: User,       label: 'Profil' },
  { id: 'kingdom',   icon: Users,      label: 'Kerajaan' },
  { id: 'skill',     icon: Zap,        label: 'Skill' },
  { id: 'inventory', icon: Backpack,   label: 'Barang' },
  { id: 'market',    icon: TrendingUp, label: 'Pasar' },
  { id: 'battles',   icon: Swords,     label: 'Tempur' },
  { id: 'detail',    icon: MapIcon,    label: 'Detail' }
];

export default function Sidebar({
  player, selectedTerritory, formatRemainingTime,
  handleDeclareWar, handleBattleAction, handleHarvest, battleLogs,
  sidebarTab, setSidebarTab, territories = [], focusTerritory,
  equippedAtk, equippedDef, equippedAgi, equippedCrit, equippedSummary,
  handleUpgradeSkill, handleEquipItem, handleUnequipItem, handleSellItem,
  chestRates, ratesSum, handleOpenChest, handleBuyShopItem, handleRateChange, submitChestRates,
  marketBuyType, setMarketBuyType, marketBuyRarity, setMarketBuyRarity, marketBuyName, setMarketBuyName,
  marketBuyPrice, setMarketBuyPrice, marketTemplates, orderBook, myOrders, handlePlaceBuyOrder, handleCancelOrder,
  recipes, handleCraftItem, kingdomMembers, handleUpdateRole, isFetchingMembers
}) {
  const router = useRouter();
  const [inventorySubTab, setInventorySubTab] = useState('inv');

  const executeProtectedAction = (actionFn) => {
    if (!player || !player.id) router.push('/login');
    else actionFn();
  };

  const activeBattles = territories.filter(t => t.battles && t.battles.length > 0);

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
      
      if (isOwnedByUs) isHarvestable = true;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('player');
    router.push('/login');
  };

  return (
    <div className="w-[480px] h-screen bg-background/95 backdrop-blur-xl border-l flex flex-col z-[1000] shadow-2xl shrink-0">
      
      {/* Header */}
      <div className="p-4 bg-muted/30 border-b flex justify-between items-center shrink-0">
        {player ? (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-900 flex items-center justify-center text-lg font-black text-white shadow-lg border border-white/10">
              {player.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">
                Lv.{player.level || 1} {player.username}
              </span>
              <span className="text-xs font-semibold" style={{ color: player.kingdom.color_hex }}>
                {player.kingdom.name} · <span className="text-amber-400">{player.gold} G</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground border border-white/5">
              ?
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm text-foreground">Tamu</span>
              <Button asChild size="sm" variant="default" className="h-6 text-[10px] px-3">
                <Link href="/login">Masuk / Login</Link>
              </Button>
            </div>
          </div>
        )}
        {player && (
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Vertical Menu */}
        <div className="w-[85px] bg-muted/20 border-r py-4 flex flex-col items-center gap-2 shrink-0">
          {SIDEBAR_MENUS.map(menu => {
            const Icon = menu.icon;
            const isActive = sidebarTab === menu.id;
            return (
              <button
                key={menu.id}
                onClick={() => setSidebarTab(menu.id)}
                className={`w-[68px] h-[68px] flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(99,102,241,0.15)] border border-primary/20' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/20' : ''}`} />
                <span className="text-[10px] font-bold">{menu.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          
          {/* PROFILE */}
          {sidebarTab === 'profile' && player && (
            <ProfileTab 
              player={player} equippedAtk={equippedAtk} equippedDef={equippedDef}
              equippedAgi={equippedAgi} equippedCrit={equippedCrit} equippedSummary={equippedSummary}
            />
          )}
          {sidebarTab === 'profile' && !player && <EmptyState msg="Silakan login untuk memantau profil panglima Anda." />}

          {/* KINGDOM */}
          {sidebarTab === 'kingdom' && player && (
            <KingdomTab 
              player={player} kingdomMembers={kingdomMembers} handleUpdateRole={handleUpdateRole} isFetchingMembers={isFetchingMembers}
            />
          )}
          {sidebarTab === 'kingdom' && !player && <EmptyState msg="Silakan login untuk melihat daftar warga kerajaan." />}

          {/* SKILLS */}
          {sidebarTab === 'skill' && player && (
            <SkillsTab player={player} handleUpgradeSkill={handleUpgradeSkill} />
          )}
          {sidebarTab === 'skill' && !player && <EmptyState msg="Silakan login untuk melatih kemampuan panglima." />}

          {/* INVENTORY / SHOP / CRAFTING */}
          {sidebarTab === 'inventory' && player && (
            <div className="flex flex-col h-full gap-3">
              <div className="flex bg-muted/30 p-1 rounded-lg border border-white/5 shrink-0">
                {[
                  { id: 'inv', label: '🎒 Tas' },
                  { id: 'shop', label: '🎁 Toko' },
                  { id: 'craft', label: '⚒️ Tempa' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setInventorySubTab(tab.id)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                      inventorySubTab === tab.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1">
                {inventorySubTab === 'inv' && <InventoryTab player={player} equippedAtk={equippedAtk} equippedDef={equippedDef} equippedAgi={equippedAgi} equippedCrit={equippedCrit} equippedSummary={equippedSummary} handleEquipItem={handleEquipItem} handleUnequipItem={handleUnequipItem} handleSellItem={handleSellItem} />}
                {inventorySubTab === 'shop' && <ShopTab player={player} chestRates={chestRates} ratesSum={ratesSum} handleOpenChest={handleOpenChest} handleBuyShopItem={handleBuyShopItem} handleRateChange={handleRateChange} submitChestRates={submitChestRates} />}
                {inventorySubTab === 'craft' && <CraftingTab player={player} recipes={recipes} handleCraftItem={handleCraftItem} />}
              </div>
            </div>
          )}
          {sidebarTab === 'inventory' && !player && <EmptyState msg="Silakan login untuk menggunakan tas inventaris dan toko." />}

          {/* MARKET */}
          {sidebarTab === 'market' && player && (
            <MarketTab 
              marketBuyType={marketBuyType} setMarketBuyType={setMarketBuyType} marketBuyRarity={marketBuyRarity} setMarketBuyRarity={setMarketBuyRarity}
              marketBuyName={marketBuyName} setMarketBuyName={setMarketBuyName} marketBuyPrice={marketBuyPrice} setMarketBuyPrice={setMarketBuyPrice}
              marketTemplates={marketTemplates} orderBook={orderBook} myOrders={myOrders} handlePlaceBuyOrder={handlePlaceBuyOrder} handleCancelOrder={handleCancelOrder}
            />
          )}
          {sidebarTab === 'market' && !player && <EmptyState msg="Silakan login untuk ikut bertransaksi di bursa peralatan." />}

          {/* BATTLES */}
          {sidebarTab === 'battles' && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-black text-primary/80 uppercase tracking-widest px-1">
                Pertempuran Aktif ({activeBattles.length})
              </h4>
              <div className="flex flex-col gap-2">
                {activeBattles.length > 0 ? activeBattles.map(t => {
                  const battle = t.battles[0];
                  const attackerName = battle.attacker_kingdom?.name || 'Kerajaan Lain';
                  const defenderName = t.kingdom?.name || 'Wilayah Netral';
                  const hpVal = t.troops_count || 0;
                  const progressPct = Math.max(0, Math.min(100, ((100 - hpVal) / 100) * 100));

                  return (
                    <Card key={t.code} className="border-red-500/20 bg-red-500/5">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-sm text-foreground flex items-center gap-1.5 mb-1">
                              <Swords className="w-4 h-4 text-red-400" />
                              {t.name}
                            </div>
                            <div className="text-[10px] font-semibold text-muted-foreground">
                              <span style={{ color: battle.attacker_kingdom?.color_hex }}>{attackerName}</span>
                              <span className="mx-1">vs</span>
                              <span style={{ color: t.kingdom?.color_hex || '#94a3b8' }}>{defenderName}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => focusTerritory(t.code)}>
                            Pantau
                          </Button>
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-red-400 mb-1">
                          <span>Progress Penaklukan</span>
                          <span>{Math.round(progressPct)}%</span>
                        </div>
                        <div className="h-1.5 bg-red-950/50 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                }) : (
                  <EmptyState msg="🕊️ Nusantara aman. Tidak ada pertempuran aktif saat ini." />
                )}
              </div>
            </div>
          )}

          {/* DETAIL */}
          {sidebarTab === 'detail' && (
            <div className="flex flex-col gap-3">
              {!selectedTerritory ? (
                <EmptyState msg="Pilih wilayah di peta atau klik salah satu pertempuran aktif di menu Tempur." />
              ) : (
                <>
                  <Card className="border-white/5 bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-4">
                      <div className="text-xl font-black text-foreground mb-0.5">{selectedTerritory.name}</div>
                      <div className="text-xs font-semibold text-muted-foreground mb-4">
                        {selectedTerritory.parent}{selectedTerritory.province}
                      </div>
                      
                      <div className="flex justify-between items-center bg-black/20 rounded-lg p-3 border border-white/5 mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Kepemilikan</span>
                          <span className="text-sm font-black" style={{ color: selectedTerritory.currentTData?.kingdom?.color_hex || '#fff' }}>
                            {currentOwner}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">HP Wilayah</span>
                          <span className="text-sm font-black text-foreground">{troopsCount} <span className="text-muted-foreground">/ 100</span></span>
                        </div>
                      </div>

                      {ongoingBattle && (
                        <div className="mb-5">
                          <div className="flex justify-between text-[10px] font-black text-red-400 mb-1.5">
                            <span>Progress Penaklukan</span>
                            <span>{Math.round(Math.max(0, Math.min(100, ((100 - troopsCount) / 100) * 100)))}%</span>
                          </div>
                          <div className="h-2 bg-red-950/50 rounded-full overflow-hidden border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all" style={{ width: `${Math.max(0, Math.min(100, ((100 - troopsCount) / 100) * 100))}%` }} />
                          </div>
                        </div>
                      )}

                      {ongoingBattle ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="destructive" onClick={() => executeProtectedAction(() => handleBattleAction('help_attack'))}>
                            Bantu Serang
                          </Button>
                          <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => executeProtectedAction(() => handleBattleAction('help_defend'))}>
                            Bantu Tahan
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          disabled={isOwnedByUs}
                          onClick={() => executeProtectedAction(handleDeclareWar)}
                        >
                          {isOwnedByUs ? "Aman / Dikuasai" : (player?.role === 'KING' ? "⚔️ Deklarasi Perang" : (player ? "Menunggu Raja" : "Masuk untuk Berperang"))}
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Harvesting */}
                  {hasActiveResource ? (
                    isHarvestable ? (
                      <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardContent className="p-3">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Sumber Daya Ditemukan</div>
                          <div className="text-lg font-black text-amber-400 mb-1">{resourceLabel}</div>
                          <div className="text-xs text-muted-foreground mb-3">
                            ⏳ Tersedia selama: <span className="text-foreground font-bold">{formatRemainingTime(selectedTerritory.currentTData.resource_expires_at)}</span>
                          </div>
                          <Button variant="warning" className="w-full h-8 text-xs font-black" onClick={() => executeProtectedAction(() => handleHarvest(selectedTerritory.currentTData.id))}>
                            ⛏️ Panen (⚡ 10)
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-white/5 border-dashed">
                        <CardContent className="p-3">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Sumber Daya Alam</div>
                          <div className="text-sm font-bold text-muted-foreground mb-1">{resourceLabel}</div>
                          <div className="text-[10px] text-muted-foreground">
                            ⏳ Tersedia: {formatRemainingTime(selectedTerritory.currentTData.resource_expires_at)}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  ) : (
                    <div className="text-center text-muted-foreground text-xs p-4 bg-muted/20 rounded-lg border border-white/5 border-dashed">
                      📭 Tidak ada sumber daya alam
                    </div>
                  )}

                  {/* Battle Logs */}
                  {battleLogs.length > 0 && (
                    <Card className="border-white/5 bg-black/40">
                      <CardContent className="p-3">
                        <div className="text-[10px] font-black text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                          <Info className="w-3 h-3" /> Log Pertempuran
                        </div>
                        <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1 text-xs text-muted-foreground">
                          {battleLogs.map((log, index) => (
                            <div key={index} className="border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                              {log}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-3">
      <Info className="w-8 h-8 opacity-20" />
      <p className="text-sm font-medium leading-relaxed">{msg}</p>
    </div>
  );
}
