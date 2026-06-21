'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const RARITY_BADGE = { COMMON: 'common', RARE: 'rare', EPIC: 'epic', LEGENDARY: 'legendary' };

export default function MarketTab({
  marketBuyType, setMarketBuyType,
  marketBuyRarity, setMarketBuyRarity,
  marketBuyName, setMarketBuyName,
  marketBuyPrice, setMarketBuyPrice,
  marketTemplates,
  orderBook,
  myOrders,
  handlePlaceBuyOrder,
  handleCancelOrder
}) {
  return (
    <div className="tab-pane active-pane flex flex-col gap-3">

      {/* Buy Order Form */}
      <Card className="border-white/5">
        <CardContent className="p-3">
          <h4 className="text-xs font-black text-indigo-300/80 uppercase tracking-widest mb-3">
            📋 Pasang Order Beli Baru
          </h4>
          <form onSubmit={handlePlaceBuyOrder} className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wide block mb-1">Tipe Slot</label>
              <Select value={marketBuyType} onChange={e => setMarketBuyType(e.target.value)} required>
                <option value="WEAPON">⚔️ WEAPON</option>
                <option value="HELMET">🪖 HELMET</option>
                <option value="ARMOR">🛡️ ARMOR</option>
                <option value="ARMS">🧤 ARMS</option>
                <option value="LEG">👖 LEG</option>
                <option value="BOOTS">🥾 BOOTS</option>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wide block mb-1">Kelangkaan</label>
              <Select value={marketBuyRarity} onChange={e => setMarketBuyRarity(e.target.value)} required>
                <option value="COMMON">COMMON</option>
                <option value="RARE">RARE</option>
                <option value="EPIC">EPIC</option>
                <option value="LEGENDARY">LEGENDARY</option>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wide block mb-1">Nama Peralatan</label>
              <Select value={marketBuyName} onChange={e => setMarketBuyName(e.target.value)} required>
                {((marketTemplates[marketBuyType]?.[marketBuyRarity]) || []).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wide block mb-1">Harga Beli (Gold)</label>
              <Input type="number" min="1" required placeholder="Contoh: 50" value={marketBuyPrice} onChange={e => setMarketBuyPrice(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="success" size="sm" className="w-full h-8 text-xs font-black">
                Beli Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Order Book */}
      <Card className="border-white/5">
        <CardContent className="p-3">
          <h4 className="text-xs font-black text-indigo-300/80 uppercase tracking-widest mb-2">
            📊 Order Book Aktif
          </h4>
          <div className="max-h-[140px] overflow-y-auto rounded-lg border border-white/5 text-xs">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black/30 border-b border-white/6 text-muted-foreground font-black">
                  <th className="p-1.5 text-left">Item</th>
                  <th className="p-1.5 text-left">Kelangkaan</th>
                  <th className="p-1.5 text-center">Tipe</th>
                  <th className="p-1.5 text-right">Qty</th>
                  <th className="p-1.5 text-right">Harga</th>
                </tr>
              </thead>
              <tbody>
                {orderBook.length > 0 ? (
                  orderBook.map((o, idx) => {
                    const isBuy = o.order_type === 'BUY';
                    return (
                      <tr key={idx} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                        <td className="p-1.5 font-semibold text-foreground">{o.name}</td>
                        <td className="p-1.5">
                          <Badge variant={RARITY_BADGE[o.rarity] || 'outline'} className="text-[9px] px-1 py-0">{o.rarity}</Badge>
                        </td>
                        <td className="p-1.5 text-center">
                          <Badge variant={isBuy ? 'success' : 'destructive'} className="text-[9px] px-1.5 py-0">{o.order_type}</Badge>
                        </td>
                        <td className="p-1.5 text-right text-muted-foreground">{o.count}x</td>
                        <td className={`p-1.5 text-right font-bold ${isBuy ? 'text-emerald-400' : 'text-amber-400'}`}>{o.price}G</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={5} className="text-center text-muted-foreground p-3">Tidak ada order aktif</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* My Orders */}
      <Card className="border-white/5">
        <CardContent className="p-3">
          <h4 className="text-xs font-black text-indigo-300/80 uppercase tracking-widest mb-2">
            🗂️ Antrean Aktif Saya
          </h4>
          <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto">
            {myOrders.length > 0 ? (
              myOrders.map(o => {
                const isBuy = o.order_type === 'BUY';
                return (
                  <div key={o.id} className="flex items-center justify-between bg-white/2 border border-white/5 rounded-lg px-3 py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant={isBuy ? 'success' : 'destructive'} className="text-[9px] px-1.5 py-0 shrink-0">{o.order_type}</Badge>
                      <Badge variant={RARITY_BADGE[o.rarity] || 'outline'} className="text-[9px] px-1.5 py-0 shrink-0">{o.rarity}</Badge>
                      <span className="text-xs font-semibold text-foreground truncate">{o.item_name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold ${isBuy ? 'text-emerald-400' : 'text-amber-400'}`}>{o.price}G</span>
                      <Button size="sm" variant="destructive" className="h-6 px-2 text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20" onClick={() => handleCancelOrder(o.id)}>
                        Batal
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground text-xs py-3">Tidak ada antrean aktif.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
