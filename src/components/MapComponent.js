'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';

import Sidebar from './Sidebar';
import ChestLootModal from './overlays/ChestLootModal';
import ChestOpeningOverlay from './overlays/ChestOpeningOverlay';
import BattleRoundPanel from './BattleRoundPanel';

const indonesiaBounds = [
  [-11.0, 95.0], // Barat Daya
  [6.0, 141.0]   // Timur Laut
];

export default function MapComponent() {
  // Game States
  const [player, setPlayer] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('profile');
  const [tick, setTick] = useState(0);
  const [battleLogs, setBattleLogs] = useState([]);
  const [battleStatus, setBattleStatus] = useState(null);
  const battleStatusPollRef = useRef(null);
  
  // Chest Loot Modal State
  const [chestLootOpen, setChestLootOpen] = useState(false);
  const [lootItem, setLootItem] = useState(null);
  
  // Kingdom Members State
  const [kingdomMembers, setKingdomMembers] = useState([]);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);
  
  // Chest Opening Animation State
  const [chestOpeningOpen, setChestOpeningOpen] = useState(false);
  const [chestOpeningEmoji, setChestOpeningEmoji] = useState('🎁');
  const [chestOpeningText, setChestOpeningText] = useState('');
  
  // Market States
  const [marketTemplates, setMarketTemplates] = useState({});
  const [marketBuyType, setMarketBuyType] = useState('WEAPON');
  const [marketBuyRarity, setMarketBuyRarity] = useState('COMMON');
  const [marketBuyName, setMarketBuyName] = useState('');
  const [marketBuyPrice, setMarketBuyPrice] = useState('');
  const [orderBook, setOrderBook] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  
  // Chest Rates State
  const [chestRates, setChestRates] = useState({ COMMON: 60, RARE: 25, EPIC: 12, LEGENDARY: 3 });
  const [ratesSum, setRatesSum] = useState(100);

  // Refs for Leaflet objects and databases
  const mapRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const attackMarkersRef = useRef([]);
  const territoriesDbRef = useRef({});
  const adjacencyDbRef = useRef({});

  // Helper for human-readable countdowns
  const formatRemainingTime = useCallback((expiresAtStr) => {
    if (!expiresAtStr) return '';
    const diff = new Date(expiresAtStr) - new Date();
    if (diff <= 0) return 'Kedaluwarsa';
    
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;
    const diffMins = Math.floor((diff / (1000 * 60)) % 60);
    
    if (diffDays > 0) {
      return `${diffDays} hari ${remHours} jam`;
    } else if (remHours > 0) {
      return `${remHours} jam ${diffMins} menit`;
    } else {
      return `${diffMins} menit`;
    }
  }, []);

  // Update selected territory data when database or tick updates
  useEffect(() => {
    if (selectedTerritory) {
      const code = selectedTerritory.code;
      const dbData = territoriesDbRef.current[code];
      if (dbData) {
        setSelectedTerritory(prev => ({
          ...prev,
          currentTData: dbData
        }));
      }
    }
  }, [tick]);

  // Handle local second tick to update remaining times
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync player profile stats from Backend API
  const refreshPlayerStats = useCallback(() => {
    const saved = localStorage.getItem('player');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (!parsed || !parsed.id) return;

    fetch(`/api/game/player/${parsed.id}?t=${Date.now()}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setPlayer(res.data);
          localStorage.setItem('player', JSON.stringify(res.data));
        }
      })
      .catch(err => console.error("Error refreshing stats", err));
  }, []);

  // Polygon Styles based on Kingdom Ownership
  const getStyle = useCallback((feature) => {
    const code = feature.properties.GID_3 || feature.properties.GID_2 || feature.properties.GID_1;
    const tData = territoriesDbRef.current[code];
    
    if (tData && tData.kingdom) {
      return {
        color: tData.kingdom.color_hex,
        weight: 1.5,
        opacity: 1,
        fillColor: tData.kingdom.color_hex,
        fillOpacity: 0.6
      };
    }
    return {
      color: "#3b82f6",
      weight: 0.8,
      opacity: 0.8,
      fillColor: "#1e3a8a",
      fillOpacity: 0.3
    };
  }, []);

  const highlightStyle = {
    weight: 3,
    opacity: 1,
    fillOpacity: 0.8
  };

  // Render ongoing battle sword markers on map centers
  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    
    attackMarkersRef.current.forEach(m => map.removeLayer(m));
    attackMarkersRef.current = [];

    if (!geojsonLayerRef.current) return;

    geojsonLayerRef.current.eachLayer(function(layer) {
      const code = layer.feature.properties.GID_3 || layer.feature.properties.GID_2 || layer.feature.properties.GID_1;
      const tData = territoriesDbRef.current[code];
      
      if (tData && tData.battles && tData.battles.length > 0) {
        const battle = tData.battles[0];
        const attackerName = battle.attacker_kingdom ? battle.attacker_kingdom.name : "Kerajaan Lain";
        const defenderName = tData.kingdom ? tData.kingdom.name : "Wilayah Netral";
        
        const center = layer.getBounds().getCenter();
        
        const attackIcon = L.divIcon({
          className: 'custom-attack-icon',
          html: '<div style="font-size: 24px; text-shadow: 0 0 10px red; animation: pulse 1s infinite;">⚔️</div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker(center, { icon: attackIcon }).addTo(map);
        marker.bindTooltip(`<b>${defenderName}</b> sedang diserang oleh <b>${attackerName}</b>`, { direction: 'top', className: 'attack-tooltip' });
        
        attackMarkersRef.current.push(marker);
      }
    });
  }, []);

  // Fetch all territories owner data and updates stylesheet styles
  const fetchTerritories = useCallback((onClickCode = null) => {
    fetch('/api/game/territories?t=' + Date.now())
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          const dbObj = {};
          res.data.forEach(t => {
            dbObj[t.code] = t;
          });
          territoriesDbRef.current = dbObj;
          
          if (geojsonLayerRef.current) {
            geojsonLayerRef.current.eachLayer(function(layer) {
              layer.setStyle(getStyle(layer.feature));
            });
            renderMarkers();
          }

          // If updating specific territory details after attacks/refreshes
          if (onClickCode) {
            setSelectedTerritory(prev => {
              if (prev && prev.code === onClickCode) {
                return {
                  ...prev,
                  currentTData: dbObj[onClickCode]
                };
              }
              return prev;
            });
          }
        }
      })
      .catch(err => console.error("Error fetching territories", err));
  }, [getStyle, renderMarkers]);

  // Leaflet Polygon click handler mapped to React selectedTerritory State
  const handleFeatureClick = useCallback((feature, layer) => {
    const name = feature.properties.NAME_3 || feature.properties.NAME_2 || feature.properties.NAME_1 || "Tidak diketahui";
    const parent = feature.properties.NAME_2 ? `${feature.properties.NAME_2}, ` : "";
    const province = feature.properties.NAME_1 || "";
    const code = feature.properties.GID_3 || feature.properties.GID_2 || feature.properties.GID_1;

    setBattleLogs([]); // Clear logs on selection change
    
    // Fit map bounds around clicked region
    mapRef.current.fitBounds(layer.getBounds());

    setSelectedTerritory({
      name,
      parent,
      province,
      code,
      currentTData: territoriesDbRef.current[code]
    });
    setSidebarTab('detail'); // Auto open selected territory dossier
  }, []);

  // Center/focus on a selected territory from battles menu click
  const focusTerritory = useCallback((code) => {
    if (!geojsonLayerRef.current) return;
    geojsonLayerRef.current.eachLayer((layer) => {
      const layerCode = layer.feature.properties.GID_3 || layer.feature.properties.GID_2 || layer.feature.properties.GID_1;
      if (layerCode === code) {
        handleFeatureClick(layer.feature, layer);
      }
    });
  }, [handleFeatureClick]);

  // Set up mouse events on GeoJSON feature loading
  const onEachFeature = useCallback((feature, layer) => {
    layer.bindTooltip("Loading...", { sticky: true });

    layer.on('mouseover', function(e) {
      const layer = e.target;
      layer.setStyle({
        ...getStyle(feature),
        ...highlightStyle
      });
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }

      const tData = territoriesDbRef.current[layer.feature.properties.GID_3 || layer.feature.properties.GID_2 || layer.feature.properties.GID_1];
      const owner = tData && tData.kingdom ? tData.kingdom.name : "Netral";
      const tooltipContent = `
        <div style="padding: 5px;">
          <strong style="font-size: 14px; display: block; margin-bottom: 2px;">${layer.feature.properties.NAME_3 || layer.feature.properties.NAME_2 || layer.feature.properties.NAME_1 || "Tidak diketahui"}</strong>
          <span style="font-size: 11px; color: #cbd5e1;">${layer.feature.properties.NAME_2 ? `${layer.feature.properties.NAME_2}, ` : ""}${layer.feature.properties.NAME_1 || ""}</span><br/>
          <span style="font-size: 12px; color: #facc15; font-weight: bold; margin-top: 5px; display: inline-block;">Kerajaan: ${owner}</span>
        </div>
      `;
      layer.setTooltipContent(tooltipContent);
    });

    layer.on('mouseout', function(e) {
      e.target.setStyle(getStyle(feature));
    });

    layer.on('click', function(e) {
      handleFeatureClick(feature, e.target);
    });
  }, [getStyle, handleFeatureClick]);

  // Load geojson & adjacency configurations
  const loadMapData = useCallback(() => {
    fetch('/maps/adjacency.json?t=' + Date.now())
      .then(r => r.json())
      .then(data => { adjacencyDbRef.current = data; })
      .catch(e => console.error("Adjacency loading error", e));

    fetch('/maps/gadm41_IDN_1.json')
      .then(response => response.json())
      .then(data => {
        const map = mapRef.current;
        if (!map) return;

        // Hide main loading overlay
        const loader = document.getElementById('loader');
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => { loader.style.display = 'none'; }, 500);
        }

        geojsonLayerRef.current = L.geoJSON(data, {
          style: getStyle,
          onEachFeature: onEachFeature
        }).addTo(map);

        renderMarkers();
      })
      .catch(error => {
        console.error("Error loading map coordinates", error);
      });
  }, [getStyle, onEachFeature, renderMarkers]);

  // Component Mount Setup
  useEffect(() => {
    // Read player session from localStorage
    const saved = localStorage.getItem('player');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.kingdom) {
          setPlayer(parsed);
        } else {
          localStorage.removeItem('player');
        }
      } catch (e) {
        localStorage.removeItem('player');
      }
    }

    // Initialize map container
    const map = L.map('map', {
      zoomControl: false,
      preferCanvas: true,
      maxBounds: indonesiaBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 4
    }).setView([-2.5489, 118.0149], 5);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    // Load data
    loadMapData();
    fetchTerritories();
    setTimeout(() => refreshPlayerStats(), 800);

    // Invalidate map size after animation renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    return () => {
      clearTimeout(timer);
      map.remove();
    };
  }, [loadMapData, fetchTerritories, refreshPlayerStats]);

  // Tab-specific initializations inside sidebar
  useEffect(() => {
    if (sidebarTab === 'market') {
      loadMarketData();
      updateMarketItemNames();
    } else if (sidebarTab === 'shop' || sidebarTab === 'inventory') {
      loadChestRates();
    } else if (sidebarTab === 'kingdom') {
      fetchKingdomMembers();
    }
  }, [sidebarTab]);

  // Load active orders and templates
  const loadMarketTemplates = async () => {
    if (Object.keys(marketTemplates).length > 0) return marketTemplates;
    try {
      const res = await fetch('/api/game/market/item_templates');
      const data = await res.json();
      if (data.status === 'success') {
        setMarketTemplates(data.data);
        return data.data;
      }
    } catch (e) {
      console.error("Templates fetching error", e);
    }
    return null;
  };

  const updateMarketItemNames = async () => {
    const templates = await loadMarketTemplates();
    if (!templates) return;
    const names = (templates[marketBuyType] && templates[marketBuyRarity]) || [];
    if (names.length > 0) {
      setMarketBuyName(names[0]);
    } else {
      setMarketBuyName('');
    }
  };

  useEffect(() => {
    updateMarketItemNames();
  }, [marketBuyType, marketBuyRarity, marketTemplates]);

  const loadMarketData = () => {
    if (!player || !player.id) return;
    Promise.all([
      fetch('/api/game/market/orders?t=' + Date.now()).then(res => res.json()),
      fetch('/api/game/market/my_orders/' + player.id + '?t=' + Date.now()).then(res => res.json())
    ])
      .then(([ordersRes, myOrdersRes]) => {
        if (ordersRes.status === 'success') {
          const buyOrders = ordersRes.data.buy || [];
          const sellOrders = ordersRes.data.sell || [];
          const all = [];
          sellOrders.forEach(o => all.push({ ...o, order_type: 'SELL' }));
          buyOrders.forEach(o => all.push({ ...o, order_type: 'BUY' }));
          
          all.sort((a, b) => {
            if (a.name !== b.name) return a.name.localeCompare(b.name);
            if (a.rarity !== b.rarity) return a.rarity.localeCompare(b.rarity);
            if (a.order_type !== b.order_type) return a.order_type === 'SELL' ? -1 : 1;
            return b.price - a.price;
          });
          setOrderBook(all);
        }
        if (myOrdersRes.status === 'success') {
          setMyOrders(myOrdersRes.data || []);
        }
      })
      .catch(e => console.error("Error loading market data", e));
  };

  // Chest Probability Editor helpers
  const loadChestRates = () => {
    if (!player || player.id !== 1) return;
    fetch('/api/game/chest_rates')
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setChestRates(res.data);
          setRatesSum(res.data.COMMON + res.data.RARE + res.data.EPIC + res.data.LEGENDARY);
        }
      })
      .catch(e => console.error("Error loading chest rates", e));
  };

  // Kingdom Handlers
  const fetchKingdomMembers = async () => {
    if (!player || !player.id || !player.kingdom_id) return;
    setIsFetchingMembers(true);
    try {
      const res = await fetch(`/api/game/kingdoms/${player.kingdom_id}/members?playerId=${player.id}&t=` + Date.now());
      const data = await res.json();
      if (data.status === 'success') {
        setKingdomMembers(data.data);
      } else {
        setKingdomMembers([]);
      }
    } catch (e) {
      console.error(e);
      setKingdomMembers([]);
    } finally {
      setIsFetchingMembers(false);
    }
  };

  const handleUpdateRole = async (targetPlayerId, newRole) => {
    if (!player || player.role !== 'KING') return;
    try {
      const res = await fetch('/api/game/kingdoms/members/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: player.id,
          targetPlayerId,
          newRole
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
        fetchKingdomMembers();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRateChange = (rarity, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    const newRates = { ...chestRates, [rarity]: num };
    setChestRates(newRates);
    setRatesSum(newRates.COMMON + newRates.RARE + newRates.EPIC + newRates.LEGENDARY);
  };

  const submitChestRates = (e) => {
    e.preventDefault();
    if (ratesSum !== 100) {
      alert(`Total persentase rate harus tepat 100%! Saat ini: ${ratesSum}%`);
      return;
    }

    fetch('/api/game/chest_rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chestRates)
    })
      .then(res => res.json())
      .then(res => {
        alert(res.message);
        if (res.status === 'success') {
          loadChestRates();
        }
      })
      .catch(e => console.error("Error updating chest rates", e));
  };

  // Declare War Handler
  const handleDeclareWar = async () => {
    if (!player || !player.id) return;
    const code = selectedTerritory.code;
    
    try {
      const res = await fetch('/api/game/declare_war', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          territory_code: code,
          attacker_kingdom_id: player.kingdom_id,
          player_id: player.id
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchTerritories(code);
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
      alert('Error launching war');
    }
  };

  // Poll battle status for active territory (every 10s)
  const startBattleStatusPoll = useCallback((territoryCode) => {
    if (battleStatusPollRef.current) clearInterval(battleStatusPollRef.current);
    const poll = () => {
      fetch(`/api/game/battle_status/${territoryCode}`)
        .then(r => r.json())
        .then(r => { if (r.status === 'success') setBattleStatus(r.data); })
        .catch(() => {});
    };
    poll();
    battleStatusPollRef.current = setInterval(poll, 10000);
  }, []);

  const stopBattleStatusPoll = useCallback(() => {
    if (battleStatusPollRef.current) { clearInterval(battleStatusPollRef.current); battleStatusPollRef.current = null; }
    setBattleStatus(null);
  }, []);

  // Battle Help Attack / Defend handler
  const handleBattleAction = async (action) => {
    if (!player || !player.id) return;

    const code = selectedTerritory.code;
    const ongoingBattle = selectedTerritory.currentTData.battles[0];
    const endpoint = action === 'help_attack' ? '/api/game/help_attack' : '/api/game/defend_territory';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          territory_code: code,
          attacker_kingdom_id: ongoingBattle.attacker_kingdom_id,
          defender_kingdom_id: ongoingBattle.defender_kingdom_id,
          player_id: player.id
        })
      });
      const data = await res.json();

      if (data.status === 'success') {
        if (data.player) {
          setPlayer(data.player);
          localStorage.setItem('player', JSON.stringify(data.player));
        }

        // Update battle status from response — langsung refresh damage tanpa tunggu polling
        if (data.roundNumber) {
          setBattleStatus(prev => ({
            ...prev,
            active: true,
            attacker_rounds_won: data.attacker_rounds_won ?? prev?.attacker_rounds_won ?? 0,
            defender_rounds_won: data.defender_rounds_won ?? prev?.defender_rounds_won ?? 0,
            activeRound: prev?.activeRound ? {
              ...prev.activeRound,
              attacker_points: data.attacker_points,
              defender_points: data.defender_points,
              round_number: data.roundNumber,
              // Selalu pakai nilai aktual dari backend (bisa 0 setelah tick, tapi panel akan fallback ke lastTick)
              attacker_dmg_since_tick: data.attacker_dmg_since_tick ?? prev.activeRound.attacker_dmg_since_tick ?? 0,
              defender_dmg_since_tick: data.defender_dmg_since_tick ?? prev.activeRound.defender_dmg_since_tick ?? 0,
              // Tambahkan tick baru ke feed jika tick terjadi
              ticks: data.tick_triggered && prev.activeRound.ticks
                ? [{
                    id: Date.now(),
                    tick_number: (prev.activeRound.ticks[0]?.tick_number ?? 0) + 1,
                    attacker_dmg: data.attacker_dmg_since_tick ?? 0,
                    defender_dmg: data.defender_dmg_since_tick ?? 0,
                    attacker_pts: data.tick_attacker_pts ?? 0,
                    defender_pts: data.tick_defender_pts ?? 0,
                  }, ...prev.activeRound.ticks].slice(0, 5)
                : prev.activeRound.ticks
            } : null
          }));
        }

        // Add log entry
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        let logText = `[${timeStr}] `;
        if (action === 'help_attack') {
          if (data.isCrit) logText += `💥 CRIT! `;
          logText += `Serang: ${data.damage} dmg`;
        } else {
          logText += `Bertahan: ${data.heal} def`;
        }

        // Show current round points
        logText += ` | ⚔️${data.attacker_points ?? 0}pt 🛡️${data.defender_points ?? 0}pt`;

        if (data.agiTriggered) {
          logText += ` (⚡AGI)`;
        } else if (data.durabilityLostItem) {
          logText += ` (⚠️${data.durabilityLostItem} -5Dur)`;
        }

        logText += ` | 💰${data.goldChange >= 0 ? '+' : ''}${data.goldChange}G`;
        logText += ` | ⭐+${data.expGained}XP`;

        if (data.leveledUp) logText += ` | 🎉LEVEL UP Lv.${data.newLevel}`;

        // Tick event log
        if (data.tick_triggered) {
          const winner = data.tick_winner === 'attacker' ? '⚔️ SERANG' : data.tick_winner === 'defender' ? '🛡️ TAHAN' : '🤝 SERI';
          logText += ` | 🔔TICK: ${winner} (+${data.tick_attacker_pts}⚔️ / +${data.tick_defender_pts}🛡️)`;
        }
        if (data.round_winner) {
          logText += ` | 🏁RONDE ${data.roundNumber} → ${data.round_winner === 'ATTACKER' ? '⚔️ MENANG' : '🛡️ MENANG'}`;
        }

        setBattleLogs(prev => [...prev, logText]);

        // If battle ended, refresh territory data and stop polling
        if (data.battle_result?.status === 'ATTACKER_WON' || data.battle_result?.status === 'DEFENDER_WON') {
          stopBattleStatusPoll();
          setTimeout(() => fetchTerritories(code), 800);
        }
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan koneksi pertempuran');
    }
  };

  // Harvest resource handler
  const handleHarvest = async (territoryId) => {
    if (!player || !player.id) return;

    try {
      const res = await fetch('/api/game/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          territory_id: territoryId
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
        setPlayer(data.data.player);
        localStorage.setItem('player', JSON.stringify(data.data.player));
        fetchTerritories(selectedTerritory.code);
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan koneksi pemanenan');
    }
  };

  // Upgrade Skill levels
  const handleUpgradeSkill = async (skillName) => {
    if (!player) return;
    try {
      const res = await fetch('/api/game/upgrade_skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          skill_name: skillName
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        refreshPlayerStats();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Equip Equipment
  const handleEquipItem = async (eqId) => {
    if (!player) return;
    try {
      const res = await fetch('/api/game/equip_equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          equipment_id: eqId
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        refreshPlayerStats();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Unequip Equipment
  const handleUnequipItem = async (eqId) => {
    if (!player) return;
    try {
      const res = await fetch('/api/game/unequip_equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          equipment_id: eqId
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        refreshPlayerStats();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sell Equipment to Market
  const handleSellItem = async (eqId, basePrice) => {
    if (!player) return;
    const priceInput = prompt("Masukkan harga jual (dalam Gold):", basePrice);
    if (priceInput === null) return;
    const price = parseInt(priceInput);
    if (isNaN(price) || price <= 0) {
      alert("Harga jual harus berupa angka yang lebih besar dari 0 Gold.");
      return;
    }

    try {
      const res = await fetch('/api/game/market/place_sell_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          equipment_id: eqId,
          price: price
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
        refreshPlayerStats();
        loadMarketData();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Purchase basic gear from shop
  const handleBuyShopItem = async (itemKey) => {
    if (!player) return;
    try {
      const res = await fetch('/api/game/buy_equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          item_key: itemKey
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
        refreshPlayerStats();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Random Chest
  const handleOpenChest = async () => {
    if (!player) return;
    if (player.gold < 50) {
      alert("Koin emas Anda tidak mencukupi untuk membuka chest!");
      return;
    }

    // Set opening overlays
    setChestOpeningEmoji('🎁');
    setChestOpeningText('MEMBUKA PETI... 🛡️');
    setChestOpeningOpen(true);

    try {
      const res = await fetch('/api/game/open_chest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: player.id })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTimeout(() => {
          setChestOpeningEmoji('💥');
          setChestOpeningText('KLAIM DAPAT! 🎉');
          setTimeout(() => {
            setChestOpeningOpen(false);
            setLootItem(data.data.equipment);
            setChestLootOpen(true);
            refreshPlayerStats();
          }, 450);
        }, 1200);
      } else {
        setChestOpeningOpen(false);
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
      setChestOpeningOpen(false);
    }
  };

  // Place Buy Order on market
  const handlePlaceBuyOrder = async (e) => {
    e.preventDefault();
    if (!player) return;
    if (!marketBuyName) {
      alert("Pilih nama item terlebih dahulu");
      return;
    }
    const price = parseInt(marketBuyPrice);
    if (isNaN(price) || price <= 0) {
      alert("Harga harus lebih besar dari 0");
      return;
    }

    try {
      const res = await fetch('/api/game/market/place_buy_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          item_name: marketBuyName,
          rarity: marketBuyRarity,
          item_type: marketBuyType,
          price: price
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
        setMarketBuyPrice('');
        loadMarketData();
        refreshPlayerStats();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cancel order in stock book
  const handleCancelOrder = async (orderId) => {
    if (!player) return;
    if (!confirm("Apakah Anda yakin ingin membatalkan antrean order ini?")) return;

    try {
      const res = await fetch('/api/game/market/cancel_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          order_id: orderId
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
        loadMarketData();
        refreshPlayerStats();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Craft Epic/Legendary gear
  const handleCraftItem = async (recipeKey) => {
    if (!player) return;

    setChestOpeningEmoji('⚒️');
    setChestOpeningText('MENEMPA PERALATAN... 🔨');
    setChestOpeningOpen(true);

    try {
      const res = await fetch('/api/game/craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          recipe_key: recipeKey
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTimeout(() => {
          setChestOpeningEmoji('⚒️💥');
          setChestOpeningText('TEMPAAN SELESAI! 🎉');
          setTimeout(() => {
            setChestOpeningOpen(false);
            setLootItem(data.data.equipment);
            setChestLootOpen(true);
            refreshPlayerStats();
            loadMarketData(); // refresh order book
          }, 450);
        }, 1200);
      } else {
        setChestOpeningOpen(false);
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
      setChestOpeningOpen(false);
    }
  };

  // Calculate Equipped Stats totals
  let equippedAtk = 0;
  let equippedDef = 0;
  let equippedAgi = 0;
  let equippedCrit = 0;
  const equippedSummary = {};

  if (player && player.equipments) {
    player.equipments.forEach(eq => {
      const isBroken = eq.durability <= 0;
      if (eq.equipped) {
        equippedSummary[eq.type] = eq;
        if (!isBroken) {
          equippedAtk += eq.atk_bonus || 0;
          equippedDef += eq.def_bonus || 0;
          equippedAgi += eq.agi_bonus || 0;
          equippedCrit += eq.crit_rate_bonus || 0;
        }
      }
    });
  }

  // Recipes configurations
  const recipes = [
    {
      key: 'knight_sword',
      name: 'Pedang Ksatria',
      type: 'WEAPON',
      rarity: 'RARE',
      stats: '⚔️ ATK +6',
      cost: { gold: 150, wood: 5, iron: 15, spices: 0 }
    },
    {
      key: 'iron_plate',
      name: 'Zirah Besi Rakyat',
      type: 'ARMOR',
      rarity: 'RARE',
      stats: '🛡️ DEF +4',
      cost: { gold: 200, wood: 0, iron: 20, spices: 0 }
    },
    {
      key: 'wanderer_boots',
      name: 'Sepatu Bot Pengembara',
      type: 'BOOTS',
      rarity: 'EPIC',
      stats: '⚡ AGI +8%',
      cost: { gold: 400, wood: 10, iron: 0, spices: 15 }
    },
    {
      key: 'hayam_crown',
      name: 'Mahkota Hayam Wuruk',
      type: 'HELMET',
      rarity: 'LEGENDARY',
      stats: '🛡️ DEF +9',
      cost: { gold: 1000, wood: 0, iron: 40, spices: 30 }
    }
  ];

  return (
    <div className="layout">
      {/* Map Division */}
      <div id="map" style={{ width: '100%', height: '100vh' }}></div>

      {/* Modular Sidebar Component with integrated menus */}
      <Sidebar 
        player={player}
        selectedTerritory={selectedTerritory}
        formatRemainingTime={formatRemainingTime}
        handleDeclareWar={handleDeclareWar}
        handleBattleAction={handleBattleAction}
        handleHarvest={handleHarvest}
        battleLogs={battleLogs}
        battleStatus={battleStatus}
        startBattleStatusPoll={startBattleStatusPoll}
        stopBattleStatusPoll={stopBattleStatusPoll}
        
        // Navigation States
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        
        // Active battles listing helpers
        territories={Object.values(territoriesDbRef.current)}
        focusTerritory={focusTerritory}

        // RPG Tab stats and handlers
        equippedAtk={equippedAtk}
        equippedDef={equippedDef}
        equippedAgi={equippedAgi}
        equippedCrit={equippedCrit}
        equippedSummary={equippedSummary}
        handleUpgradeSkill={handleUpgradeSkill}
        handleEquipItem={handleEquipItem}
        handleUnequipItem={handleUnequipItem}
        handleSellItem={handleSellItem}
        
        // Shop Tab handlers
        chestRates={chestRates}
        ratesSum={ratesSum}
        handleOpenChest={handleOpenChest}
        handleBuyShopItem={handleBuyShopItem}
        handleRateChange={handleRateChange}
        submitChestRates={submitChestRates}

        // Market Tab states & handlers
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

        // Crafting Tab recipes & handlers
        recipes={recipes}
        handleCraftItem={handleCraftItem}
      />

      {/* Modular Claim Loot Modal */}
      <ChestLootModal 
        open={chestLootOpen}
        lootItem={lootItem}
        onClose={() => setChestLootOpen(false)}
      />

      {/* Modular Shaking & Burst Chest Animation Overlay */}
      <ChestOpeningOverlay 
        open={chestOpeningOpen}
        emoji={chestOpeningEmoji}
        text={chestOpeningText}
      />
    </div>
  );
}
