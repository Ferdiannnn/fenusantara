'use client';
import { useState, useEffect } from 'react';

/**
 * Calculate seconds until next +1 regen tick.
 * Formula mirrors backend: intervalSeconds = 2100 * 0.95^(level-1)
 */
function calcRegenCountdown(lastRegenISO, level) {
  const intervalSeconds = Math.floor(2100 * Math.pow(0.95, (level || 1) - 1));
  const lastRegen = new Date(lastRegenISO || Date.now());
  const secondsElapsed = Math.floor((Date.now() - lastRegen.getTime()) / 1000);
  const remainderSeconds = secondsElapsed % intervalSeconds;
  const secondsLeft = intervalSeconds - remainderSeconds;
  return { secondsLeft, intervalSeconds };
}

function formatCountdown(seconds) {
  if (seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ProfileTab({
  player,
  equippedAtk,
  equippedDef,
  equippedAgi,
  equippedCrit,
  equippedSummary
}) {
  const nextLevelExp = Math.floor(100 * Math.pow(player.level || 1, 1.5));
  const expPercent = Math.min(100, Math.floor(((player.exp || 0) / nextLevelExp) * 100));

  const maxStamina = 100 + ((player.def_level || 1) - 1) * 10;
  const maxEnergy = 100 + ((player.eco_level || 1) - 1) * 10;

  const staminaPct = Math.min(100, Math.floor((player.stamina / maxStamina) * 100));
  const energyPct = Math.min(100, Math.floor((player.energy / maxEnergy) * 100));

  const staminaFull = player.stamina >= maxStamina;
  const energyFull = player.energy >= maxEnergy;

  // Live regen countdown state
  const [staminaCountdown, setStaminaCountdown] = useState(0);
  const [energyCountdown, setEnergyCountdown] = useState(0);
  const [staminaInterval, setStaminaInterval] = useState(1);
  const [energyInterval, setEnergyInterval] = useState(1);

  useEffect(() => {
    const tick = () => {
      const sc = calcRegenCountdown(player.last_stamina_regen, player.def_level);
      const ec = calcRegenCountdown(player.last_energy_regen, player.eco_level);
      setStaminaCountdown(sc.secondsLeft);
      setEnergyCountdown(ec.secondsLeft);
      setStaminaInterval(sc.intervalSeconds);
      setEnergyInterval(ec.intervalSeconds);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [player.last_stamina_regen, player.last_energy_regen, player.def_level, player.eco_level]);

  // Progress of current regen tick (0–100%)
  const staminaTickPct = staminaFull ? 100 : Math.round(((staminaInterval - staminaCountdown) / staminaInterval) * 100);
  const energyTickPct  = energyFull  ? 100 : Math.round(((energyInterval  - energyCountdown)  / energyInterval)  * 100);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'LEGENDARY': return '#f59e0b';
      case 'EPIC': return '#a855f7';
      case 'RARE': return '#3b82f6';
      default: return '#10b981';
    }
  };

  const slots = [
    { type: 'WEAPON', label: '⚔️ Senjata', icon: '⚔️' },
    { type: 'ARMOR', label: '🛡️ Baju Zirah', icon: '🛡️' },
    { type: 'HELMET', label: '🪖 Pelindung Kepala', icon: '🪖' },
    { type: 'BOOTS', label: '🥾 Sepatu Bot', icon: '🥾' }
  ];

  return (
    <div className="tab-pane active-pane">

      {/* Player Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${player.kingdom?.color_hex || '#4f46e5'} 0%, #1e1b4b 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 'bold', color: '#fff',
            boxShadow: `0 0 15px rgba(255, 255, 255, 0.05)`
          }}>
            {player.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
              {player.username}
            </div>
            <div style={{ fontSize: '0.8rem', color: player.kingdom?.color_hex || '#cbd5e1', fontWeight: 'bold' }}>
              {player.role === 'KING' ? '👑 Raja' : '⚔️ Prajurit'} - Kerajaan {player.kingdom?.name || 'Netral'}
            </div>
          </div>
        </div>
      </div>

      {/* Vital Bars */}
      <div style={{ marginBottom: '15px' }}>

        {/* ── STAMINA ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', color: '#10b981' }}>
          <span>⚡ STAMINA</span>
          <span>{player.stamina} / {maxStamina}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '5px', height: '10px', marginBottom: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ background: 'linear-gradient(90deg, #34d399, #10b981)', width: `${staminaPct}%`, height: '100%', transition: 'width 0.3s ease' }} />
        </div>
        {/* Regen tick row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ flex: 1, background: 'rgba(52,211,153,0.1)', borderRadius: '3px', height: '3px', overflow: 'hidden' }}>
            <div style={{
              background: staminaFull ? '#34d399' : '#6ee7b7',
              width: `${staminaTickPct}%`,
              height: '100%',
              transition: 'width 1s linear'
            }} />
          </div>
          <span style={{
            fontSize: '0.65rem',
            color: staminaFull ? '#34d399' : '#6ee7b7',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {staminaFull ? '✓ PENUH' : `+1 dalam ${formatCountdown(staminaCountdown)}`}
          </span>
        </div>

        {/* ── ENERGI KERJA ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', color: '#fbbf24' }}>
          <span>🔋 ENERGI KERJA</span>
          <span>{player.energy} / {maxEnergy}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '5px', height: '10px', marginBottom: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', width: `${energyPct}%`, height: '100%', transition: 'width 0.3s ease' }} />
        </div>
        {/* Regen tick row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ flex: 1, background: 'rgba(251,191,36,0.1)', borderRadius: '3px', height: '3px', overflow: 'hidden' }}>
            <div style={{
              background: energyFull ? '#fbbf24' : '#fde68a',
              width: `${energyTickPct}%`,
              height: '100%',
              transition: 'width 1s linear'
            }} />
          </div>
          <span style={{
            fontSize: '0.65rem',
            color: energyFull ? '#fbbf24' : '#fde68a',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {energyFull ? '✓ PENUH' : `+1 dalam ${formatCountdown(energyCountdown)}`}
          </span>
        </div>

        {/* ── EXP Bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', color: '#60a5fa' }}>
          <span>⭐ LEVEL {player.level || 1} EXP</span>
          <span>{player.exp || 0} / {nextLevelExp} XP</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '5px', height: '10px', marginBottom: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', width: `${expPercent}%`, height: '100%', transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ fontSize: '0.65rem', color: '#93c5fd', textAlign: 'right', fontStyle: 'italic', opacity: 0.7 }}>
          Butuh {nextLevelExp - (player.exp || 0)} XP lagi untuk naik level
        </div>
      </div>

      {/* Equipment Combat Stats */}
      <h4 style={{ margin: '15px 0 8px 0', fontSize: '0.8rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Statistik Tempur
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '15px' }}>
        <div style={{ background: 'rgba(10, 10, 15, 0.5)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Serangan (ATK)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>⚔️ +{equippedAtk}</div>
        </div>
        <div style={{ background: 'rgba(10, 10, 15, 0.5)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Pertahanan (DEF)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>🛡️ +{equippedDef}</div>
        </div>
        <div style={{ background: 'rgba(10, 10, 15, 0.5)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Kecepatan (AGI)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>⚡ +{equippedAgi}%</div>
        </div>
        <div style={{ background: 'rgba(10, 10, 15, 0.5)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Kritikal (CRIT)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>🎯 +{equippedCrit}%</div>
        </div>
      </div>

      {/* Equipment Slots */}
      <h4 style={{ margin: '15px 0 8px 0', fontSize: '0.8rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Peralatan Terpasang
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {slots.map(slot => {
          const item = equippedSummary[slot.type];
          return (
            <div
              key={slot.type}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>{slot.icon}</span>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{slot.label}</div>
                  {item ? (
                    <div style={{ fontWeight: 'bold', color: getRarityColor(item.rarity) }}>
                      {item.name}
                    </div>
                  ) : (
                    <div style={{ color: '#4b5563', fontStyle: 'italic' }}>Kosong</div>
                  )}
                </div>
              </div>
              {item && (
                <div style={{ textAlign: 'right', fontSize: '0.7rem' }}>
                  <div style={{ color: '#cbd5e1' }}>
                    {item.atk_bonus ? `⚔️ ATK +${item.atk_bonus} ` : ''}
                    {item.def_bonus ? `🛡️ DEF +${item.def_bonus} ` : ''}
                    {item.agi_bonus ? `⚡ AGI +${item.agi_bonus}% ` : ''}
                    {item.crit_rate_bonus ? `🎯 CRIT +${item.crit_rate_bonus}% ` : ''}
                  </div>
                  <div style={{ color: item.durability <= 0 ? '#ef4444' : '#94a3b8', marginTop: '2px' }}>
                    Daya Tahan: {item.durability} / 100
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
