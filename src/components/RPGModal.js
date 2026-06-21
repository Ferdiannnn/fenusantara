'use client';

import SkillsTab from './rpg/SkillsTab';
import InventoryTab from './rpg/InventoryTab';
import ShopTab from './rpg/ShopTab';
import MarketTab from './rpg/MarketTab';
import CraftingTab from './rpg/CraftingTab';

export default function RPGModal({
  open,
  onClose,
  activeTab,
  setActiveTab,
  player,
  handleUpgradeSkill,
  equippedAtk,
  equippedDef,
  equippedAgi,
  equippedCrit,
  equippedSummary,
  handleEquipItem,
  handleUnequipItem,
  handleSellItem,
  chestRates,
  ratesSum,
  handleOpenChest,
  handleBuyShopItem,
  handleRateChange,
  submitChestRates,
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
  recipes,
  handleCraftItem
}) {
  if (!open || !player) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>Karakter & Toko Peralatan</h3>
          <span className="modal-close" onClick={onClose}>&times;</span>
        </div>

        <div className="modal-tabs">
          <button className={`tab-btn ${activeTab === 'tab-skills' ? 'active' : ''}`} onClick={() => setActiveTab('tab-skills')}>Skill & Status</button>
          <button className={`tab-btn ${activeTab === 'tab-inventory' ? 'active' : ''}`} onClick={() => setActiveTab('tab-inventory')}>Peralatan</button>
          <button className={`tab-btn ${activeTab === 'tab-shop' ? 'active' : ''}`} onClick={() => setActiveTab('tab-shop')}>Toko & Chest</button>
          <button className={`tab-btn ${activeTab === 'tab-market' ? 'active' : ''}`} onClick={() => setActiveTab('tab-market')}>Pasar</button>
          <button className={`tab-btn ${activeTab === 'tab-craft' ? 'active' : ''}`} onClick={() => setActiveTab('tab-craft')}>Manufaktur</button>
        </div>

        {/* Tab content rendering */}
        {activeTab === 'tab-skills' && (
          <SkillsTab 
            player={player} 
            handleUpgradeSkill={handleUpgradeSkill} 
          />
        )}

        {activeTab === 'tab-inventory' && (
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

        {activeTab === 'tab-shop' && (
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

        {activeTab === 'tab-market' && (
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

        {activeTab === 'tab-craft' && (
          <CraftingTab 
            player={player}
            recipes={recipes}
            handleCraftItem={handleCraftItem}
          />
        )}
      </div>
    </div>
  );
}
