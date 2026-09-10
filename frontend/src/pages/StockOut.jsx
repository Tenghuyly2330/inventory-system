import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { productApi, categoryApi, stockApi } from "../services/apiModules";
import { useToast } from "../context/ToastContext";
import { Loading } from "../components/UIStates";
import {
      ShoppingCart,
      CheckCircle2,
      AlertCircle,
      Plus,
      Minus,
      Trash2,
      Calculator,
      Receipt,
      Loader2,
      Percent,
      Tag,
      Edit3,
      XCircle,
      Search,
      Filter,
      Package
} from "lucide-react";

const StockOut = () => {
      const location = useLocation();
      const navigate = useNavigate();
      const editOrderData = location.state?.editOrder || null;

      const toast = useToast();
      const [products, setProducts] = useState([]);
      const [categories, setCategories] = useState([]);
      const [loading, setLoading] = useState(true);

      // Search & Filter State
      const [searchQuery, setSearchQuery] = useState("");
      const [selectedCategory, setSelectedCategory] = useState("");

      // Purchase / Cart State
      const [cart, setCart] = useState([]);
      const [discountType, setDiscountType] = useState("percent");
      const [discountValue, setDiscountValue] = useState("");
      const [customerNote, setCustomerNote] = useState("");
      const [isEditingExisting, setIsEditingExisting] = useState(false);
      const [editingOrderId, setEditingOrderId] = useState(null);

      const [message, setMessage] = useState(null);
      const [errorMsg, setErrorMsg] = useState("");
      const [isSubmitting, setIsSubmitting] = useState(false);

      const fetchData = async () => {
            setLoading(true);
            try {
                  const [prodRes, catRes] = await Promise.all([
                        productApi.getAll(),
                        categoryApi.getAll()
                  ]);
                  if (prodRes.success) setProducts(prodRes.data);
                  if (catRes.success) setCategories(catRes.data);
            } catch (err) {
                  console.error("Error loading products for stock out:", err);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchData();
      }, []);

      // filter pro
      const filteredProducts = useMemo(() => {
            return products.filter((p) => {
                  const matchesSearch =
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCat = selectedCategory ? p.categoryId?.toString() === selectedCategory : true;
                  return matchesSearch && matchesCat;
            });
      }, [products, searchQuery, selectedCategory]);

      useEffect(() => {
            if (editOrderData && products.length > 0) {
                  setIsEditingExisting(true);
                  setEditingOrderId(editOrderData.orderId);

                  const notePart = editOrderData.note || "";
                  if (notePart.includes(" | Cust: ")) {
                        setCustomerNote(notePart.split(" | Cust: ")[1]);
                  } else if (notePart.includes(" | Note: ")) {
                        setCustomerNote(notePart.split(" | Note: ")[1]);
                  }

                  const discountMatch = notePart.match(/\[(?:Discount|Dis): -\$(\d+(?:\.\d+)?)\]/);
                  if (discountMatch) {
                        setDiscountType("amount");
                        setDiscountValue(discountMatch[1]);
                  }

                  if (editOrderData.items && editOrderData.items.length > 0) {
                        const groupedMap = new Map();

                        editOrderData.items.forEach((i) => {
                              const pId = Number(i.product?.id || i.productId);
                              const matchedProduct = products.find((p) => Number(p.id) === pId) || i.product || {};
                              const itemPrice = matchedProduct.price || i.price || i.product?.price || 0;
                              const availableQty = typeof matchedProduct.quantity === "number" ? matchedProduct.quantity : 0;
                              const itemQty = i.qty || i.quantity || 1;

                              if (!groupedMap.has(pId)) {
                                    groupedMap.set(pId, {
                                          product: {
                                                ...i.product,
                                                ...matchedProduct,
                                                id: pId,
                                                price: itemPrice,
                                                quantity: availableQty
                                          },
                                          qty: 0,
                                          price: itemPrice,
                                          originalQty: 0
                                    });
                              }

                              const entry = groupedMap.get(pId);
                              entry.qty += itemQty;
                              entry.originalQty += itemQty;
                        });

                        setCart(Array.from(groupedMap.values()));
                  }
            }
      }, [editOrderData, products]);

      const cancelEditMode = () => {
            setIsEditingExisting(false);
            setEditingOrderId(null);
            setCart([]);
            setCustomerNote("");
            setDiscountValue("");
            navigate("/stock-out", { replace: true, state: {} });
      };

      const addToCart = (product) => {
            setMessage(null);
            setErrorMsg("");

            const existingIndex = cart.findIndex((item) => Number(item.product.id) === Number(product.id));

            if (existingIndex > -1) {
                  const currentQty = cart[existingIndex].qty;
                  const maxAllowed = product.quantity + (cart[existingIndex].originalQty || 0);
                  if (currentQty + 1 > maxAllowed) {
                        setErrorMsg(`Cannot add more "${product.name}". Max available stock is ${maxAllowed}.`);
                        return;
                  }
                  const newCart = [...cart];
                  newCart[existingIndex].qty += 1;
                  setCart(newCart);
            } else {
                  if (product.quantity < 1) {
                        setErrorMsg(`"${product.name}" is currently out of stock.`);
                        return;
                  }
                  setCart([...cart, { product, qty: 1, price: product.price, originalQty: 0 }]);
            }
      };

      const updateCartQty = (productId, delta) => {
            setMessage(null);
            setErrorMsg("");

            setCart((prevCart) =>
                  prevCart
                        .map((item) => {
                              if (Number(item.product.id) === Number(productId)) {
                                    const newQty = item.qty + delta;
                                    const maxAllowed = (item.product.quantity || 0) + (item.originalQty || 0);
                                    if (newQty > maxAllowed) {
                                          setErrorMsg(`Stock limit reached for "${item.product.name}".`);
                                          return item;
                                    }
                                    return newQty > 0 ? { ...item, qty: newQty } : null;
                              }
                              return item;
                        })
                        .filter(Boolean)
            );
      };

      const removeFromCart = (productId) => {
            setMessage(null);
            setErrorMsg("");
            const itemToRemove = cart.find((item) => Number(item.product.id) === Number(productId));
            if (itemToRemove) {
                  toast.info(`Removed "${itemToRemove.product.name}" from cart`);
            }
            setCart((prevCart) => prevCart.filter((item) => Number(item.product.id) !== Number(productId)));
      };

      // calculations
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

      let discountAmount = 0;
      const numDiscount = parseFloat(discountValue) || 0;

      if (discountType === "percent") {
            discountAmount = (subtotal * Math.min(100, Math.max(0, numDiscount))) / 100;
      } else {
            discountAmount = Math.min(subtotal, Math.max(0, numDiscount));
      }

      const grandTotal = Math.max(0, subtotal - discountAmount);

      const handleCheckout = async (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                  setErrorMsg("Your purchase cart is empty. Please add items to calculate.");
                  return;
            }

            setIsSubmitting(true);
            setMessage(null);
            setErrorMsg("");

            try {
                  const orderId = isEditingExisting ? editingOrderId : `HUY-${Math.floor(1000 + Math.random() * 9000)}`;
                  const discountDesc = discountAmount > 0 ? ` [Discount: -$${discountAmount.toFixed(2)}]` : "";
                  const customerInfo = customerNote ? ` | Note: ${customerNote}` : " | Note: Direct Sale";
                  const totalCartUnits = cart.reduce((sum, item) => sum + item.qty, 0);
                  const noteText = `${isEditingExisting ? "[Edited] " : ""}[Order #${orderId}] ${totalCartUnits} units total${discountDesc}${customerInfo}`;

                  if (isEditingExisting) {
                        await stockApi.updateOrder({
                              orderId,
                              cart,
                              note: noteText
                        });
                  } else {
                        for (const item of cart) {
                              await stockApi.stockOut({
                                    productId: item.product.id,
                                    quantity: item.qty,
                                    note: noteText
                              });
                        }
                  }

                  const successText = `${isEditingExisting ? `Order #${orderId} updated` : `Order #${orderId} completed`} successfully! Total (${totalCartUnits} units): $${grandTotal.toFixed(
                        2
                  )}${discountAmount > 0 ? ` (Saved $${discountAmount.toFixed(2)})` : ""}`;
                  setMessage(successText);
                  toast.success(successText);

                  setCart([]);
                  setDiscountValue("");
                  setCustomerNote("");
                  if (isEditingExisting) {
                        cancelEditMode();
                  }
                  fetchData();
            } catch (err) {
                  const errText = err.response?.data?.message || err.message || "Failed to process sale purchase.";
                  setErrorMsg(errText);
                  toast.error(errText);
            } finally {
                  setIsSubmitting(false);
            }
      };

      if (loading) return <Loading message="កំពុងទាញយកបញ្ជីទំនិញ..." />;

      return (
            <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-600/10">
                                    <ShoppingCart className="w-6 h-6" />
                              </div>
                              <div>
                                    <h1 className="text-2xl font-bold text-slate-100">
                                          {isEditingExisting ? `កែប្រែការបញ្ជាទិញ #${editingOrderId}` : "ការគណនាការលក់ទំនិញ (POS)"}
                                    </h1>
                                    <p className="text-sm text-slate-400">
                                          {isEditingExisting
                                                ? "ប្តូរមុខទំនិញ កែប្រែចំនួន ឬលុបទំនិញចេញពីការបញ្ជាទិញនេះ"
                                                : "គណនាការបញ្ជាទិញរបស់អតិថិជន បញ្ចុះតម្លៃ និងកាត់ស្តុក"}
                                    </p>
                              </div>
                        </div>

                        {isEditingExisting && (
                              <button
                                    onClick={cancelEditMode}
                                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                              >
                                    <XCircle className="w-4 h-4 text-rose-400" /> បោះបង់ការកែប្រែ
                              </button>
                        )}
                  </div>

                  {isEditingExisting && (
                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs flex items-center gap-2">
                              <Edit3 className="w-4 h-4 shrink-0" />
                              <span>អ្នកកំពុងកែប្រែការបញ្ជាទិញដែលមានស្រាប់របស់អតិថិជន។</span>
                        </div>
                  )}

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
                                    <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                                          <Calculator className="w-5 h-5 text-indigo-400" /> ជ្រើសរើសទំនិញដើម្បីទិញ
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
                                                className="w-full pl-9 pr-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                    </div>

                                    <div className="sm:w-48 relative">
                                          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                          <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full pl-9 pr-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
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

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1">
                                    {filteredProducts.length === 0 ? (
                                          <div className="col-span-2 p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
                                                មិនមានទំនិញដែលត្រូវគ្នាទេ។
                                          </div>
                                    ) : (
                                          filteredProducts.map((p) => (
                                                <div
                                                      key={p.id}
                                                      className={`p-4 rounded-2xl bg-slate-900/80 border transition-all cursor-pointer flex flex-col justify-between ${p.quantity < 1
                                                            ? "opacity-50 border-slate-800 cursor-not-allowed"
                                                            : "border-slate-800 hover:border-emerald-500/40 hover:shadow-lg shadow-slate-950"
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
                                                      <div className="mt-4 flex items-end justify-between pt-3 border-t border-slate-800/80">
                                                            <div className="flex flex-col gap-1">
                                                                  <span className="text-lg font-extrabold text-emerald-400">${p.price.toFixed(2)}</span>
                                                                  <span className="text-xs font-medium text-slate-400">
                                                                        ស្តុក៖ <span className="text-slate-200 font-bold">{p.quantity}</span>
                                                                  </span>
                                                            </div>
                                                            <div onClick={() => addToCart(p)} className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors">
                                                                  <Plus className="w-4 h-4" />
                                                            </div>
                                                      </div>
                                                </div>
                                          ))
                                    )}
                              </div>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full space-y-6">
                              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                          <Receipt className="w-5 h-5 text-indigo-400" />
                                          <h3 className="text-base font-bold text-slate-100">សរុបវិក្កយបត្រ</h3>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-600/20 text-indigo-300 font-bold">
                                          {cart.reduce((sum, item) => sum + item.qty, 0)} units
                                    </span>
                              </div>

                              {cart.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                                          <ShoppingCart className="w-10 h-10 mb-2 opacity-40" />
                                          <p className="text-sm font-medium">កន្ត្រកទំនិញទទេ</p>
                                    </div>
                              ) : (
                                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[260px] pr-1">
                                          {cart.map((item) => (
                                                <div
                                                      key={item.product.id}
                                                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between"
                                                >
                                                      <div className="min-w-0 pr-2">
                                                            <p className="text-sm font-bold text-slate-200 truncate">{item.product.name}</p>
                                                            <p className="text-xs text-slate-400">
                                                                  ${item.price.toFixed(2)} × {item.qty} ={" "}
                                                                  <span className="text-emerald-400 font-bold">${(item.price * item.qty).toFixed(2)}</span>
                                                            </p>
                                                      </div>
                                                      <div className="flex items-center gap-1.5 shrink-0">
                                                            <button
                                                                  onClick={() => updateCartQty(item.product.id, -1)}
                                                                  className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded cursor-pointer"
                                                            >
                                                                  <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className="text-xs font-bold text-slate-200 w-5 text-center">{item.qty}</span>
                                                            <button
                                                                  onClick={() => updateCartQty(item.product.id, 1)}
                                                                  className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded cursor-pointer"
                                                            >
                                                                  <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                  onClick={() => removeFromCart(item.product.id)}
                                                                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded ml-1 cursor-pointer"
                                                            >
                                                                  <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              )}

                              <div className="pt-4 border-t border-slate-800 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                          <span className="text-slate-400 font-medium">សរុបរង</span>
                                          {discountAmount > 0 ? (
                                                <span className="line-through text-slate-500 font-semibold">${subtotal.toFixed(2)}</span>
                                          ) : (
                                                <span className="text-slate-200 font-bold">${subtotal.toFixed(2)}</span>
                                          )}
                                    </div>

                                    <div className="pt-2 pb-1 space-y-2">
                                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                                <span className="flex items-center gap-1">
                                                      <Tag className="w-3.5 h-3.5 text-indigo-400" /> បញ្ចុះតម្លៃ
                                                </span>
                                                <span className="text-indigo-400">{discountType === "percent" ? "បញ្ចុះ %" : "បញ្ចុះ $"}</span>
                                          </label>

                                          <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                      <input
                                                            type="number"
                                                            min="0"
                                                            step={discountType === "percent" ? "1" : "0.01"}
                                                            placeholder={discountType === "percent" ? "ឧ. 10" : "ឧ. 5.00"}
                                                            value={discountValue}
                                                            onChange={(e) => setDiscountValue(e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                      />
                                                </div>
                                                <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0">
                                                      <button
                                                            type="button"
                                                            onClick={() => setDiscountType("percent")}
                                                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${discountType === "percent"
                                                                  ? "bg-indigo-600 text-white"
                                                                  : "text-slate-400 hover:text-slate-200"
                                                                  }`}
                                                      >
                                                            <Percent className="w-3.5 h-3.5" />
                                                      </button>
                                                      <button
                                                            type="button"
                                                            onClick={() => setDiscountType("amount")}
                                                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${discountType === "amount"
                                                                  ? "bg-indigo-600 text-white"
                                                                  : "text-slate-400 hover:text-slate-200"
                                                                  }`}
                                                      >
                                                            $
                                                      </button>
                                                </div>
                                          </div>

                                          {discountAmount > 0 && (
                                                <div className="flex justify-between items-center text-xs text-rose-400 font-medium">
                                                      <span>ចំណេញពីការបញ្ចុះតម្លៃ៖</span>
                                                      <span>-${discountAmount.toFixed(2)}</span>
                                                </div>
                                          )}
                                    </div>

                                    <div className="pt-2 border-t border-slate-800/60 space-y-1">
                                          {discountAmount > 0 && (
                                                <div className="flex justify-between items-center text-sm text-slate-500">
                                                      <span>តម្លៃដើម៖</span>
                                                      <span className="line-through">${subtotal.toFixed(2)}</span>
                                                </div>
                                          )}
                                          <div className="flex justify-between items-center text-lg font-extrabold text-slate-100">
                                                <span>សរុបចុងក្រោយ៖</span>
                                                <span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
                                          </div>
                                    </div>

                                    <div>
                                          <input
                                                type="text"
                                                placeholder="ឈ្មោះអតិថិជន ឬកំណត់ចំណាំ (ជម្រើស)"
                                                value={customerNote}
                                                onChange={(e) => setCustomerNote(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                    </div>

                                    <button
                                          onClick={handleCheckout}
                                          disabled={isSubmitting || cart.length === 0}
                                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                          {isSubmitting ? (
                                                <>
                                                      <Loader2 className="w-4 h-4 animate-spin" /> កំពុងដំណើរការការបញ្ជាទិញ...
                                                </>
                                          ) : (
                                                <>
                                                      <CheckCircle2 className="w-4 h-4" />{" "}
                                                      {isEditingExisting
                                                            ? `រក្សាទុកការកែប្រែ #${editingOrderId} ($${grandTotal.toFixed(2)})`
                                                            : `បញ្ចប់ការលក់ ($${grandTotal.toFixed(2)})`}
                                                </>
                                          )}
                                    </button>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default StockOut;
