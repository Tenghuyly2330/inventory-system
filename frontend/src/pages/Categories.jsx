import React, { useState, useEffect } from "react";
import { categoryApi } from "../services/apiModules";
import Modal from "../components/Modal";
import { Loading, EmptyState } from "../components/UIStates";
import { FolderTree, Plus, Edit2, Trash2, AlertCircle, Loader2 } from "lucide-react";

const Categories = () => {
      const [categories, setCategories] = useState([]);
      const [loading, setLoading] = useState(true);

      // Modal State
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingCategory, setEditingCategory] = useState(null);
      const [name, setName] = useState("");
      const [description, setDescription] = useState("");
      const [formError, setFormError] = useState("");
      const [isSubmitting, setIsSubmitting] = useState(false);

      // Delete State
      const [deleteId, setDeleteId] = useState(null);

      const fetchCategories = async () => {
            setLoading(true);
            try {
                  const res = await categoryApi.getAll();
                  if (res.success) setCategories(res.data);
            } catch (err) {
                  console.error("Error fetching categories:", err);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchCategories();
      }, []);

      const handleOpenModal = (category = null) => {
            setFormError("");
            if (category) {
                  setEditingCategory(category);
                  setName(category.name);
                  setDescription(category.description || "");
            } else {
                  setEditingCategory(null);
                  setName("");
                  setDescription("");
            }
            setIsModalOpen(true);
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setFormError("");

            if (!name.trim()) {
                  setFormError("Category name is required.");
                  return;
            }

            setIsSubmitting(true);
            try {
                  if (editingCategory) {
                        await categoryApi.update(editingCategory.id, { name, description });
                  } else {
                        await categoryApi.create({ name, description });
                  }
                  setIsModalOpen(false);
                  fetchCategories();
            } catch (err) {
                  setFormError(err.response?.data?.message || err.message || "Failed to save category.");
            } finally {
                  setIsSubmitting(false);
            }
      };

      const handleDelete = async (id) => {
            try {
                  await categoryApi.delete(id);
                  setDeleteId(null);
                  fetchCategories();
            } catch (err) {
                  alert(err.response?.data?.message || "Failed to delete category.");
                  setDeleteId(null);
            }
      };

      return (
            <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                              <h1 className="text-2xl font-bold text-slate-100">ការគ្រប់គ្រងប្រភេទទំនិញ</h1>
                              <p className="text-sm text-slate-400">រៀបចំទំនិញតាមប្រភេទទំនិញឱ្យមានរបៀបរៀបរយ</p>
                        </div>
                        <button
                              onClick={() => handleOpenModal()}
                              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                        >
                              <Plus className="w-4 h-4" /> បន្ថែមប្រភេទទំនិញ
                        </button>
                  </div>

                  {loading ? (
                        <Loading message="កំពុងទាញយកទិន្នន័យប្រភេទទំនិញ..." />
                  ) : categories.length === 0 ? (
                        <EmptyState
                              title="មិនទាន់មានប្រភេទទំនិញទេ"
                              description="សូមបង្កើតប្រភេទទំនិញដំបូងដើម្បីបែងចែកទំនិញរបស់អ្នក។"
                              action={
                                    <button
                                          onClick={() => handleOpenModal()}
                                          className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                          <Plus className="w-4 h-4" /> បន្ថែមប្រភេទទំនិញដំបូង
                                    </button>
                              }
                        />
                  ) : (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                              <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-300">
                                          <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                                <tr>
                                                      <th className="py-3.5 px-6">ឈ្មោះប្រភេទទំនិញ</th>
                                                      <th className="py-3.5 px-6">ការពិពណ៌នា</th>
                                                      <th className="py-3.5 px-6 text-center">ចំនួនទំនិញ</th>
                                                      <th className="py-3.5 px-6">ថ្ងៃបង្កើត</th>
                                                      <th className="py-3.5 px-6 text-center">សកម្មភាព</th>
                                                </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-800/60">
                                                {categories.map((c) => (
                                                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                                                            <td className="py-4 px-6 font-semibold text-slate-100">{c.name}</td>
                                                            <td className="py-4 px-6 text-slate-400 max-w-sm truncate">{c.description || "—"}</td>
                                                            <td className="py-4 px-6 text-center">
                                                                  <span className="px-2.5 py-1 bg-slate-800 text-indigo-400 font-bold rounded-lg text-xs border border-slate-700">
                                                                        {c._count?.products || 0} ទំនិញ
                                                                  </span>
                                                            </td>
                                                            <td className="py-4 px-6 text-slate-400 text-xs">
                                                                  {new Date(c.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="py-4 px-6 text-center">
                                                                  <div className="flex items-center justify-center gap-2">
                                                                        <button
                                                                              onClick={() => handleOpenModal(c)}
                                                                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                                              title="កែប្រែ"
                                                                        >
                                                                              <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                              onClick={() => setDeleteId(c.id)}
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

                  {/* Category Modal */}
                  <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={editingCategory ? "កែប្រែប្រភេទទំនិញ" : "បន្ថែមប្រភេទទំនិញ"}
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
                                          ឈ្មោះប្រភេទទំនិញ *
                                    </label>
                                    <input
                                          type="text"
                                          required
                                          value={name}
                                          onChange={(e) => setName(e.target.value)}
                                          placeholder="ឧ. គ្រឿងអេឡិចត្រូនិក"
                                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                              </div>

                              <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                          ការពិពណ៌នា
                                    </label>
                                    <textarea
                                          rows="3"
                                          value={description}
                                          onChange={(e) => setDescription(e.target.value)}
                                          placeholder="ព័ត៌មានលម្អិត..."
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
                                          <span>{editingCategory ? "រក្សាទុកការកែប្រែ" : "រក្សាទុក"}</span>
                                    </button>
                              </div>
                        </form>
                  </Modal>

                  {/* Delete Confirmation Modal */}
                  <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="បញ្ជាក់ការលុបប្រភេទទំនិញ">
                        <div className="space-y-4">
                              <p className="text-sm text-slate-300">
                                    តើអ្នកប្រាកដជាចង់លុបប្រភេទទំនិញនេះមែនទេ? ចំណាំ៖ ប្រភេទទំនិញដែលមានទំនិញសកម្មមិនអាចលុបបានទេ រហូតដល់ទំនិញទាំងនោះត្រូវបានផ្លាស់ប្តូរ ឬលុបចេញ។
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

export default Categories;
