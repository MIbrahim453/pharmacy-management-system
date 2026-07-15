import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Wallet, Plus, Minus, Trash2,
  CreditCard, Banknote, CheckCircle,
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import { getPosMedicines, getPosCategories, createPosInvoice } from '../../../services/posService';

const abbr = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const formatPKR = (n) => 'Rs ' + Number(n).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const METHOD_ICONS = { Cash: <Banknote size={15} />, Card: <CreditCard size={15} />, 'Bank Transfer': <Wallet size={15} /> };

export default function Billing() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [payMethod, setPayMethod] = useState('Cash');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [done, setDone] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [qtyMed, setQtyMed] = useState(null);
  const [qtyMode, setQtyMode] = useState('dosage');
  const [dosage, setDosage] = useState('1');
  const [days, setDays] = useState('1');
  const [customQty, setCustomQty] = useState('1');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getPosCategories();
        setCategories(['All', ...cats]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch medicines when query, category, or refreshTrigger changes
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const list = await getPosMedicines(query, cat);
        setMedicines(list.map((m) => ({
          id: m._id,
          name: m.name,
          brand: m.manufacturer,
          category: m.category?.name || 'Uncategorized',
          price: m.sellingPrice || 0,
          stock: m.stockQty || 0,
          saleUnit: m.saleUnit || '',
          genericName: m.genericName || '',
          expiryDate: m.expiryDate,
        })));
      } catch (error) {
        console.error('Failed to fetch medicines:', error);
        toast.error('Failed to load medicines from server');
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, [query, cat, refreshTrigger]);

  const list = medicines;

  const entries = Object.values(cartItems);
  const DISCOUNT_RATE = 0.05;
  const subtotal = entries.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = Math.round(subtotal * DISCOUNT_RATE);
  const total = subtotal - discount;

  const computedQty = useMemo(() => {
    if (qtyMode === 'dosage') return Math.max(1, (Number(dosage) || 0) * (Number(days) || 0));
    return Math.max(1, Number(customQty) || 0);
  }, [qtyMode, dosage, days, customQty]);

  const openQtyModal = (m) => {
    setQtyMed(m);
    setQtyMode('dosage');
    setDosage('1');
    setDays('1');
    setCustomQty('1');
  };

  const confirmAddToCart = () => {
    const newItems = { ...cartItems };
    const name = qtyMed?.name;
    if (!name) return;
    if (!newItems[name]) {
      newItems[name] = { id: qtyMed.id, name, price: qtyMed?.price || 0, qty: 0 };
    }
    newItems[name].qty += computedQty;
    setCartItems(newItems);
    toast.success(`${computedQty} × ${name} added to cart`);
    setQtyMed(null);
  };

  const changeQty = (name, delta) => {
    const newItems = { ...cartItems };
    if (newItems[name]) {
      newItems[name].qty += delta;
      if (newItems[name].qty <= 0) {
        delete newItems[name];
      }
      setCartItems(newItems);
    }
  };

  const clearCart = () => {
    setCartItems({});
  };

  const checkout = async () => {
    if (!customerName.trim() || !customerMobile.trim()) {
      toast.error('Enter customer name and mobile number to checkout');
      return;
    }
    if (entries.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setCheckoutLoading(true);
    try {
      const items = entries.map((item) => ({
        medicineId: item.id,
        quantity: item.qty,
      }));

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerMobile.trim(),
        paymentMethod: payMethod,
        discount: discount, // Send the calculated discount
        items,
      };

      const result = await createPosInvoice(payload);
      const invNo = result.invoiceNumber;
      toast.success(`${invNo} · ${formatPKR(total)} processed successfully`);
      clearCart();
      setCustomerName('');
      setCustomerMobile('');
      setDone(true);
      setTimeout(() => setDone(false), 2000);
      
      // Refresh the medicines list to update stock
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Checkout failed:', error);
      const errMsg = error.response?.data?.message || 'Failed to complete sale';
      toast.error(errMsg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* ── Catalog ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader title="POS Billing" subtitle="Search or tap a medicine to add it to the cart." />

        {/* Search + categories */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
            <input
              className="input-base pl-10 text-sm"
              placeholder="Search medicine by name or brand…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${c === cat
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-primary/40'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="card-surface p-4 animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 bg-surface-container-high rounded-xl" />
                  <div className="h-5 w-16 bg-surface-container-high rounded-full" />
                </div>
                <div className="h-4 w-3/4 bg-surface-container-high rounded" />
                <div className="h-3 w-1/2 bg-surface-container-high rounded" />
                <div className="h-4 w-1/3 bg-surface-container-high rounded mt-2" />
              </div>
            ))
          ) : list.length === 0 ? (
            <div className="col-span-4 py-12 text-center text-sm text-on-surface-variant/70">
              No medicines match your search.
            </div>
          ) : (
            list.map((m) => {
              const out = m.stock === 0;
              const inCart = cartItems[m.name]?.qty || 0;
              return (
                <motion.button
                  key={m.name}
                  disabled={out}
                  onClick={() => openQtyModal(m)}
                  className={`group relative card-surface p-4 text-left transition-all duration-150 ${out
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg hover:border-primary/40 active:scale-[0.98]'
                    }`}
                >
                  {inCart > 0 && (
                    <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                      {inCart}
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.12] text-primary text-xs font-bold">
                      {abbr(m.name)}
                    </div>
                    <Badge status={out ? 'Expired' : m.stock < 60 ? 'Low stock' : 'In stock'} />
                  </div>
                  <div className="text-sm font-semibold text-on-surface leading-tight">{m.name}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">{m.brand} · {m.category}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-on-surface">{formatPKR(m.price)}<span className="text-[10px] font-normal text-on-surface-variant">/tab</span></span>
                    {!out && <Plus size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Cart ── */}
      <div className="w-full lg:w-80 lg:shrink-0 flex flex-col">
        <div className="card-surface flex-1 flex flex-col overflow-hidden">
          {/* Customer details */}
          <div className="px-5 py-4 border-b border-outline-variant/60 space-y-3">
            <Input
              label="Customer name"
              placeholder="e.g. Salim Akhtar"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Customer mobile number"
              placeholder="e.g. 0300-1234567"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
            />
          </div>

          {/* Cart header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/60">
            <div className="flex items-center gap-2">
              <ShoppingCart size={17} className="text-on-surface-variant" />
              <span className="text-sm font-semibold text-on-surface">Current Sale</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge status="Active">{entries.reduce((s, e) => s + e.qty, 0)} items</Badge>
              {entries.length > 0 && (
                <button onClick={clearCart} className="rounded-lg p-1 text-on-surface-variant/70 hover:text-error hover:bg-error/[0.08] transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/60">
            <AnimatePresence>
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 text-on-surface-variant/70">
                  <ShoppingCart size={32} strokeWidth={1.5} />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : entries.map((e) => (
                <motion.div
                  key={e.name}
                  className="flex items-center gap-3 px-4 py-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-on-surface truncate">{e.name}</div>
                    <div className="text-[10px] text-on-surface-variant">{formatPKR(e.price)} each</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => changeQty(e.name, -1)} className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-error/[0.12] hover:text-error transition-colors">
                      <Minus size={11} />
                    </button>
                    <span className="text-xs font-bold w-5 text-center text-on-surface">{e.qty}</span>
                    <button onClick={() => changeQty(e.name, 1)} className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-primary/[0.12] hover:text-primary transition-colors">
                      <Plus size={11} />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-on-surface w-16 text-right shrink-0">
                    {formatPKR(e.price * e.qty)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Totals + checkout */}
          {entries.length > 0 && (
            <div className="border-t border-outline-variant/60 p-4 space-y-2">
              {[
                ['Subtotal', formatPKR(subtotal), ''],
                ['Discount (5%)', `−${formatPKR(discount)}`, 'text-primary'],
              ].map(([l, v, cls]) => (
                <div key={l} className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">{l}</span>
                  <span className={`font-medium ${cls}`}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-outline-variant pt-2 mt-1">
                <span className="text-sm font-bold text-on-surface">Total</span>
                <span className="text-sm font-bold text-primary">{formatPKR(total)}</span>
              </div>

              {/* Payment method */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['Cash', 'Card', 'Bank Transfer', 'Cheque'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${m === payMethod
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-primary/[0.08]'
                      }`}
                  >
                    {METHOD_ICONS[m]}{m}
                  </button>
                ))}
              </div>

              <Button
                className="w-full justify-center mt-1"
                onClick={checkout}
                loading={checkoutLoading}
                icon={done ? <CheckCircle size={16} /> : <Wallet size={16} />}
              >
                {done ? 'Invoice created!' : `Complete Invoice · ${formatPKR(total)}`}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add-to-cart quantity modal */}
      <Modal open={!!qtyMed} onClose={() => setQtyMed(null)} title="Add to cart" subtitle={qtyMed?.name}
        footer={<div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setQtyMed(null)}>Cancel</Button>
          <Button onClick={confirmAddToCart}>Add {computedQty} · {qtyMed ? formatPKR(qtyMed.price * computedQty) : ''}</Button>
        </div>}>
        {qtyMed && (
          <div className="p-6 space-y-4">
            <div className="flex rounded-xl border border-outline-variant overflow-hidden">
              {[['dosage', 'By dosage & days'], ['custom', 'Custom quantity']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setQtyMode(key)}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${qtyMode === key ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {qtyMode === 'dosage' ? (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Dosage (tabs/day)" type="number" min="1" value={dosage} onChange={(e) => setDosage(e.target.value)} />
                <Input label="No. of days" type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} />
              </div>
            ) : (
              <Input label="Quantity" type="number" min="1" value={customQty} onChange={(e) => setCustomQty(e.target.value)} />
            )}

            <div className="rounded-xl bg-surface-container p-3 flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Total quantity</span>
              <span className="font-bold text-on-surface tnum">{computedQty} tabs</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
