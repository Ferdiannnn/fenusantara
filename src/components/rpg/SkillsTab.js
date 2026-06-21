'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const SKILL_LIST = [
  { key: 'atk',       name: '⚔️ Attack',       desc: 'Menambah damage tiap hit (+2 per level)' },
  { key: 'def',       name: '🛡️ Defence',       desc: 'Kurangi biaya hit (-1 G), naikkan max stamina (+10), regen +5%/lv' },
  { key: 'eco',       name: '💰 Ekonomi',       desc: 'Naikkan batas Energi Kerja (+10) & regen +5%/lv' },
  { key: 'agi',       name: '⚡ Agility',       desc: 'Durability equipment aman dari hit (+5%/lv)' },
  { key: 'crit_rate', name: '🎯 Crit Rate',     desc: 'Peluang damage kritikal (+4%/lv)' },
  { key: 'crit_dmg',  name: '💥 Crit Damage',   desc: 'Meningkatkan multiplier kritikal (+10%/lv)' }
];

export default function SkillsTab({ player, handleUpgradeSkill }) {
  const hasPoints = (player.skill_points || 0) >= 1;

  return (
    <div className="tab-pane active-pane flex flex-col gap-3">

      {/* Skill Points Banner */}
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="p-3 text-center">
          <div className="text-xs text-emerald-300/70 uppercase tracking-widest mb-1">
            Poin Kemampuan Tersedia
          </div>
          <div className="text-3xl font-black text-emerald-400 leading-none mb-1">
            {player.skill_points || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            Gunakan poin untuk meningkatkan keahlian tempur &amp; ekonomi
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="flex justify-between text-xs font-bold text-slate-300 px-1">
        <span>Level Panglima: <span className="text-white">{player.level || 1}</span></span>
        <span>Emas: <span className="text-yellow-400">{player.gold} G</span></span>
      </div>

      <Separator className="bg-white/5" />

      {/* Skills List */}
      <div className="flex flex-col gap-2">
        {SKILL_LIST.map(s => {
          const currentLevel = player[s.key + '_level'] || 0;
          return (
            <Card key={s.key} className="border-white/5 hover:border-indigo-500/20 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-foreground">{s.name}</span>
                    <Badge variant="common" className="text-[10px] px-1.5 py-0">
                      Lv. {currentLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{s.desc}</p>
                </div>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleUpgradeSkill(s.key)}
                  disabled={!hasPoints}
                  className="shrink-0 text-xs px-3"
                >
                  Latih
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
