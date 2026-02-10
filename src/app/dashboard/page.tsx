'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { useGoldPrice } from '@/hooks/use-gold-price';

type Holding = {
  id: string;
  quantity: number;
  unit: 'oz' | 'g' | 'kg';
  purchase_price: number;
  purchase_date: string;
};

export default function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [form, setForm] = useState<{
    quantity: string;
    price: string;
    date: string;
    unit: 'oz' | 'g' | 'kg';
  }>({ quantity: '', price: '', date: '', unit: 'oz' });

  const router = useRouter();
  const supabase = createClient();
  const { prices } = useGoldPrice();

  // 1. Fetch User & Holdings
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from('holdings')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (data) setHoldings(data);
      setLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  // Refresh function for after mutations
  const fetchData = async () => {
    const { data } = await supabase
      .from('holdings')
      .select('*')
      .order('purchase_date', { ascending: false });

    if (data) setHoldings(data);
  };

  // 2. Add Holding Logic
  const handleAdd = async () => {
    if (!user || !form.quantity || !form.price) return;

    const { error } = await supabase.from('holdings').insert({
      user_id: user.id,
      quantity: parseFloat(form.quantity),
      purchase_price: parseFloat(form.price),
      purchase_date: form.date || new Date().toISOString().split('T')[0],
      unit: form.unit,
    });

    if (!error) {
      setIsAdding(false);
      setForm({ quantity: '', price: '', date: '', unit: 'oz' });
      fetchData();
    }
  };

  // 3. Delete Logic
  const handleDelete = async (id: string) => {
    await supabase.from('holdings').delete().eq('id', id);
    fetchData();
  };

  // 4. Calculations
  const currentPricePerOz = prices.oz || 0;

  const totalOz = holdings.reduce((acc, h) => {
    let oz = Number(h.quantity);
    if (h.unit === 'g') oz = oz / 31.1035;
    if (h.unit === 'kg') oz = oz * 32.1507;
    return acc + oz;
  }, 0);

  const totalCost = holdings.reduce(
    (acc, h) => acc + h.purchase_price * h.quantity,
    0
  );
  const currentValue = totalOz * currentPricePerOz;
  const profit = currentValue - totalCost;
  const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  if (loading)
    return <div className="p-8 text-gold animate-pulse">Syncing Vault...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              My Vault
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back to your Institutional Portfolio Tracker{' '}
              {user.user_metadata.full_name}
            </p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gold/20 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">
                Total Holdings
              </span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {totalOz.toFixed(4)}{' '}
              <span className="text-base font-normal text-muted-foreground">
                oz
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gold/20 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">
                Current Value
              </span>
            </div>
            <div className="text-3xl font-bold text-primary">
              $
              {currentValue.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border shadow-sm ${profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Total Return
              </span>
            </div>
            <div
              className={`text-3xl font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}
            >
              {profit >= 0 ? '+' : ''}
              {profitPercent.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              ${Math.abs(profit).toLocaleString()}{' '}
              {profit >= 0 ? 'Profit' : 'Loss'}
            </div>
          </div>
        </div>

        {/* Holdings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-primary">Physical Assets</h2>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Asset
            </button>
          </div>

          {/* Add Form */}
          {isAdding && (
            <div className="p-6 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-in slide-in-from-top-2">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded text-sm"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Quantity
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-2 border rounded text-sm"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Unit
                </label>
                <select
                  className="w-full p-2 border rounded text-sm"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  value={form.unit}
                  onChange={(e) =>
                    setForm({ ...form, unit: e.target.value as any })
                  }
                >
                  <option value="oz">Troy Oz</option>
                  <option value="g">Gram</option>
                  <option value="kg">Kilogram</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Cost per Unit ($)
                </label>
                <input
                  type="number"
                  placeholder="Price Bought"
                  className="w-full p-2 border rounded text-sm"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <button
                onClick={handleAdd}
                className="bg-green-600 text-white p-2 rounded text-sm font-medium hover:bg-green-700"
              >
                Save Asset
              </button>
            </div>
          )}

          {/* Table */}
          {holdings.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No assets recorded yet.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Buy Price</th>
                  <th className="p-4">Current Value</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {holdings.map((h) => {
                  // Calculate row stats
                  let oz = Number(h.quantity);
                  if (h.unit === 'g') oz = oz / 31.1035;
                  if (h.unit === 'kg') oz = oz * 32.1507;
                  const val = oz * currentPricePerOz;

                  return (
                    <tr key={h.id} className="hover:bg-gray-50/50">
                      <td className="p-4">{h.purchase_date}</td>
                      <td className="p-4 font-medium">
                        {h.quantity}{' '}
                        <span className="text-xs text-gray-400 uppercase">
                          {h.unit}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        ${h.purchase_price.toLocaleString()}
                      </td>
                      <td className="p-4 font-medium text-primary">
                        $
                        {val.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
