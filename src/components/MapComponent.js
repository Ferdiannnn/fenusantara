'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';

import Sidebar from './Sidebar';
import RPGModal from './RPGModal';
import ChestLootModal from './overlays/ChestLootModal';
import ChestOpeningOverlay from './overlays/ChestOpeningOverlay';

const indonesiaBounds = [
  [-11.0, 95.0], // Barat Daya
  [6.0, 141.0]   // Timur Laut
];

export default function MapComponent() {
  // Game States
  const [player, setPlayer] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [rpgModalOpen, setRpgModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tab-skills');
  const [tick, setTick] = useState(0);
  const [battleLogs, setBattleLogs] = useState([]);
  
  // Chest Loot Modal State
  const [chestLootOpen, setChestLootOpen] = useState(false);
  const [lootItem, setLootItem] = useState(null);
  
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
  }, []);

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

  // Tab-specific initializations
  useEffect(() => {
    if (activeTab === 'tab-market') {
      loadMarketData();
      updateMarketItemNames();
    } else if (activeTab === 'tab-shop') {
      loadChestRates();
    }
  }, [activeTab]);

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

        // Add log entry
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        let logText = `[${timeStr}] `;
        if (action === 'help_attack') {
          if (data.isCrit) logText += `💥 CRIT! `;
          logText += `Serang: -${data.damage} HP`;
        } else {
          logText += `Bertahan: +${data.heal} HP`;
        }

        if (data.agiTriggered) {
          logText += ` (⚡ AGI Aktif)`;
        } else if (data.durabilityLostItem) {
          logText += ` (⚠️ [${data.durabilityLostItem}] -5 Dur)`;
        }

        logText += ` | 💰 ${data.goldChange >= 0 ? '+' : ''}${data.goldChange}G`;
        logText += ` | ⚡ -${data.staminaCost}`;
        logText += ` | ⭐ +${data.expGained}XP`;

        if (data.leveledUp) {
          logText += ` | 🎉 LEVEL UP! Level ${data.newLevel}`;
        }

        setBattleLogs(prev => [...prev, logText]);

        // If finished battle
        if (data.conquered || data.defended) {
          setTimeout(() => fetchTerritories(code), 800);
        } else {
          // Update map locally
          if (territoriesDbRef.current[code]) {
            territoriesDbRef.current[code].troops_count = data.hp;
          }
          setSelectedTerritory(prev => ({
            ...prev,
            currentTData: {
              ...prev.currentTData,
              troops_count: data.hp
            }
          }));
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

      {/* Modular Sidebar Component */}
      <Sidebar 
        player={player}
        selectedTerritory={selectedTerritory}
        formatRemainingTime={formatRemainingTime}
        handleDeclareWar={handleDeclareWar}
        handleBattleAction={handleBattleAction}
        handleHarvest={handleHarvest}
        battleLogs={battleLogs}
      />

      {/* Modular RPG Dashboard Modal */}
      <RPGModal 
        open={rpgModalOpen}
        onClose={() => setRpgModalOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        player={player}
        handleUpgradeSkill={handleUpgradeSkill}
        equippedAtk={equippedAtk}
        equippedDef={equippedDef}
        equippedAgi={equippedAgi}
        equippedCrit={equippedCrit}
        equippedSummary={equippedSummary}
        handleEquipItem={handleEquipItem}
        handleUnequipItem={handleUnequipItem}
        handleSellItem={handleSellItem}
        chestRates={chestRates}
        ratesSum={ratesSum}
        handleOpenChest={handleOpenChest}
        handleBuyShopItem={handleBuyShopItem}
        handleRateChange={handleRateChange}
        submitChestRates={submitChestRates}
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
