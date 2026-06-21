'use client';

export default function SkillsTab({ player, handleUpgradeSkill }) {
  const nextLevelExp = Math.floor(100 * Math.pow(player.level || 1, 1.5));
  const expPercent = Math.min(100, Math.floor(((player.exp || 0) / nextLevelExp) * 100));

  const maxStamina = 100 + ((player.def_level || 1) - 1) * 10;
  const maxEnergy = 100 + ((player.eco_level || 1) - 1) * 10;

  const staminaPct = Math.min(100, Math.floor((player.stamina / maxStamina) * 100));
  const energyPct = Math.min(100, Math.floor((player.energy / maxEnergy) * 100));

  const skillsList = [
    { key: 'atk', name: 'Attack', desc: 'Menambah damage tiap hit (+2 per level)' },
    { key: 'def', name: 'Defence', desc: 'Kurangi biaya hit (-1 G), naikkan max stamina (+10), & regen stamina (+5% speed/level)' },
    { key: 'eco', name: 'Ekonomi', desc: 'Meningkatkan batas Energi Kerja (+10) dan kecepatan regenerasinya (+5% speed per level)' },
    { key: 'agi', name: 'Agility', desc: 'Durability equipment aman dari hit (+5% per level)' },
    { key: 'crit_rate', name: 'Crit Rate', desc: 'Peluang menghasilkan damage kritikal (+4% per level)' },
    { key: 'crit_dmg', name: 'Crit Damage', desc: 'Meningkatkan multiplier damage kritikal (+10% per level)' }
  ];

  return (
    <div className="tab-pane active-pane">
      <div className="status-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>👑 Emas: <strong style={{ color: '#facc15' }}>{player.gold}</strong> G</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>⭐ Skor: <strong>{player.score}</strong></div>
        <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>⚡ Level: <strong style={{ color: '#60a5fa' }}>{player.level || 1}</strong></div>
        <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>✨ Poin Skill: <strong style={{ color: '#34d399' }}>{player.skill_points || 0}</strong></div>
      </div>

      {/* Bars indicators */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', color: '#10b981' }}>
        <span>⚡ STAMINA</span>
        <span>{player.stamina} / {maxStamina}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '5px', height: '14px', marginBottom: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ background: 'linear-gradient(90deg, #34d399, #10b981)', width: `${staminaPct}%`, height: '100%', transition: 'width 0.3s ease' }}></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', color: '#fbbf24' }}>
        <span>⚡ ENERGI KERJA</span>
        <span>{player.energy} / {maxEnergy}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '5px', height: '14px', marginBottom: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', width: `${energyPct}%`, height: '100%', transition: 'width 0.3s ease' }}></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', color: '#60a5fa' }}>
        <span>⭐ EXP</span>
        <span>{player.exp || 0} / {nextLevelExp} XP</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '5px', height: '14px', marginBottom: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', width: `${expPercent}%`, height: '100%', transition: 'width 0.3s ease' }}></div>
      </div>
      <div style={{ fontSize: '0.7rem', color: '#93c5fd', textAlign: 'right', marginBottom: '12px', fontStyle: 'italic', opacity: 0.8 }}>
        Butuh {nextLevelExp - (player.exp || 0)} XP lagi untuk naik level
      </div>

      {/* Upgrades items */}
      <div className="skills-list">
        {skillsList.map(s => (
          <div className="skill-item" key={s.key}>
            <div>
              <strong>{s.name} (Level {player[s.key + '_level'] || 1})</strong>
              <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '2px 0 0 0' }}>{s.desc}</p>
            </div>
            <button 
              className="btn-upgrade" 
              onClick={() => handleUpgradeSkill(s.key)}
              disabled={(player.skill_points || 0) < 1}
              style={{ opacity: (player.skill_points || 0) < 1 ? 0.4 : 1, cursor: (player.skill_points || 0) < 1 ? 'not-allowed' : 'pointer' }}
            >
              Upgrade (1 Poin)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
