'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const RARITY_COLOR = { COMMON: 'text-slate-400', RARE: 'text-blue-400', EPIC: 'text-purple-400', LEGENDARY: 'text-amber-400' };
const RARITY_BADGE = { COMMON: 'common', RARE: 'rare', EPIC: 'epic', LEGENDARY: 'legendary' };

const SHOP_ITEMS = [
  { key: 'wood_sword',       name: 'Pedang Kayu',       stats: 'ATK +2',    cost: 30, statColor: 'text-red-400' },
  { key: 'wood_shield',      name: 'Perisai Kayu',      stats: 'DEF +1',    cost: 30, statColor: 'text-blue-400' },
  { key: 'leather_boots',    name: 'Sepatu Kulit',      stats: 'AGI +2%',   cost: 30, statColor: 'text-emerald-400' },
  { key: 'leather_helmet',   name: 'Helm Kulit',        stats: 'DEF +1',    cost: 30, statColor: 'text-blue-400' },
  { key: 'cloth_gloves',     name: 'Sarung Tangan Kain',stats: 'CRIT +2%',  cost: 30, statColor: 'text-purple-400' },
  { key: 'leather_leggings', name: 'Celana Kulit',      stats: 'DEF +1',    cost: 30, statColor: 'text-blue-400' }
];

export default function ShopTab({
  player,
  chestRates,
  ratesSum,
  handleOpenChest,
  handleBuyShopItem,
  handleRateChange,
  submitChestRates
}) {
  return (
    <div className="tab-pane active-pane flex flex-col gap-3">

      {/* Loot Chest Card */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-red-500/10">
        <CardContent className="p-4 text-center">
          <div className="text-3xl mb-2">🎁</div>
          <h4 className="text-amber-400 font-black text-sm mb-1">Loot Chest Acak</h4>
          <p className="text-xs text-muted-foreground mb-3">Dapatkan perlengkapan Common s/d Legendary!</p>
          <div className="flex gap-2 justify-center text-xs mb-3">
            {Object.entries(chestRates || {}).map(([r, v]) => (
              <Badge key={r} variant={RARITY_BADGE[r] || 'outline'} className="text-[10px]">
                {r}: {v}%
              </Badge>
            ))}
          </div>
          <Button variant="warning" className="font-black text-xs px-6 animate-pulse" onClick={handleOpenChest}>
            🎲 Buka Chest (50 Gold)
          </Button>
        </CardContent>
      </Card>

      {/* Admin Rate Editor */}
      {player.id === 1 && (
        <Card className="border-amber-500/20">
          <CardContent className="p-3">
            <h5 className="text-amber-400 text-xs font-black uppercase tracking-wide mb-3">⚙️ Atur Probabilitas Chest</h5>
            <form onSubmit={submitChestRates} className="grid grid-cols-2 gap-2">
              {['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].map(r => (
                <div key={r}>
                  <label className={`text-[10px] font-black uppercase tracking-wide block mb-1 ${RARITY_COLOR[r]}`}>{r} (%)</label>
                  <Input
                    type="number" min="0" max="100" required
                    value={chestRates[r]}
                    onChange={(e) => handleRateChange(r, e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              ))}
              <div className="col-span-2 flex justify-between items-center pt-2 border-t border-white/5 mt-1">
                <span className={`text-xs font-bold ${ratesSum === 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                  Total: {ratesSum}%
                </span>
                <Button type="submit" size="sm" variant="default" className="text-xs h-7">
                  Simpan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator className="bg-white/5" />
      <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Beli Peralatan Dasar</h4>

      {/* Shop Grid */}
      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
        {SHOP_ITEMS.map(item => (
          <Card key={item.key} className="border-white/5 hover:border-indigo-500/20 transition-colors">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-foreground">{item.name}</div>
                <div className={`text-xs font-semibold ${item.statColor}`}>{item.stats} · COMMON</div>
              </div>
              <Button size="sm" variant="default" className="text-xs px-3 h-7" onClick={() => handleBuyShopItem(item.key)}>
                {item.cost} G
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
