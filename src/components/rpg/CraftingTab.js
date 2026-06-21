'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RARITY_BADGE = { COMMON: 'common', RARE: 'rare', EPIC: 'epic', LEGENDARY: 'legendary' };
const TYPE_EMOJI   = { WEAPON: '⚔️', ARMOR: '🛡️', HELMET: '🪖', BOOTS: '🥾', ARMS: '🧤', LEG: '👖' };

export default function CraftingTab({ player, recipes, handleCraftItem }) {
  return (
    <div className="tab-pane active-pane flex flex-col gap-3">

      {/* Materials Card */}
      <Card className="border-white/5">
        <CardContent className="p-3 grid grid-cols-3 gap-3 text-center">
          {[
            { emoji: '🪵', label: 'Kayu',   val: player.wood   || 0 },
            { emoji: '⚙️', label: 'Besi',   val: player.iron   || 0 },
            { emoji: '🌶️', label: 'Rempah', val: player.spices || 0 }
          ].map((m, i) => (
            <div key={i} className={i === 1 ? 'border-x border-white/6 px-2' : ''}>
              <div className="text-2xl mb-1">{m.emoji}</div>
              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wide mb-0.5">{m.label}</div>
              <div className="text-lg font-black text-foreground">{m.val}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <h4 className="text-xs font-black text-indigo-300/70 uppercase tracking-widest px-1">Daftar Resep Tempaan</h4>

      {/* Recipe List */}
      <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
        {recipes.map(r => {
          const hasWood   = (player.wood   || 0) >= r.cost.wood;
          const hasIron   = (player.iron   || 0) >= r.cost.iron;
          const hasSpices = (player.spices || 0) >= r.cost.spices;
          const hasGold   = (player.gold   || 0) >= r.cost.gold;
          const canCraft  = hasWood && hasIron && hasSpices && hasGold;

          return (
            <Card
              key={r.key}
              className={`border transition-colors ${
                canCraft ? 'border-emerald-500/25 hover:border-emerald-500/40' : 'border-white/5'
              }`}
            >
              <CardContent className="p-3 flex gap-3 items-center">
                {/* Icon */}
                <div className="w-12 h-12 shrink-0 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center text-2xl">
                  {TYPE_EMOJI[r.type] || '🔧'}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-bold text-foreground truncate">{r.name}</span>
                    <Badge variant={RARITY_BADGE[r.rarity] || 'outline'} className="text-[10px] px-1.5 py-0 shrink-0">
                      {r.rarity}
                    </Badge>
                  </div>
                  <div className="text-xs text-indigo-300/70 font-semibold mb-1.5">{r.stats}</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-bold">
                    {r.cost.wood   > 0 && <span className={hasWood   ? 'text-emerald-400' : 'text-red-400'}>{hasWood   ? '✔' : '✗'} 🪵 {r.cost.wood}</span>}
                    {r.cost.iron   > 0 && <span className={hasIron   ? 'text-emerald-400' : 'text-red-400'}>{hasIron   ? '✔' : '✗'} ⚙️ {r.cost.iron}</span>}
                    {r.cost.spices > 0 && <span className={hasSpices ? 'text-emerald-400' : 'text-red-400'}>{hasSpices ? '✔' : '✗'} 🌶️ {r.cost.spices}</span>}
                    <span className={hasGold ? 'text-yellow-400' : 'text-red-400'}>{hasGold ? '✔' : '✗'} 💰 {r.cost.gold}G</span>
                  </div>
                </div>

                {/* Craft Button */}
                <Button
                  size="sm"
                  variant={canCraft ? 'success' : 'ghost'}
                  onClick={() => handleCraftItem(r.key)}
                  disabled={!canCraft}
                  className="shrink-0 text-xs px-2 h-8"
                >
                  ⚒️ Buat
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
