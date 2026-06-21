'use client';

export default function MarketTab({
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
  handleCancelOrder
}) {
  return (
    <div className="tab-pane active-pane">
      <div style={{ background: 'rgba(10, 10, 15, 0.5)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#a5b4fc', fontSize: '0.85rem', textTransform: 'uppercase' }}>Pasang Order Beli Baru</h4>
        <form onSubmit={handlePlaceBuyOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Tipe Slot</label>
            <select value={marketBuyType} onChange={(e) => setMarketBuyType(e.target.value)} required style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'white', width: '100%' }}>
              <option value="WEAPON">⚔️ WEAPON</option>
              <option value="HELMET">🪖 HELMET</option>
              <option value="ARMOR">🛡️ ARMOR</option>
              <option value="ARMS">🧤 ARMS</option>
              <option value="LEG">👖 LEG</option>
              <option value="BOOTS">🥾 BOOTS</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Kelangkaan</label>
            <select value={marketBuyRarity} onChange={(e) => setMarketBuyRarity(e.target.value)} required style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'white', width: '100%' }}>
              <option value="COMMON">COMMON</option>
              <option value="RARE">RARE</option>
              <option value="EPIC">EPIC</option>
              <option value="LEGENDARY">LEGENDARY</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Nama Peralatan</label>
            <select value={marketBuyName} onChange={(e) => setMarketBuyName(e.target.value)} required style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'white', width: '100%' }}>
              {((marketTemplates[marketBuyType] && marketTemplates[marketBuyType][marketBuyRarity]) || []).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Harga Beli (Gold)</label>
            <input 
              type="number" 
              min="1" 
              required 
              placeholder="Contoh: 50" 
              value={marketBuyPrice}
              onChange={(e) => setMarketBuyPrice(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'white', width: '100%', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
          <div>
            <button type="submit" className="btn-upgrade" style={{ width: '100%', padding: '8px 10px' }}>Beli Saham/Item</button>
          </div>
        </form>
      </div>

      {/* Active orders */}
      <div style={{ background: 'rgba(10, 10, 15, 0.5)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#a5b4fc', fontSize: '0.85rem', textTransform: 'uppercase' }}>Buku Order Aktif (Order Book)</h4>
        <div style={{ maxHeight: '140px', overflowY: 'auto', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', fontWeight: 'bold' }}>
                <th style={{ padding: '6px 8px' }}>Item</th>
                <th style={{ padding: '6px 8px' }}>Kelangkaan</th>
                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Tipe</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Antrean</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Harga</th>
              </tr>
            </thead>
            <tbody>
              {orderBook.length > 0 ? (
                orderBook.map((o, idx) => {
                  const isBuy = o.order_type === 'BUY';
                  let rarityColor = '#fff';
                  if (o.rarity === 'RARE') rarityColor = '#3b82f6';
                  else if (o.rarity === 'EPIC') rarityColor = '#a855f7';
                  else if (o.rarity === 'LEGENDARY') rarityColor = '#f59e0b';

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 600, color: '#e2e8f0' }}>{o.name}</td>
                      <td style={{ padding: '6px 8px', color: rarityColor, fontWeight: 700 }}>{o.rarity}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <span style={{
                          color: isBuy ? '#10b981' : '#ef4444', 
                          fontWeight: 'bold', 
                          background: isBuy ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '0.7rem'
                        }}>{o.order_type}</span>
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94a3b8' }}>{o.count}x</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold', color: isBuy ? '#10b981' : '#f59e0b' }}>{o.price} G</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: '10px' }}>Tidak ada antrean order saat ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* My active orders */}
      <div style={{ background: 'rgba(10, 10, 15, 0.5)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#a5b4fc', fontSize: '0.85rem', textTransform: 'uppercase' }}>Antrean Aktif Saya</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
          {myOrders.length > 0 ? (
            myOrders.map(o => {
              const isBuy = o.order_type === 'BUY';
              let rarityColor = '#fff';
              if (o.rarity === 'RARE') rarityColor = '#3b82f6';
              else if (o.rarity === 'EPIC') rarityColor = '#a855f7';
              else if (o.rarity === 'LEGENDARY') rarityColor = '#f59e0b';

              return (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                      <span style={{
                        color: isBuy ? '#10b981' : '#ef4444',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        background: isBuy ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        padding: '2px 5px',
                        borderRadius: '3px'
                      }}>{o.order_type}</span>
                      <span style={{ color: rarityColor, marginLeft: '4px' }}>{o.item_name}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Harga: <span style={{ fontWeight: 'bold', color: isBuy ? '#10b981' : '#f59e0b' }}>{o.price} G</span></div>
                  </div>
                  <button className="btn-sell" style={{ backgroundColor: '#ef4444', padding: '4px 10px', fontSize: '0.7rem', borderRadius: '4px' }} onClick={() => handleCancelOrder(o.id)}>Batal</button>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '10px' }}>Tidak ada antrean aktif.</div>
          )}
        </div>
      </div>
    </div>
  );
}
