'use client';

export default function SkillsTab({ player, handleUpgradeSkill }) {
  const skillsList = [
    { key: 'atk', name: '⚔️ Attack', desc: 'Menambah damage tiap hit (+2 per level)' },
    { key: 'def', name: '🛡️ Defence', desc: 'Kurangi biaya hit (-1 G), naikkan max stamina (+10), & regen stamina (+5% speed/level)' },
    { key: 'eco', name: '💰 Ekonomi', desc: 'Meningkatkan batas Energi Kerja (+10) dan kecepatan regenerasinya (+5% speed per level)' },
    { key: 'agi', name: '⚡ Agility', desc: 'Durability equipment aman dari hit (+5% per level)' },
    { key: 'crit_rate', name: '🎯 Crit Rate', desc: 'Peluang menghasilkan damage kritikal (+4% per level)' },
    { key: 'crit_dmg', name: '💥 Crit Damage', desc: 'Meningkatkan multiplier damage kritikal (+10% per level)' }
  ];

  return (
    <div className="tab-pane active-pane">
      <div style={{
        background: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.75rem', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Poin Kemampuan Tersedia
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', margin: '4px 0' }}>
          {player.skill_points || 0}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Gunakan poin untuk meningkatkan keahlian tempur & ekonomi
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '12px', fontWeight: 'bold' }}>
        <span>Level Panglima: {player.level || 1}</span>
        <span>Emas: <strong style={{ color: '#facc15' }}>{player.gold}</strong> G</span>
      </div>

      {/* Upgrades items */}
      <div className="skills-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {skillsList.map(s => {
          const currentLevel = player[s.key + '_level'] || 0;
          return (
            <div 
              className="skill-item" 
              key={s.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ flex: 1, paddingRight: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f8fafc' }}>
                  {s.name} <span style={{ color: '#10b981' }}>(Lv. {currentLevel})</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: '1.3' }}>{s.desc}</p>
              </div>
              <button 
                className="rpg-btn" 
                onClick={() => handleUpgradeSkill(s.key)}
                disabled={(player.skill_points || 0) < 1}
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '0.75rem',
                  opacity: (player.skill_points || 0) < 1 ? 0.4 : 1, 
                  cursor: (player.skill_points || 0) < 1 ? 'not-allowed' : 'pointer',
                  background: (player.skill_points || 0) < 1 ? '#3f3f46' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: (player.skill_points || 0) < 1 ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}
              >
                Latih
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
