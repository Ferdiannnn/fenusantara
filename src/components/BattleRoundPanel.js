'use client';

import { useEffect, useState, useRef } from 'react';

const POINTS_TO_WIN = 500;

function RoundDot({ won, side }) {
  const colors = side === 'attacker'
    ? { active: '#f87171', inactive: '#1f1515', won: '#ef4444' }
    : { active: '#60a5fa', inactive: '#0f1520', won: '#3b82f6' };
  return (
    <div
      style={{
        width: 16, height: 16, borderRadius: '50%',
        background: won ? colors.won : colors.inactive,
        border: `2px solid ${won ? colors.active : '#333'}`,
        boxShadow: won ? `0 0 8px ${colors.active}` : 'none',
        transition: 'all 0.4s ease'
      }}
    />
  );
}

function PointBar({ points, side }) {
  const pct = Math.min(100, (points / POINTS_TO_WIN) * 100);
  const isAttacker = side === 'attacker';
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        display: 'flex', justifyContent: isAttacker ? 'flex-start' : 'flex-end',
        fontSize: 11, fontWeight: 800,
        color: isAttacker ? '#f87171' : '#60a5fa',
        letterSpacing: 1
      }}>
        {points} <span style={{ color: '#555', fontWeight: 400, marginLeft: 2 }}>/ {POINTS_TO_WIN}</span>
      </div>
      <div style={{
        height: 10, borderRadius: 6, overflow: 'hidden',
        background: isAttacker ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
        border: `1px solid ${isAttacker ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
        transform: isAttacker ? 'none' : 'scaleX(-1)'
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: isAttacker
            ? 'linear-gradient(90deg, #b91c1c, #ef4444)'
            : 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
          transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: isAttacker ? '0 0 8px rgba(239,68,68,0.5)' : '0 0 8px rgba(59,130,246,0.5)'
        }} />
      </div>
    </div>
  );
}

function TickFeed({ ticks, attackerName, defenderName }) {
  if (!ticks || ticks.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {[...ticks].reverse().map((tick, i) => {
        const atkWon = tick.attacker_pts > tick.defender_pts;
        const draw = tick.attacker_pts === tick.defender_pts;
        return (
          <div key={tick.id || i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '4px 8px', borderRadius: 6,
            background: atkWon ? 'rgba(239,68,68,0.07)' : draw ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.07)',
            border: `1px solid ${atkWon ? 'rgba(239,68,68,0.15)' : draw ? 'rgba(255,255,255,0.07)' : 'rgba(59,130,246,0.15)'}`,
            fontSize: 10, color: '#888',
            animation: i === 0 ? 'fadeInDown 0.4s ease' : 'none'
          }}>
            <span>⚔️ {tick.attacker_dmg} dmg → <span style={{ color: '#f87171', fontWeight: 700 }}>+{tick.attacker_pts}pt</span></span>
            <span style={{ color: draw ? '#888' : atkWon ? '#f87171' : '#60a5fa', fontWeight: 800 }}>
              {draw ? '🤝 SERI' : atkWon ? '⚔️ SERANG' : '🛡️ TAHAN'}
            </span>
            <span>🛡️ {tick.defender_dmg} dmg → <span style={{ color: '#60a5fa', fontWeight: 700 }}>+{tick.defender_pts}pt</span></span>
          </div>
        );
      })}
    </div>
  );
}

export default function BattleRoundPanel({
  battleStatus,
  attackerName,
  defenderName,
  attackerColor,
  defenderColor,
  territoryCode,
  onTickProcessed
}) {
  const [countdown, setCountdown] = useState(null);
  const [isProcessingTick, setIsProcessingTick] = useState(false);
  const intervalRef = useRef(null);
  const tickFiredRef = useRef(false);

  // Simpan nilai terbaru di ref agar interval tidak perlu restart saat prop berubah
  const territoryCodeRef = useRef(territoryCode);
  const onTickProcessedRef = useRef(onTickProcessed);
  useEffect(() => { territoryCodeRef.current = territoryCode; }, [territoryCode]);
  useEffect(() => { onTickProcessedRef.current = onTickProcessed; }, [onTickProcessed]);

  // Sync countdown dari server setiap polling
  useEffect(() => {
    if (battleStatus?.secondsUntilNextTick != null) {
      setCountdown(battleStatus.secondsUntilNextTick);
      // Reset guard saat server kirim countdown baru yang masih jauh (tick baru dimulai)
      if (battleStatus.secondsUntilNextTick > 5) {
        tickFiredRef.current = false;
      }
    }
  }, [battleStatus?.secondsUntilNextTick]);

  // Interval dibuat SEKALI saja — gunakan ref untuk akses nilai terbaru
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Trigger process_tick sekali per siklus
          if (!tickFiredRef.current && territoryCodeRef.current) {
            tickFiredRef.current = true;
            setIsProcessingTick(true);
            fetch(`/api/game/process_tick/${territoryCodeRef.current}`, { method: 'POST' })
              .then(r => r.json())
              .then(r => {
                setIsProcessingTick(false);
                if (r.status === 'success' && r.data?.tick_processed && onTickProcessedRef.current) {
                  onTickProcessedRef.current(r.data);
                }
              })
              .catch(() => setIsProcessingTick(false));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []); // ← [] = hanya dibuat sekali, tidak pernah restart

  if (!battleStatus || !battleStatus.active) return null;

  const { activeRound, attacker_rounds_won, defender_rounds_won, rounds } = battleStatus;

  const atkPts = activeRound?.attacker_points ?? 0;
  const defPts = activeRound?.defender_points ?? 0;
  const roundNum = activeRound?.round_number ?? 1;
  const recentTicks = activeRound?.ticks ?? [];

  // Damage sejak tick terakhir — jika sudah direset (0), tampilkan data tick sebelumnya
  const rawAtkDmg = activeRound?.attacker_dmg_since_tick ?? 0;
  const rawDefDmg = activeRound?.defender_dmg_since_tick ?? 0;
  const lastTick = recentTicks[0]; // tick paling baru yang sudah selesai
  const isLiveDmg = (rawAtkDmg + rawDefDmg) > 0;
  const atkDmg = isLiveDmg ? rawAtkDmg : (lastTick?.attacker_dmg ?? 0);
  const defDmg = isLiveDmg ? rawDefDmg : (lastTick?.defender_dmg ?? 0);
  const totalDmg = atkDmg + defDmg;

  const formatCountdown = (s) => {
    if (s == null) return '--:--';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20,10,10,0.95) 0%, rgba(10,15,25,0.95) 100%)',
      border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: 14,
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: '0 0 30px rgba(239,68,68,0.08), 0 4px 20px rgba(0,0,0,0.4)'
    }}>

      {/* Header: Round indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          fontSize: 10, fontWeight: 900, letterSpacing: 2,
          color: '#f87171', textTransform: 'uppercase'
        }}>
          ⚔️ RONDE {roundNum} / 3
        </div>
        {/* Round wins dots (best of 3) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[0, 1].map(i => <RoundDot key={i} won={attacker_rounds_won > i} side="attacker" />)}
          <div style={{ fontSize: 9, color: '#555', margin: '0 4px', fontWeight: 700 }}>vs</div>
          {[0, 1].map(i => <RoundDot key={i} won={defender_rounds_won > i} side="defender" />)}
        </div>
      </div>

      {/* Kingdom names */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: attackerColor || '#f87171', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          ⚔️ {attackerName}
        </span>
        <div style={{
          padding: '2px 10px', borderRadius: 20,
          background: 'rgba(255,50,50,0.08)',
          border: '1px solid rgba(255,50,50,0.15)',
          fontSize: 9, fontWeight: 900, color: '#ff4444', letterSpacing: 1
        }}>
          PERANG
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: defenderColor || '#60a5fa', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
          {defenderName} 🛡️
        </span>
      </div>

      {/* Point bars */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <PointBar points={atkPts} side="attacker" />
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#555', fontWeight: 700, marginBottom: 2 }}>TARGET</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#888' }}>{POINTS_TO_WIN}</div>
        </div>
        <PointBar points={defPts} side="defender" />
      </div>

      {/* Live damage accumulation since last tick */}
      <div style={{
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '5px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          fontSize: 9, fontWeight: 900, letterSpacing: 1,
          textTransform: 'uppercase'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {/* Indikator live vs last tick */}
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isLiveDmg ? '#22c55e' : '#555',
              boxShadow: isLiveDmg ? '0 0 6px #22c55e' : 'none',
              animation: isLiveDmg ? 'pulse 1.5s infinite' : 'none'
            }} />
            <span style={{ color: isLiveDmg ? '#4ade80' : '#555' }}>
              {isLiveDmg ? '⚔️ DMG Tick Berjalan' : '📋 DMG Tick Terakhir'}
            </span>
          </div>
          <span style={{ color: '#333', fontWeight: 700 }}>
            {isLiveDmg ? 'Akumulasi sejak tick' : 'Menunggu serangan...'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', height: 38 }}>
          {/* Attacker damage */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', justifyContent: 'center',
            padding: '0 10px',
            background: atkDmg > defDmg ? 'rgba(239,68,68,0.1)' : 'transparent',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            transition: 'background 0.4s'
          }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f87171', lineHeight: 1 }}>
              {atkDmg.toLocaleString()}
            </div>
            <div style={{ fontSize: 9, color: '#666', fontWeight: 700 }}>
              {totalDmg > 0 ? `${Math.round((atkDmg / totalDmg) * 100)}%` : '0%'} dari total
            </div>
          </div>
          {/* Center total */}
          <div style={{
            flexShrink: 0, width: 56,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{ fontSize: 9, color: '#444', fontWeight: 700 }}>TOTAL</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#666' }}>{totalDmg.toLocaleString()}</div>
          </div>
          {/* Defender damage */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 10px',
            background: defDmg > atkDmg ? 'rgba(59,130,246,0.1)' : 'transparent',
            borderLeft: '1px solid rgba(255,255,255,0.05)',
            transition: 'background 0.4s'
          }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>
              {defDmg.toLocaleString()}
            </div>
            <div style={{ fontSize: 9, color: '#666', fontWeight: 700 }}>
              {totalDmg > 0 ? `${Math.round((defDmg / totalDmg) * 100)}%` : '0%'} dari total
            </div>
          </div>
        </div>
        {/* Proportional damage bar */}
        {totalDmg > 0 && (
          <div style={{ display: 'flex', height: 4 }}>
            <div style={{
              width: `${Math.round((atkDmg / totalDmg) * 100)}%`,
              background: 'linear-gradient(90deg, #b91c1c, #ef4444)',
              transition: 'width 0.6s ease',
              boxShadow: '0 0 6px rgba(239,68,68,0.6)'
            }} />
            <div style={{
              flex: 1,
              background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
              transition: 'flex 0.6s ease',
              boxShadow: '0 0 6px rgba(59,130,246,0.6)'
            }} />
          </div>
        )}
      </div>

      {/* Countdown to next tick */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '6px 12px', borderRadius: 8,
        background: isProcessingTick
          ? 'rgba(251,191,36,0.1)'
          : countdown !== null && countdown <= 30
            ? 'rgba(239,68,68,0.1)'
            : 'rgba(255,255,255,0.04)',
        border: isProcessingTick
          ? '1px solid rgba(251,191,36,0.3)'
          : countdown !== null && countdown <= 30
            ? '1px solid rgba(239,68,68,0.25)'
            : '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.3s'
      }}>
        <div style={{ fontSize: 10, color: isProcessingTick ? '#fbbf24' : '#666', fontWeight: 700 }}>
          {isProcessingTick ? '⚙️ Memproses Tick...' : '⏱️ Tick berikutnya'}
        </div>
        <div style={{
          fontSize: 16, fontWeight: 900,
          color: isProcessingTick ? '#fbbf24' : countdown !== null && countdown <= 30 ? '#f87171' : '#aaa',
          fontVariantNumeric: 'tabular-nums',
          minWidth: 48, textAlign: 'center',
          animation: isProcessingTick ? 'pulse 1s infinite' : 'none'
        }}>
          {isProcessingTick ? '···' : countdown === 0 ? '00:00' : formatCountdown(countdown)}
        </div>
        {!isProcessingTick && <div style={{ fontSize: 9, color: '#555' }}>menit:detik</div>}
      </div>

      {/* Recent ticks */}
      {recentTicks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, color: '#555', textTransform: 'uppercase' }}>
            📊 Tick Terakhir
          </div>
          <TickFeed ticks={recentTicks} attackerName={attackerName} defenderName={defenderName} />
        </div>
      )}

      {/* Past rounds summary */}
      {rounds && rounds.filter(r => r.status !== 'ONGOING').length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, color: '#555', textTransform: 'uppercase' }}>
            🏁 Riwayat Ronde
          </div>
          {[...rounds].filter(r => r.status !== 'ONGOING').sort((a, b) => a.round_number - b.round_number).map(r => (
            <div key={r.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '4px 8px', borderRadius: 6,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              fontSize: 10
            }}>
              <span style={{ color: '#666', fontWeight: 700 }}>Ronde {r.round_number}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#f87171' }}>⚔️ {r.attacker_points}pt</span>
                <span style={{ color: '#444' }}>|</span>
                <span style={{ color: '#60a5fa' }}>🛡️ {r.defender_points}pt</span>
              </div>
              <span style={{
                fontWeight: 900, fontSize: 9,
                color: r.status === 'ATTACKER_WON' ? '#f87171' : r.status === 'DEFENDER_WON' ? '#60a5fa' : '#888'
              }}>
                {r.status === 'ATTACKER_WON' ? '⚔️ SERANG MENANG' : r.status === 'DEFENDER_WON' ? '🛡️ TAHAN MENANG' : '🤝 SERI'}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
