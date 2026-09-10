import React, { useState, useEffect, useMemo } from "react";
import { productApi, supplierApi, categoryApi, stockApi } from "../services/apiModules";
import { Loading } from "../components/UIStates";
import {
      ArrowDownLeft,
      CheckCircle2,
      AlertCircle,
      Loader2,
      Truck,
      Package,
      Plus,
      Minus,
      Trash2,
      Layers,
      FileText,
      Boxes,
      Search,
      Filter
} from "lucide-react";

const StockIn = () => {
      const [products, setProducts] = useState([]);
      const [suppliers, setSuppliers] = useState([]);
      const [categories, setCategories] = useState([]);
      const [loading, setLoading] = useState(true);

      const [searchQuery, setSearchQuery] = useState("");
      const [selectedCategory, setSelectedCategory] = useState("");

      const [intakeCart, setIntakeCart] = useState([]);
      const [supplierId, setSupplierId] = useState("");
      const [note, setNote] = useState("");

      const [message, setMessage] = useState(null);
      const [errorMsg, setErrorMsg] = useState("");
      const [isSubmitting, setIsSubmitting] = useState(false);

      const fetchData = async () => {
            setLoading(true);
            try {
                  const [prodRes, supRes, catRes] = await Promise.all([
                        productApi.getAll(),
                        supplierApi.getAll(),
                        categoryApi.getAll()
                  ]);
                  if (prodRes.success) setProducts(prodRes.data);
                  if (supRes.success) setSuppliers(supRes.data);
                  if (catRes.success) setCategories(catRes.data);
            } catch (err) {
                  console.error("Error loading stock in data:", err);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchData();
      }, []);

      const filteredProducts = useMemo(() => {
            return products.filter((p) => {
                  const matchesSearch =
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCat = selectedCategory ? p.categoryId?.toString() === selectedCategory : true;
                  return matchesSearch && matchesCat;
            });
      }, [products, searchQuery, selectedCategory]);

      const addToIntake = (product) => {
            setMessage(null);
            setErrorMsg("");

            const existingIndex = intakeCart.findIndex((item) => item.product.id === product.id);

            if (existingIndex > -1) {
                  const newCart = [...intakeCart];
                  newCart[existingIndex].qty += 10;
                  setIntakeCart(newCart);
            } else {
                  setIntakeCart([...intakeCart, { product, qty: 10 }]);
            }
      };

      const updateIntakeQty = (productId, delta) => {
            setMessage(null);
            setErrorMsg("");

            setIntakeCart((prevCart) =>
                  prevCart
                        .map((item) => {
                              if (item.product.id === productId) {
                                    const newQty = item.qty + delta;
                                    return newQty > 0 ? { ...item, qty: newQty } : null;
                              }
                              return item;
                        })
                        .filter(Boolean)
            );
      };

      const setExactIntakeQty = (productId, val) => {
            const parsed = parseInt(val) || 0;
            setIntakeCart((prevCart) =>
                  prevCart.map((item) => (item.product.id === productId ? { ...item, qty: parsed } : item))
            );
      };

      const removeFromIntake = (productId) => {
            setIntakeCart(intakeCart.filter((item) => item.product.id !== productId));
      };

      const handleProcessStockIn = async (e) => {
            e.preventDefault();
            if (intakeCart.length === 0) {
                  setErrorMsg("Please select at least one product to receive stock.");
                  return;
            }

            setIsSubmitting(true);
            setMessage(null);
            setErrorMsg("");

            try {
                  const selectedSupplierObj = suppliers.find((s) => s.id.toString() === supplierId);
                  const supplierInfo = selectedSupplierObj ? ` | Supplier: ${selectedSupplierObj.name}` : "";
                  const baseNote = note ? `${note}${supplierInfo}` : `Restock Intake${supplierInfo}`;

                  for (const item of intakeCart) {
                        await stockApi.stockIn({
                              productId: item.product.id,
                              supplierId: supplierId || null,
                              quantity: item.qty,
                              note: baseNote
                        });
                  }

                  const totalReceived = intakeCart.reduce((sum, item) => sum + item.qty, 0);
                  setMessage(
                        `Stock intake completed successfully! Received ${totalReceived} units across ${intakeCart.length} product(s).`
                  );

                  setIntakeCart([]);
                  setSupplierId("");
                  setNote("");
                  fetchData();
            } catch (err) {
                  setErrorMsg(err.response?.data?.message || err.message || "Failed to process stock intake.");
            } finally {
                  setIsSubmitting(false);
            }
      };

      if (loading) return <Loading message="កំពុងទាញយកបញ្ជីទំនិញ និងអ្នកផ្គត់ផ្គង់..." />;

      return (
            <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                    <ArrowDownLeft className="w-6 h-6" />
                              </div>
                              <div>
                                    <h1 className="text-lg md:text-2xl font-bold text-slate-100">នាំចូលស្តុក (ទទួលទំនិញ)</h1>
                              </div>
                        </div>
                  </div>

                  {message && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 shrink-0" />
                              <span>{message}</span>
                        </div>
                  )}

                  {errorMsg && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-3">
                              <AlertCircle className="w-5 h-5 shrink-0" />
                              <span>{errorMsg}</span>
                        </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                              <div className="flex items-center justify-between">
                                    <h3 className="text-xs md:text-base font-bold text-slate-200 flex items-center gap-2">
                                          <Boxes className="w-5 h-5 text-emerald-400" /> ជ្រើសរើសទំនិញដើម្បីនាំចូល
                                    </h3>
                                    <span className="text-xs text-slate-400">មាន {filteredProducts.length} មុខទំនិញ</span>
                              </div>

                              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                          <input
                                                type="text"
                                                placeholder="ស្វែងរកទំនិញតាមឈ្មោះ ឬ SKU..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                          />
                                    </div>

                                    <div className="sm:w-48 relative">
                                          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                          <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full pl-9 pr-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                                          >
                                                <option value="">គ្រប់ប្រភេទទំនិញ</option>
                                                {categories.map((c) => (
                                                      <option key={c.id} value={c.id}>
                                                            {c.name}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>
                              </div>

                              {/* products */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1">
                                    {filteredProducts.length === 0 ? (
                                          <div className="col-span-2 p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
                                                មិនមានទំនិញដែលត្រូវគ្នាទេ។ សូមព្យាយាមស្វែងរកឡើងវិញ។
                                          </div>
                                    ) : (
                                          filteredProducts.map((p) => {
                                                const inCart = intakeCart.find((item) => item.product.id === p.id);

                                                return (
                                                      <div
                                                            key={p.id}
                                                            className={`p-4 rounded-2xl bg-slate-900/80 border transition-all cursor-pointer flex flex-col justify-between shadow-slate-950 ${inCart
                                                                  ? "border-emerald-500/60 ring-2 ring-emerald-500/20 bg-slate-900"
                                                                  : "border-slate-800 hover:border-emerald-500/40"
                                                                  }`}
                                                      >
                                                            <div className="flex items-start justify-between">
                                                                  <div className="flex items-start gap-2 md:gap-4 mb-1.5">
                                                                        <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                                                              {p.imageUrl ? (
                                                                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                                              ) : (
                                                                                    <Package className="w-5 h-5 text-slate-500" />
                                                                              )}
                                                                        </div>
                                                                        <div>
                                                                              <span className="text-xs font-mono text-emerald-400 font-semibold">{p.sku}</span>
                                                                              <h4 className="text-sm font-bold text-slate-100">{p.name}</h4>
                                                                        </div>
                                                                  </div>

                                                                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                                                                        {p.category?.name || "ទំនិញ"}
                                                                  </span>
                                                            </div>

                                                            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80">
                                                                  <div>
                                                                        <span className="text-xs text-slate-400 block">ស្តុកបច្ចុប្បន្ន</span>
                                                                        <span
                                                                              className={`text-sm font-bold ${p.quantity <= (p.minStock || 5) ? "text-amber-400" : "text-slate-200"
                                                                                    }`}
                                                                        >
                                                                              {p.quantity}
                                                                        </span>
                                                                  </div>

                                                                  {inCart ? (
                                                                        <span onClick={() => addToIntake(p)} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                                                                              + {inCart.qty} ក្នុងបញ្ជី
                                                                        </span>
                                                                  ) : (
                                                                        <span onClick={() => addToIntake(p)} className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors">
                                                                              <Plus className="w-4 h-4" />
                                                                        </span>
                                                                  )}
                                                            </div>
                                                      </div>
                                                );
                                          })
                                    )}
                              </div>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full space-y-6">
                              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                          <Package className="w-5 h-5 text-emerald-400" />
                                          <h3 className="text-base font-bold text-slate-100">សរុបការនាំចូល</h3>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-600/20 text-emerald-300 font-bold">
                                          {intakeCart.length} មុខទំនិញ
                                    </span>
                              </div>

                              {intakeCart.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                                          <Layers className="w-10 h-10 mb-2 opacity-40 text-emerald-500" />
                                          <p className="text-sm font-medium">មិនទាន់មានទំនិញក្នុងបញ្ជីនាំចូលទេ</p>
                                          <p className="text-xs">សូមចុចលើទំនិញខាងឆ្វេងដើម្បីបន្ថែមចូលក្នុងបញ្ជី។</p>
                                    </div>
                              ) : (
                                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[260px] pr-1">
                                          {intakeCart.map((item) => (
                                                <div
                                                      key={item.product.id}
                                                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between"
                                                >
                                                      <div className="min-w-0 pr-2">
                                                            <p className="text-sm font-bold text-slate-200 truncate">{item.product.name}</p>
                                                            <p className="text-xs text-slate-400">
                                                                  បច្ចុប្បន្ន: <span className="text-slate-300">{item.product.quantity}</span> → ថ្មី:{" "}
                                                                  <span className="text-emerald-400 font-bold">{item.product.quantity + item.qty}</span>
                                                            </p>
                                                      </div>
                                                      <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                  onClick={() => updateIntakeQty(item.product.id, -5)}
                                                                  className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded cursor-pointer"
                                                            >
                                                                  <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <input
                                                                  type="number"
                                                                  min="1"
                                                                  value={item.qty}
                                                                  onChange={(e) => setExactIntakeQty(item.product.id, e.target.value)}
                                                                  className="w-12 py-0.5 px-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                                                            />
                                                            <button
                                                                  onClick={() => updateIntakeQty(item.product.id, 5)}
                                                                  className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded cursor-pointer"
                                                            >
                                                                  <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                  onClick={() => removeFromIntake(item.product.id)}
                                                                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded ml-1 cursor-pointer"
                                                            >
                                                                  <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              )}

                              <div className="pt-4 border-t border-slate-800 space-y-4">
                                    <div>
                                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <Truck className="w-3.5 h-3.5 text-emerald-400" /> អ្នកផ្គត់ផ្គង់ (ជម្រើស)
                                          </label>
                                          <select
                                                value={supplierId}
                                                onChange={(e) => setSupplierId(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                          >
                                                <option value="">-- ជ្រើសរើសអ្នកផ្គត់ផ្គង់ --</option>
                                                {suppliers.map((s) => (
                                                      <option key={s.id} value={s.id}>
                                                            {s.name}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>

                                    <div>
                                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-emerald-400" /> កំណត់ចំណាំរំលឹក / លេខវិក្កយបត្រ PO
                                          </label>
                                          <input
                                                type="text"
                                                placeholder="ឧ. ទទួលតាមរយៈការបញ្ជាទិញ #PO-9921"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                          />
                                    </div>

                                    <button
                                          onClick={handleProcessStockIn}
                                          disabled={isSubmitting || intakeCart.length === 0}
                                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                          {isSubmitting ? (
                                                <>
                                                      <Loader2 className="w-4 h-4 animate-spin" /> កំពុងដំណើរការទទួលទំនិញ...
                                                </>
                                          ) : (
                                                <>
                                                      <ArrowDownLeft className="w-4 h-4" /> បញ្ជាក់ការនាំចូលស្តុក ({intakeCart.reduce((sum, i) => sum + i.qty, 0)} units)
                                                </>
                                          )}
                                    </button>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default StockIn;
