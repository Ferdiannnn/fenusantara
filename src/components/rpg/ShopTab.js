'use client';

export default function ShopTab({
  player,
  chestRates,
  ratesSum,
  handleOpenChest,
  handleBuyShopItem,
  handleRateChange,
  submitChestRates
}) {
  return (
    <div className="tab-pane active-pane">
      <div className="loot-chest-container">
        <h4 style={{ margin: '0 0 5px 0', color: '#facc15' }}>Loot Chest Acak (Sangat Menarik!)</h4>
        <p style={{ fontSize: '0.75rem', color: '#ddd', margin: '0 0 10px 0' }}>Dapatkan perlengkapan acak Common s/d Legendary!</p>
        <button className="btn-chest" onClick={handleOpenChest}>Buka Chest (50 Gold)</button>
      </div>

      {/* Chest Probability Rates Editor (Player ID 1 Only) */}
      {player.id === 1 && (
        <div className="chest-rates-editor-panel" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', borderRadius: '12px', marginBottom: '15px' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>⚙️ Atur Probabilitas Chest</h5>
          <form onSubmit={submitChestRates} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].map(r => (
              <div key={r}>
                <label style={{ fontSize: '0.65rem', color: r === 'COMMON' ? '#94a3b8' : (r === 'RARE' ? '#3b82f6' : (r === 'EPIC' ? '#a855f7' : '#f59e0b')), fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>{r} (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  required 
                  value={chestRates[r]}
                  onChange={(e) => handleRateChange(r, e.target.value)}
                  style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'white', width: '100%', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            ))}
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: ratesSum === 100 ? '#10b981' : '#ef4444' }}>Total: {ratesSum}%</span>
              <button type="submit" className="btn-buy" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '6px' }}>Simpan Probabilitas</button>
            </div>
          </form>
        </div>
      )}

      <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '15px 0' }} />
      <h4 style={{ margin: '0 0 10px 0' }}>Beli Peralatan Dasar</h4>
      <div className="shop-grid">
        {[
          { key: 'wood_sword', name: 'Pedang Kayu (COMMON)', stats: 'ATK +2', cost: 30, color: '#ef4444' },
          { key: 'wood_shield', name: 'Perisai Kayu (COMMON)', stats: 'DEF +1', cost: 30, color: '#3b82f6' },
          { key: 'leather_boots', name: 'Sepatu Kulit (COMMON)', stats: 'AGI +2%', cost: 30, color: '#10b981' },
          { key: 'leather_helmet', name: 'Helm Kulit (COMMON)', stats: 'DEF +1', cost: 30, color: '#3b82f6' },
          { key: 'cloth_gloves', name: 'Sarung Tangan Kain (COMMON)', stats: 'CRIT +2%', cost: 30, color: '#a855f7' },
          { key: 'leather_leggings', name: 'Celana Kulit (COMMON)', stats: 'DEF +1', cost: 30, color: '#3b82f6' }
        ].map(item => (
          <div className="shop-item" key={item.key}>
            <div>
              <strong>{item.name}</strong>
              <div style={{ color: item.color, fontSize: '0.8rem' }}>{item.stats}</div>
            </div>
            <button className="btn-buy" onClick={() => handleBuyShopItem(item.key)}>Beli ({item.cost} G)</button>
          </div>
        ))}
      </div>
    </div>
  );
}
