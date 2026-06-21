'use client';

export default function CraftingTab({ player, recipes, handleCraftItem }) {
  return (
    <div className="tab-pane active-pane">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '1.25rem', marginBottom: '3px' }}>🪵</div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kayu</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{player.wood || 0}</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '3px' }}>⚙️</div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Besi</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{player.iron || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', marginBottom: '3px' }}>🌶️</div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rempah</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{player.spices || 0}</div>
        </div>
      </div>

      <h4 style={{ margin: '0 0 10px 0', color: '#a5b4fc', fontSize: '0.85rem', textTransform: 'uppercase' }}>Daftar Resep Tempaan</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
        {recipes.map(r => {
          const hasWood = (player.wood || 0) >= r.cost.wood;
          const hasIron = (player.iron || 0) >= r.cost.iron;
          const hasSpices = (player.spices || 0) >= r.cost.spices;
          const hasGold = (player.gold || 0) >= r.cost.gold;
          const canCraft = hasWood && hasIron && hasSpices && hasGold;

          let rarityColor = '#fff';
          if (r.rarity === 'RARE') rarityColor = '#3b82f6';
          else if (r.rarity === 'EPIC') rarityColor = '#a855f7';
          else if (r.rarity === 'LEGENDARY') rarityColor = '#f59e0b';

          let emoji = '⚔️';
          if (r.type === 'HELMET') emoji = '🪖';
          else if (r.type === 'ARMOR') emoji = '🛡️';
          else if (r.type === 'BOOTS') emoji = '🥾';

          return (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }} key={r.key}>
              <div style={{ fontSize: '2.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>{emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: rarityColor }}>{r.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 'bold', margin: '2px 0 6px 0' }}>{r.stats} | <span style={{ fontSize: '0.7rem', color: rarityColor, opacity: 0.85 }}>{r.rarity}</span></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {r.cost.wood > 0 && (
                    <span style={{ color: hasWood ? '#10b981' : '#ef4444' }}>{hasWood ? '✔️' : '❌'} 🪵 {r.cost.wood} Kayu</span>
                  )}
                  {r.cost.iron > 0 && (
                    <span style={{ color: hasIron ? '#10b981' : '#ef4444' }}>{hasIron ? '✔️' : '❌'} ⚙️ {r.cost.iron} Besi</span>
                  )}
                  {r.cost.spices > 0 && (
                    <span style={{ color: hasSpices ? '#10b981' : '#ef4444' }}>{hasSpices ? '✔️' : '❌'} 🌶️ {r.cost.spices} Rempah</span>
                  )}
                  <span style={{ color: hasGold ? '#facc15' : '#ef4444' }}>{hasGold ? '🪙' : '❌'} 💰 {r.cost.gold} Gold</span>
                </div>
              </div>
              <div>
                <button 
                  className="btn-upgrade" 
                  onClick={() => handleCraftItem(r.key)}
                  disabled={!canCraft}
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', margin: 0, opacity: canCraft ? 1 : 0.4, cursor: canCraft ? 'pointer' : 'not-allowed' }}
                >
                  ⚒️ Buat
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
