'use client';

export default function ChestLootModal({ open, lootItem, onClose }) {
  if (!open || !lootItem) return null;

  let emoji = '🎁';
  if (lootItem.type === 'WEAPON') emoji = '⚔️';
  else if (lootItem.type === 'HELMET') emoji = '🪖';
  else if (lootItem.type === 'ARMOR') emoji = '🛡️';
  else if (lootItem.type === 'ARMS') emoji = '🧤';
  else if (lootItem.type === 'LEG') emoji = '👖';
  else if (lootItem.type === 'BOOTS') emoji = '🥾';

  let color = '#fff';
  if (lootItem.rarity === 'RARE') color = '#3b82f6';
  else if (lootItem.rarity === 'EPIC') color = '#a855f7';
  else if (lootItem.rarity === 'LEGENDARY') color = '#f59e0b';

  return (
    <div className="modal-overlay">
      <div className="loot-unveil-card">
        <div 
          className="chest-animation-glow" 
          style={{ fontSize: '4rem', animation: 'floatIcon 2.5s infinite alternate', marginBottom: '20px' }}
        >
          {emoji}
        </div>
        
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
          Anda Mendapatkan!
        </h3>
        
        <h2 style={{ 
          fontSize: '1.8rem', 
          margin: '12px 0 6px 0', 
          fontWeight: 800,
          color: color
        }}>
          {lootItem.name}
        </h2>
        
        <div style={{ 
          fontSize: '0.85rem', 
          fontWeight: 800, 
          letterSpacing: '1px', 
          marginBottom: '16px', 
          textTransform: 'uppercase',
          color: color
        }}>
          {lootItem.rarity}
        </div>
        
        <div style={{ 
          fontSize: '1.05rem', 
          fontWeight: 700, 
          background: 'rgba(255,255,255,0.05)', 
          padding: '10px 20px', 
          borderRadius: '10px', 
          display: 'inline-block', 
          marginBottom: '25px', 
          border: '1px solid rgba(255,255,255,0.05)' 
        }}>
          {lootItem.atk_bonus ? `⚔️ ATK +${lootItem.atk_bonus} ` : ''}
          {lootItem.def_bonus ? `🛡️ DEF +${lootItem.def_bonus} ` : ''}
          {lootItem.agi_bonus ? `⚡ AGI +${lootItem.agi_bonus}% ` : ''}
          {lootItem.crit_rate_bonus ? `💥 CRIT +${lootItem.crit_rate_bonus}% ` : ''}
          {!lootItem.atk_bonus && !lootItem.def_bonus && !lootItem.agi_bonus && !lootItem.crit_rate_bonus && 'Normal'}
        </div>
        
        <div>
          <button 
            className="btn-upgrade" 
            onClick={onClose} 
            style={{ padding: '12px 32px', fontSize: '0.95rem', width: 'auto', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '8px' }}
          >
            Klaim Peralatan
          </button>
        </div>
      </div>
    </div>
  );
}
