import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { stockApi, productApi } from "../services/apiModules";
import { useToast } from "../context/ToastContext";
import Modal from "../components/Modal";
import { Loading, EmptyState } from "../components/UIStates";
import {
      Search,
      Filter,
      ArrowDownLeft,
      ArrowUpRight,
      RefreshCw,
      Calendar,
      Eye,
      Edit3,
      ShoppingBag,
      Trash2
} from "lucide-react";

const StockHistory = () => {
      const navigate = useNavigate();
      const toast = useToast();
      const [rawHistory, setRawHistory] = useState([]);
      const [productsMap, setProductsMap] = useState(new Map());
      const [loading, setLoading] = useState(true);
      const [search, setSearch] = useState("");
      const [type, setType] = useState("");

      // Modal State
      const [selectedGroup, setSelectedGroup] = useState(null);
      const [deleteTarget, setDeleteTarget] = useState(null);
      const [isDeleting, setIsDeleting] = useState(false);

      const fetchHistory = async () => {
            setLoading(true);
            try {
                  const params = {};
                  if (search) params.search = search;
                  if (type) params.type = type;

                  const [historyRes, prodRes] = await Promise.all([
                        stockApi.getHistory(params),
                        productApi.getAll()
                  ]);

                  if (historyRes.success) setRawHistory(historyRes.data);
                  if (prodRes.success) {
                        const pMap = new Map();
                        prodRes.data.forEach((p) => pMap.set(p.id, p));
                        setProductsMap(pMap);
                  }
            } catch (err) {
                  console.error("Error loading stock history:", err);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchHistory();
      }, [search, type]);

      const groupedTransactions = React.useMemo(() => {
            const groups = [];
            const orderMap = new Map();

            rawHistory.forEach((item) => {
                  const orderMatch = item.note?.match(/\[Order #(HUY-\d+)\]/);
                  const orderId = orderMatch ? orderMatch[1] : null;

                  if (orderId) {
                        if (!orderMap.has(orderId)) {
                              const groupObj = {
                                    id: orderId,
                                    isGroup: true,
                                    orderId: orderId,
                                    createdAt: item.createdAt,
                                    type: item.type,
                                    user: item.user,
                                    note: item.note,
                                    items: [],
                                    totalQuantity: 0
                              };
                              orderMap.set(orderId, groupObj);
                              groups.push(groupObj);
                        }
                        const group = orderMap.get(orderId);
                        group.items.push(item);
                        group.totalQuantity += item.quantity;
                  } else {
                        groups.push({
                              id: `single-${item.id}`,
                              isGroup: false,
                              createdAt: item.createdAt,
                              type: item.type,
                              user: item.user,
                              note: item.note,
                              items: [item],
                              totalQuantity: item.quantity,
                              singleProduct: item.product
                        });
                  }
            });

            return groups;
      }, [rawHistory]);

      const handleDeleteOrder = (group) => {
            setDeleteTarget(group);
      };

      const confirmDeleteOrder = async () => {
            if (!deleteTarget) return;
            setIsDeleting(true);
            try {
                  await stockApi.deleteOrder({
                        orderId: deleteTarget.isGroup ? deleteTarget.orderId : undefined,
                        movementId: !deleteTarget.isGroup ? deleteTarget.items[0]?.id : undefined
                  });
                  const deletedName = deleteTarget.isGroup ? `Order #${deleteTarget.orderId}` : "Transaction";
                  setSelectedGroup(null);
                  setDeleteTarget(null);
                  toast.success(`${deletedName} deleted and stock quantities restored!`);
                  fetchHistory();
            } catch (err) {
                  const errText = err.response?.data?.message || err.message || "Failed to delete transaction.";
                  toast.error(errText);
            } finally {
                  setIsDeleting(false);
            }
      };

      const handleEditOrderInPOS = (group) => {
            setSelectedGroup(null);
            navigate("/stock-out", {
                  state: {
                        editOrder: {
                              orderId: group.orderId,
                              items: group.items.map((i) => ({
                                    product: i.product,
                                    qty: i.quantity,
                                    price: i.product?.price || 0,
                                    movementId: i.id
                              })),
                              note: group.note
                        }
                  }
            });
      };

      const getTypeBadge = (movementType) => {
            switch (movementType) {
                  case "IN":
                        return (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <ArrowDownLeft className="w-3.5 h-3.5" /> IN
                              </span>
                        );
                  case "OUT":
                        return (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> OUT
                              </span>
                        );
                  case "ADJUSTMENT":
                        return (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <RefreshCw className="w-3.5 h-3.5" /> ADJUSTMENT
                              </span>
                        );
                  default:
                        return null;
            }
      };

      return (
            <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                              <h1 className="text-2xl font-bold text-slate-100">ប្រវត្តិស្តុក និងការបញ្ជាទិញរបស់អតិថិជន</h1>
                              <p className="text-sm text-slate-400">ប្រតិបត្តិការបញ្ជាទិញសរុបតាមការទិញរបស់អតិថិជន</p>
                        </div>
                  </div>

                  {/* search */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input
                                    type="text"
                                    placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ, ឈ្មោះទំនិញ, SKU ឬអតិថិជន..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                        </div>

                        <div className="sm:w-56 relative">
                              <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                              <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                              >
                                    <option value="">គ្រប់ប្រភេទចលនាស្តុក</option>
                                    <option value="IN">នាំចូលស្តុក (IN)</option>
                                    <option value="OUT">ការលក់ជូនអតិថិជន (OUT)</option>
                                    <option value="ADJUSTMENT">ការកែតម្រូវស្តុក (ADJUSTMENT)</option>
                              </select>
                        </div>
                  </div>

                  {loading ? (
                        <Loading message="កំពុងទាញយកប្រវត្តិការបញ្ជាទិញ..." />
                  ) : groupedTransactions.length === 0 ? (
                        <EmptyState
                              title="មិនទាន់មានប្រវត្តិទេ"
                              description="ការបញ្ជាទិញរបស់អតិថិជន និងចលនាស្តុកនឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។"
                        />
                  ) : (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                              <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-300">
                                          <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                                <tr>
                                                      <th className="py-3.5 px-4">កាលបរិច្ឆេទ & ម៉ោង</th>
                                                      <th className="py-3.5 px-4">ប្រតិបត្តិការ / ការបញ្ជាទិញ</th>
                                                      <th className="py-3.5 px-4">ប្រភេទ</th>
                                                      <th className="py-3.5 px-4 text-center">សរុបមុខទំនិញ / ចំនួន</th>
                                                      <th className="py-3.5 px-4">ព័ត៌មានលម្អិត / កំណត់ចំណាំ</th>
                                                      <th className="py-3.5 px-4 text-center">សកម្មភាព</th>
                                                </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-800/60">
                                                {groupedTransactions.map((group) => (
                                                      <tr key={group.id} className="hover:bg-slate-800/40 transition-colors">
                                                            <td className="py-4 px-4 text-slate-300 text-xs font-medium whitespace-nowrap">
                                                                  <div className="flex items-center gap-1.5">
                                                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                                        <span>
                                                                              {new Date(group.createdAt).toLocaleDateString()} {new Date(group.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                  </div>
                                                            </td>

                                                            <td className="py-4 px-4 font-bold text-slate-100">
                                                                  {group.isGroup ? (
                                                                        <div className="flex items-center gap-2">
                                                                              <ShoppingBag className="w-4 h-4 text-indigo-400" />
                                                                              <span className="text-indigo-400">#{group.orderId}</span>
                                                                        </div>
                                                                  ) : (
                                                                        <div>
                                                                              <span>{group.singleProduct?.name}</span>
                                                                              <span className="block text-xs text-indigo-400 font-normal">
                                                                                    {group.singleProduct?.sku}
                                                                              </span>
                                                                        </div>
                                                                  )}
                                                            </td>

                                                            <td className="py-4 px-4">{getTypeBadge(group.type)}</td>

                                                            <td className="py-4 px-4 text-center text-slate-100">
                                                                  <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                                                                        {`${group.totalQuantity} units`}
                                                                  </span>
                                                            </td>

                                                            <td className="py-4 px-4 text-xs text-slate-300 max-w-xs">
                                                                  {(() => {
                                                                        const rawNote = group.note || "";
                                                                        const discountMatch = rawNote.match(/\[Discount: -\$(\d+(?:\.\d+)?)\]/);
                                                                        const discountVal = discountMatch ? discountMatch[1] : null;

                                                                        let custNote = "";
                                                                        if (rawNote.includes(" | Cust: ")) {
                                                                              custNote = rawNote.split(" | Cust: ")[1];
                                                                        } else if (!rawNote.startsWith("[Order #") && !rawNote.startsWith("[EDITED]")) {
                                                                              custNote = rawNote;
                                                                        }

                                                                        const originalSubtotal = group.items.reduce((sum, item) => {
                                                                              const liveProduct = productsMap.get(item.product?.id) || item.product;
                                                                              const price = liveProduct?.price || 0;
                                                                              return sum + price * item.quantity;
                                                                        }, 0);
                                                                        const discountAmount = discountVal ? parseFloat(discountVal) : 0;
                                                                        const grandTotal = Math.max(0, originalSubtotal - discountAmount);

                                                                        return (
                                                                              <div className="space-y-1">
                                                                                    <div className="flex items-center gap-2">
                                                                                          <span className="font-extrabold text-emerald-400 text-sm">
                                                                                                ${grandTotal.toFixed(2)}
                                                                                          </span>
                                                                                          {discountVal && (
                                                                                                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md font-bold text-[10px]">
                                                                                                      បញ្ចុះតម្លៃ៖ -${discountVal}
                                                                                                </span>
                                                                                          )}
                                                                                    </div>
                                                                                    <p className="text-slate-400 truncate">កំណត់ចំណាំ៖ {custNote || "ការលក់ផ្ទាល់"}</p>
                                                                              </div>
                                                                        );
                                                                  })()}
                                                            </td>

                                                            <td className="py-4 px-4 text-center">
                                                                  <div className="flex items-center justify-center gap-2">
                                                                        <button
                                                                              onClick={() => setSelectedGroup(group)}
                                                                              className="p-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-500 hover:text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-indigo-500/30 cursor-pointer"
                                                                        >
                                                                              <Eye className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                              onClick={() => handleDeleteOrder(group)}
                                                                              title="លុបការបញ្ជាទិញ"
                                                                              className="p-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white font-medium rounded-xl text-xs transition-colors border border-rose-500/30 flex items-center justify-center cursor-pointer"
                                                                        >
                                                                              <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                  </div>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>
                        </div>
                  )}

                  {/* view order */}
                  <Modal
                        isOpen={!!selectedGroup}
                        onClose={() => setSelectedGroup(null)}
                        title={selectedGroup?.isGroup ? `ព័ត៌មានលម្អិតវិក្កយបត្រ - #${selectedGroup.orderId}` : "ព័ត៌មានលម្អិតប្រតិបត្តិការ"}
                  >
                        {selectedGroup && (() => {
                              const originalSubtotal = selectedGroup.items.reduce((sum, item) => {
                                    const liveProduct = productsMap.get(item.product?.id) || item.product;
                                    const price = liveProduct?.price || 0;
                                    return sum + price * item.quantity;
                              }, 0);

                              const discountMatch = selectedGroup.note?.match(/\[Discount: -\$(\d+(?:\.\d+)?)\]/);
                              const discountAmount = discountMatch ? parseFloat(discountMatch[1]) : 0;
                              const finalGrandTotal = Math.max(0, originalSubtotal - discountAmount);

                              return (
                                    <div className="space-y-5">
                                          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1 text-slate-300">
                                                <p>
                                                      <span className="text-slate-500 font-semibold">កាលបរិច្ឆេទ៖</span>{" "}
                                                      {new Date(selectedGroup.createdAt).toLocaleString()}
                                                </p>
                                                <p>
                                                      <span className="text-slate-500 font-semibold">កំណត់ចំណាំ / អតិថិជន៖</span>{" "}
                                                      <span className="text-slate-200">{selectedGroup.note || "N/A"}</span>
                                                </p>
                                          </div>

                                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                ទំនិញដែលបានទិញក្នុងការបញ្ជាទិញនេះ ({selectedGroup.items.reduce((sum, item) => sum + item.quantity, 0)})
                                          </h4>

                                          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                                                {selectedGroup.items.map((item) => {
                                                      const liveProduct = productsMap.get(item.product?.id) || item.product;
                                                      const unitPrice = liveProduct?.price || 0;
                                                      const itemTotal = unitPrice * item.quantity;
                                                      return (
                                                            <div
                                                                  key={item.id}
                                                                  className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
                                                            >
                                                                  <div>
                                                                        <p className="text-sm font-bold text-slate-100">{item.product?.name}</p>
                                                                        <p className="text-xs text-indigo-400 font-mono">
                                                                              SKU: {item.product?.sku} | ${unitPrice.toFixed(2)} × {item.quantity}
                                                                        </p>
                                                                  </div>
                                                                  <span className="text-sm font-extrabold text-emerald-400">
                                                                        ${itemTotal.toFixed(2)}
                                                                  </span>
                                                            </div>
                                                      );
                                                })}
                                          </div>

                                          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2 text-sm">
                                                {discountAmount > 0 ? (
                                                      <>
                                                            <div className="flex justify-between items-center text-slate-400">
                                                                  <span>សរុបរងដើម៖</span>
                                                                  <span className="line-through text-slate-500 font-semibold">${originalSubtotal.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-rose-400">
                                                                  <span>បានបញ្ចុះតម្លៃ៖</span>
                                                                  <span>-${discountAmount.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-base font-extrabold text-slate-100 pt-2 border-t border-slate-800">
                                                                  <span>សរុបចុងក្រោយ៖</span>
                                                                  <span className="text-emerald-400 text-lg">${finalGrandTotal.toFixed(2)}</span>
                                                            </div>
                                                      </>
                                                ) : (
                                                      <div className="flex justify-between items-center text-base font-extrabold text-slate-100">
                                                            <span>សរុបចុងក្រោយ៖</span>
                                                            <span className="text-emerald-400 text-lg">${originalSubtotal.toFixed(2)}</span>
                                                      </div>
                                                )}
                                          </div>

                                          <div className="pt-2 flex justify-between items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                      {selectedGroup.isGroup && (
                                                            <button
                                                                  onClick={() => handleEditOrderInPOS(selectedGroup)}
                                                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                                                            >
                                                                  <Edit3 className="w-4 h-4" /> កែប្រែវិក្កយបត្រក្នុង POS
                                                            </button>
                                                      )}
                                                      <button
                                                            onClick={() => handleDeleteOrder(selectedGroup)}
                                                            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-500 hover:text-white font-medium rounded-xl text-xs flex items-center gap-1.5 border border-rose-500/30 transition-colors cursor-pointer"
                                                      >
                                                            <Trash2 className="w-4 h-4" /> លុបការបញ្ជាទិញ
                                                      </button>
                                                </div>
                                                <button
                                                      onClick={() => setSelectedGroup(null)}
                                                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm cursor-pointer"
                                                >
                                                      បិទ
                                                </button>
                                          </div>
                                    </div>
                              );
                        })()}
                  </Modal>

                  {/* confirm deleted */}
                  <Modal
                        isOpen={!!deleteTarget}
                        onClose={() => !isDeleting && setDeleteTarget(null)}
                        title="បញ្ជាក់ការលុបវិក្កយបត្រ"
                  >
                        {deleteTarget && (
                              <div className="space-y-4">
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm flex items-start gap-3">
                                          <Trash2 className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                          <div>
                                                <p className="font-bold text-rose-600">
                                                      {deleteTarget.isGroup
                                                            ? `តើអ្នកប្រាកដជាចង់លុបវិក្កយបត្រ #${deleteTarget.orderId}?`
                                                            : "តើអ្នកប្រាកដជាចង់លុបប្រតិបត្តិការនេះ?"}
                                                </p>
                                                <p className="text-xs text-rose-600/80 mt-1">
                                                      សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។ ស្តុកទំនិញចំនួន ({deleteTarget.totalQuantity} units) នឹងត្រូវបានស្តារឡើងវិញដោយស្វ័យប្រវត្តិ។
                                                </p>
                                          </div>
                                    </div>

                                    <div className="pt-2 flex justify-end gap-3">
                                          <button
                                                disabled={isDeleting}
                                                onClick={() => setDeleteTarget(null)}
                                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                                          >
                                                បោះបង់
                                          </button>
                                          <button
                                                disabled={isDeleting}
                                                onClick={confirmDeleteOrder}
                                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-600/20 cursor-pointer"
                                          >
                                                {isDeleting ? "កំពុងលុប..." : "យល់ព្រម, លុបការបញ្ជាទិញ"}
                                          </button>
                                    </div>
                              </div>
                        )}
                  </Modal>
            </div>
      );
};

export default StockHistory;
