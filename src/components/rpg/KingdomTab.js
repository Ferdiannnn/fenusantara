'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Users, Info } from 'lucide-react';

const ROLE_COLORS = {
  KING: 'text-amber-400 border-amber-500/50 bg-amber-500/10',
  MINISTER: 'text-purple-400 border-purple-500/50 bg-purple-500/10',
  GENERAL: 'text-red-400 border-red-500/50 bg-red-500/10',
  MEMBER: 'text-slate-400 border-white/10 bg-white/5'
};

const ROLE_LABELS = {
  KING: '👑 Raja',
  MINISTER: '📜 Menteri',
  GENERAL: '⚔️ Jenderal',
  MEMBER: '👤 Warga'
};

export default function KingdomTab({
  player,
  kingdomMembers,
  handleUpdateRole,
  isFetchingMembers
}) {
  const isHighRank = ['KING', 'MINISTER', 'GENERAL'].includes(player.role);

  if (!isHighRank) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-3">
        <Users className="w-8 h-8 opacity-20" />
        <p className="text-sm font-medium leading-relaxed">
          Hanya Raja dan Petinggi (Menteri/Jenderal) yang dapat melihat daftar warga kerajaan.
        </p>
      </div>
    );
  }

  return (
    <div className="tab-pane active-pane flex flex-col gap-3">
      <Card className="border-indigo-500/20 bg-indigo-500/5">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="text-2xl mb-1">🏰</div>
          <h4 className="text-indigo-300 font-black text-sm mb-1">Daftar Warga Kerajaan</h4>
          <p className="text-xs text-muted-foreground">
            {kingdomMembers?.length || 0} warga terdaftar dalam Kerajaan {player.kingdom?.name}
          </p>
        </CardContent>
      </Card>

      <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">
        Anggota ({kingdomMembers?.length || 0})
      </h4>

      {isFetchingMembers ? (
        <div className="text-center text-muted-foreground text-xs p-4">Memuat data warga...</div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {kingdomMembers && kingdomMembers.length > 0 ? (
            kingdomMembers.map(member => (
              <Card key={member.id} className="border-white/5">
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-lg font-black text-white shrink-0">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-foreground">{member.username}</span>
                        <div className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wide border ${ROLE_COLORS[member.role]}`}>
                          {ROLE_LABELS[member.role]}
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-semibold">
                        Lv.{member.level} · {member.score} Score
                      </div>
                    </div>
                  </div>

                  {player.role === 'KING' && member.role !== 'KING' && (
                    <div className="shrink-0 flex items-center gap-1">
                      <Select 
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="h-7 text-[10px] w-24 bg-black/40 border-white/10"
                      >
                        <option value="MINISTER">Menteri</option>
                        <option value="GENERAL">Jenderal</option>
                        <option value="MEMBER">Warga</option>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground text-xs p-4">
              Gagal memuat atau tidak ada warga.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
