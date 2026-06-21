'use client';

export default function InventoryTab({
  player,
  equippedAtk,
  equippedDef,
  equippedAgi,
  equippedCrit,
  equippedSummary,
  handleEquipItem,
  handleUnequipItem,
  handleSellItem
}) {
  return (
    <div className="tab-pane active-pane">
      <div className="equip-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', marginBottom: '15px', textAlign: 'center', fontSize: '0.8rem' }}>
        <div>⚔️ ATK: +{equippedAtk}</div>
        <div>🛡️ DEF: +{equippedDef}</div>
        <div>⚡ AGI: +{equippedAgi}%</div>
        <div>💥 CRIT: +{equippedCrit}%</div>
      </div>

      {/* Slot Grid visualization */}
      <div className="equipped-slots-grid">
        {[
          { key: 'HELMET', label: '🪖 HELMET' },
          { key: 'ARMOR', label: '🛡️ ARMOR' },
          { key: 'LEG', label: '👖 LEG' },
          { key: 'WEAPON', label: '⚔️ WEAPON' },
          { key: 'ARMS', label: '🧤 ARMS' },
          { key: 'BOOTS', label: '🥾 BOOTS' }
        ].map(s => {
          const eq = equippedSummary[s.key];
          return (
            <div className={`equip-slot ${eq ? 'filled' : ''}`} id={`slot-card-${s.key}`} key={s.key}>
              <div className="slot-title">{s.label}</div>
              <div className="slot-val" style={{ color: eq ? (eq.durability <= 0 ? '#ef4444' : '#10b981') : '#64748b' }}>
                {eq ? eq.name : 'Kosong'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Items scroll */}
      <div className="inventory-grid">
        {player.equipments && player.equipments.length > 0 ? (
          player.equipments.map(eq => {
            const isBroken = eq.durability <= 0;
            let bonus = '';
            if (eq.atk_bonus) bonus += `⚔️ ATK +${eq.atk_bonus} `;
            if (eq.def_bonus) bonus += `🛡️ DEF +${eq.def_bonus} `;
            if (eq.agi_bonus) bonus += `⚡ AGI +${eq.agi_bonus}% `;
            if (eq.crit_rate_bonus) bonus += `💥 CRIT +${eq.crit_rate_bonus}% `;
            if (!bonus) bonus = 'Normal';

            const isOnMarket = eq.on_market === true;

            return (
              <div className={`inventory-item rarity-${eq.rarity}`} key={eq.id} style={{ 
                borderColor: isBroken ? '#ef4444' : (eq.equipped ? '#10b981' : (isOnMarket ? '#f59e0b' : ''))
              }}>
                <div className="item-details">
                  <div className="item-name">
                    {eq.name} 
                    {isBroken && <span style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: '5px' }}>(HANCUR)</span>}
                    {eq.equipped && <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.7rem', background: 'rgba(16,185,129,0.15)', padding: '2px 5px', borderRadius: '3px', marginLeft: '5px' }}>DIPAKAI</span>}
                    {isOnMarket && <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.7rem', background: 'rgba(245,158,11,0.15)', padding: '2px 5px', borderRadius: '3px', marginLeft: '5px' }}>SEDANG DIJUAL</span>}
                  </div>
                  <div className="item-stats" style={{ color: isBroken ? '#ef4444' : '#10b981', fontSize: '0.75rem' }}>
                    {bonus} | Kelangkaan: {eq.rarity}
                  </div>
                  <div className="item-durability">Durabilitas: {eq.durability}/{eq.max_durability}</div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {eq.equipped ? (
                    <button className="btn-sell" style={{ backgroundColor: '#4f46e5' }} onClick={() => handleUnequipItem(eq.id)}>Lepas</button>
                  ) : isOnMarket ? (
                    <button className="btn-sell" style={{ backgroundColor: '#64748b', opacity: 0.5, cursor: 'not-allowed' }} disabled>Pasang</button>
                  ) : !isBroken ? (
                    <button className="btn-sell" style={{ backgroundColor: '#10b981' }} onClick={() => handleEquipItem(eq.id)}>Pasang</button>
                  ) : null}

                  {isOnMarket ? (
                    <button className="btn-sell" style={{ backgroundColor: '#64748b', opacity: 0.5, cursor: 'not-allowed' }} disabled>Di Pasar</button>
                  ) : (
                    <button className="btn-sell" onClick={() => handleSellItem(eq.id, eq.sell_price)}>Jual ({eq.sell_price} G)</button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '24px', fontWeight: 500 }}>
            Tidak memiliki peralatan. Buka loot chest atau beli di toko!
          </div>
        )}
      </div>
    </div>
  );
}
