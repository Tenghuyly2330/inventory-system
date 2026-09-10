import React, { useState, useEffect } from "react";
import { supplierApi } from "../services/apiModules";
import Modal from "../components/Modal";
import { Loading, EmptyState } from "../components/UIStates";
import { Truck, Plus, Edit2, Trash2, Phone, Mail, MapPin, AlertCircle, Loader2 } from "lucide-react";

const Suppliers = () => {
      const [suppliers, setSuppliers] = useState([]);
      const [loading, setLoading] = useState(true);

      // Modal State
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingSupplier, setEditingSupplier] = useState(null);
      const [formData, setFormData] = useState({
            name: "",
            phone: "",
            email: "",
            address: ""
      });
      const [formError, setFormError] = useState("");
      const [isSubmitting, setIsSubmitting] = useState(false);

      // Delete State
      const [deleteId, setDeleteId] = useState(null);

      const fetchSuppliers = async () => {
            setLoading(true);
            try {
                  const res = await supplierApi.getAll();
                  if (res.success) setSuppliers(res.data);
            } catch (err) {
                  console.error("Error fetching suppliers:", err);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchSuppliers();
      }, []);

      const handleOpenModal = (supplier = null) => {
            setFormError("");
            if (supplier) {
                  setEditingSupplier(supplier);
                  setFormData({
                        name: supplier.name,
                        phone: supplier.phone || "",
                        email: supplier.email || "",
                        address: supplier.address || ""
                  });
            } else {
                  setEditingSupplier(null);
                  setFormData({
                        name: "",
                        phone: "",
                        email: "",
                        address: ""
                  });
            }
            setIsModalOpen(true);
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setFormError("");

            if (!formData.name.trim()) {
                  setFormError("Supplier name is required.");
                  return;
            }

            setIsSubmitting(true);
            try {
                  if (editingSupplier) {
                        await supplierApi.update(editingSupplier.id, formData);
                  } else {
                        await supplierApi.create(formData);
                  }
                  setIsModalOpen(false);
                  fetchSuppliers();
            } catch (err) {
                  setFormError(err.response?.data?.message || err.message || "Failed to save supplier.");
            } finally {
                  setIsSubmitting(false);
            }
      };

      const handleDelete = async (id) => {
            try {
                  await supplierApi.delete(id);
                  setDeleteId(null);
                  fetchSuppliers();
            } catch (err) {
                  alert(err.response?.data?.message || "Failed to delete supplier.");
                  setDeleteId(null);
            }
      };

      return (
            <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                              <h1 className="text-2xl font-bold text-slate-100">ការគ្រប់គ្រងអ្នកផ្គត់ផ្គង់</h1>
                              <p className="text-sm text-slate-400">គ្រប់គ្រងព័ត៌មានទំនាក់ទំនងអ្នកផ្គត់ផ្គង់ និងដៃគូផ្គត់ផ្គង់ទំនិញ</p>
                        </div>
                        <button
                              onClick={() => handleOpenModal()}
                              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                        >
                              <Plus className="w-4 h-4" /> បន្ថែមអ្នកផ្គត់ផ្គង់
                        </button>
                  </div>

                  {loading ? (
                        <Loading message="កំពុងទាញយកបញ្ជីអ្នកផ្គត់ផ្គង់..." />
                  ) : suppliers.length === 0 ? (
                        <EmptyState
                              title="មិនទាន់មានអ្នកផ្គត់ផ្គង់ទេ"
                              description="សូមចុះឈ្មោះអ្នកផ្គត់ផ្គង់ទំនិញសំខាន់ៗរបស់អ្នក។"
                              action={
                                    <button
                                          onClick={() => handleOpenModal()}
                                          className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm flex items-center gap-2 cursor-pointer"
                                    >
                                          <Plus className="w-4 h-4" /> បន្ថែមអ្នកផ្គត់ផ្គង់ដំបូង
                                    </button>
                              }
                        />
                  ) : (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                              <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-300">
                                          <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                                <tr>
                                                      <th className="py-3.5 px-6">ឈ្មោះអ្នកផ្គត់ផ្គង់</th>
                                                      <th className="py-3.5 px-6">លេខទូរស័ព្ទ</th>
                                                      <th className="py-3.5 px-6">អ៊ីមែល</th>
                                                      <th className="py-3.5 px-6">អាសយដ្ឋាន</th>
                                                      <th className="py-3.5 px-6 text-center">សកម្មភាព</th>
                                                </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-800/60">
                                                {suppliers.map((s) => (
                                                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                                                            <td className="py-4 px-6 font-semibold text-slate-100 flex items-center gap-2.5">
                                                                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                                                                        <Truck className="w-4 h-4" />
                                                                  </div>
                                                                  {s.name}
                                                            </td>
                                                            <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                                                                  {s.phone ? (
                                                                        <div className="flex items-center gap-1.5">
                                                                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                                                                              <span>{s.phone}</span>
                                                                        </div>
                                                                  ) : (
                                                                        "—"
                                                                  )}
                                                            </td>
                                                            <td className="py-4 px-6 text-slate-300 text-xs">
                                                                  {s.email ? (
                                                                        <div className="flex items-center gap-1.5">
                                                                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                                                                              <span>{s.email}</span>
                                                                        </div>
                                                                  ) : (
                                                                        "—"
                                                                  )}
                                                            </td>
                                                            <td className="py-4 px-6 text-slate-400 text-xs max-w-xs truncate">
                                                                  {s.address ? (
                                                                        <div className="flex items-center gap-1.5">
                                                                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                                              <span className="truncate">{s.address}</span>
                                                                        </div>
                                                                  ) : (
                                                                        "—"
                                                                  )}
                                                            </td>
                                                            <td className="py-4 px-6 text-center">
                                                                  <div className="flex items-center justify-center gap-2">
                                                                        <button
                                                                              onClick={() => handleOpenModal(s)}
                                                                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                                              title="កែប្រែ"
                                                                        >
                                                                              <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                              onClick={() => setDeleteId(s.id)}
                                                                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                                              title="លុប"
                                                                        >
                                                                              <Trash2 className="w-4 h-4" />
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

                  {/* Supplier Modal */}
                  <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={editingSupplier ? "កែប្រែអ្នកផ្គត់ផ្គង់" : "បន្ថែមអ្នកផ្គត់ផ្គង់"}
                  >
                        <form onSubmit={handleSubmit} className="space-y-4">
                              {formError && (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                                          <AlertCircle className="w-4 h-4 shrink-0" />
                                          <span>{formError}</span>
                                    </div>
                              )}

                              <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                          ឈ្មោះអ្នកផ្គត់ផ្គង់ *
                                    </label>
                                    <input
                                          type="text"
                                          required
                                          value={formData.name}
                                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                          placeholder="ឧ. ក្រុមហ៊ុន អេប៊ីស៊ី តិច"
                                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                    <div>
                                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                                លេខទូរស័ព្ទ
                                          </label>
                                          <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="012 345 678"
                                                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                    </div>

                                    <div>
                                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                                អាសយដ្ឋានអ៊ីមែល
                                          </label>
                                          <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="vendor@company.com"
                                                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                    </div>
                              </div>

                              <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                          អាសយដ្ឋាន
                                    </label>
                                    <textarea
                                          rows="3"
                                          value={formData.address}
                                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                          placeholder="អាសយដ្ឋានពេញលេញ..."
                                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                              </div>

                              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                                    <button
                                          type="button"
                                          onClick={() => setIsModalOpen(false)}
                                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm cursor-pointer"
                                    >
                                          បោះបង់
                                    </button>
                                    <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm flex items-center gap-2 cursor-pointer"
                                    >
                                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                          <span>{editingSupplier ? "រក្សាទុកការកែប្រែ" : "រក្សាទុក"}</span>
                                    </button>
                              </div>
                        </form>
                  </Modal>

                  {/* Delete Modal */}
                  <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="បញ្ជាក់ការលុបអ្នកផ្គត់ផ្គង់">
                        <div className="space-y-4">
                              <p className="text-sm text-slate-300">
                                    តើអ្នកប្រាកដជាចង់លុបអ្នកផ្គត់ផ្គង់នេះមែនទេ?
                              </p>
                              <div className="flex justify-end gap-3 pt-2">
                                    <button
                                          onClick={() => setDeleteId(null)}
                                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm cursor-pointer"
                                    >
                                          បោះបង់
                                    </button>
                                    <button
                                          onClick={() => handleDelete(deleteId)}
                                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl text-sm cursor-pointer"
                                    >
                                          លុប
                                    </button>
                              </div>
                        </div>
                  </Modal>
            </div>
      );
};

export default Suppliers;
