'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RARITY_VARIANT = {
  LEGENDARY: 'legendary',
  EPIC: 'epic',
  RARE: 'rare',
  COMMON: 'common'
};

const SLOTS = [
  { key: 'HELMET', label: '🪖 Helm' },
  { key: 'ARMOR',  label: '🛡️ Zirah' },
  { key: 'LEG',    label: '👖 Celana' },
  { key: 'WEAPON', label: '⚔️ Senjata' },
  { key: 'ARMS',   label: '🧤 Sarung' },
  { key: 'BOOTS',  label: '🥾 Sepatu' }
];

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
    <div className="tab-pane active-pane flex flex-col gap-3">

      {/* Combat Stats Row */}
      <Card className="border-white/5">
        <CardContent className="p-3 grid grid-cols-4 gap-2 text-center text-xs font-bold">
          <div className="text-foreground">⚔️ +{equippedAtk}</div>
          <div className="text-foreground">🛡️ +{equippedDef}</div>
          <div className="text-foreground">⚡ +{equippedAgi}%</div>
          <div className="text-foreground">💥 +{equippedCrit}%</div>
        </CardContent>
      </Card>

      {/* Equipment Slot Grid */}
      <Card className="border-white/5">
        <CardContent className="p-3 grid grid-cols-3 gap-2">
          {SLOTS.map(s => {
            const eq = equippedSummary[s.key];
            return (
              <div
                key={s.key}
                className={`rounded-lg p-2 text-center text-xs transition-colors ${
                  eq
                    ? 'bg-indigo-500/5 border border-indigo-500/30'
                    : 'bg-black/20 border border-dashed border-white/10'
                }`}
              >
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wide mb-1">
                  {s.label}
                </div>
                <div className={`font-bold truncate ${
                  eq ? (eq.durability <= 0 ? 'text-red-400' : 'text-emerald-400') : 'text-slate-600'
                }`}>
                  {eq ? eq.name : 'Kosong'}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Inventory List */}
      <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
        {player.equipments && player.equipments.length > 0 ? (
          player.equipments.map(eq => {
            const isBroken = eq.durability <= 0;
            const isOnMarket = eq.on_market === true;
            let bonus = '';
            if (eq.atk_bonus)       bonus += `⚔️ +${eq.atk_bonus} `;
            if (eq.def_bonus)       bonus += `🛡️ +${eq.def_bonus} `;
            if (eq.agi_bonus)       bonus += `⚡ +${eq.agi_bonus}% `;
            if (eq.crit_rate_bonus) bonus += `💥 +${eq.crit_rate_bonus}% `;
            if (!bonus) bonus = 'Normal';

            return (
              <Card
                key={eq.id}
                className={`border transition-all ${
                  eq.rarity === 'LEGENDARY' ? 'border-amber-500/50 bg-amber-500/5' :
                  eq.rarity === 'EPIC'      ? 'border-purple-500/50 bg-purple-500/5' :
                  eq.rarity === 'RARE'      ? 'border-blue-500/40 bg-blue-500/5' :
                  'border-white/6'
                } ${isBroken ? '!border-red-500/40' : ''} ${eq.equipped ? '!border-emerald-500/40' : ''}`}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-sm font-bold text-foreground truncate">{eq.name}</span>
                      <Badge variant={RARITY_VARIANT[eq.rarity] || 'outline'} className="text-[10px] px-1.5 py-0 shrink-0">
                        {eq.rarity}
                      </Badge>
                      {eq.equipped && <Badge variant="success" className="text-[10px] px-1.5 py-0">DIPAKAI</Badge>}
                      {isOnMarket && <Badge variant="warning" className="text-[10px] px-1.5 py-0">DI PASAR</Badge>}
                      {isBroken && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">HANCUR</Badge>}
                    </div>
                    <div className={`text-xs font-semibold mb-0.5 ${isBroken ? 'text-red-400' : 'text-emerald-400'}`}>
                      {bonus}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Durabilitas: {eq.durability}/{eq.max_durability}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {eq.equipped ? (
                      <Button size="sm" variant="outline" className="text-xs px-2 h-7 border-indigo-500/40 text-indigo-300" onClick={() => handleUnequipItem(eq.id)}>Lepas</Button>
                    ) : isOnMarket ? (
                      <Button size="sm" variant="ghost" className="text-xs px-2 h-7 opacity-40" disabled>Pasang</Button>
                    ) : !isBroken ? (
                      <Button size="sm" variant="success" className="text-xs px-2 h-7" onClick={() => handleEquipItem(eq.id)}>Pasang</Button>
                    ) : null}

                    {isOnMarket ? (
                      <Button size="sm" variant="ghost" className="text-xs px-2 h-7 opacity-40" disabled>Di Pasar</Button>
                    ) : (
                      <Button size="sm" variant="destructive" className="text-xs px-2 h-7 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20" onClick={() => handleSellItem(eq.id, eq.sell_price)}>
                        {eq.sell_price}G
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground py-8 text-sm font-medium">
            Tidak memiliki peralatan. Buka loot chest atau beli di toko!
          </div>
        )}
      </div>
    </div>
  );
}
