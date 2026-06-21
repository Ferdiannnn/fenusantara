'use client';

export default function ChestOpeningOverlay({ open, emoji, text }) {
  if (!open) return null;

  const isBurst = emoji.includes('💥');

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        background: 'rgba(5, 5, 10, 0.85)', 
        zIndex: 10005, 
        flexDirection: 'column', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%' 
      }}
    >
      <div 
        className="chest-opening-glow" 
        style={{ 
          position: 'absolute', 
          width: '400px', 
          height: '400px', 
          background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(0,0,0,0) 70%)', 
          borderRadius: '50%', 
          filter: 'blur(25px)', 
          animation: 'chestRotateGlow 3s linear infinite' 
        }}
      ></div>
      
      <div style={{ 
        fontSize: '8rem', 
        filter: 'drop-shadow(0 0 35px rgba(245,158,11,0.6))', 
        zIndex: 2,
        animation: isBurst ? 'chestBurst 0.4s forwards' : 'shakeChest 0.12s infinite ease-in-out'
      }}>
        {emoji}
      </div>
      
      <div style={{ 
        marginTop: '25px', 
        fontSize: '1.25rem', 
        fontWeight: 900, 
        color: '#fbbf24', 
        textShadow: '0 0 15px rgba(245,158,11,0.6)', 
        zIndex: 2, 
        letterSpacing: '3px' 
      }}>
        {text}
      </div>
    </div>
  );
}
