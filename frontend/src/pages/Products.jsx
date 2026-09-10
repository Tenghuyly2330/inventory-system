import React, { useState, useEffect } from "react";
import { productApi, categoryApi, uploadApi } from "../services/apiModules";
import Modal from "../components/Modal";
import { Loading, EmptyState } from "../components/UIStates";
import {
      Package,
      Plus,
      Search,
      Filter,
      Edit2,
      Trash2,
      AlertCircle,
      TrendingDown,
      CheckCircle,
      XCircle,
      Loader2,
      RefreshCw,
      Upload,
      Link,
      Image as ImageIcon
} from "lucide-react";

const generateSKU = () => {
      const digits = Math.floor(100000 + Math.random() * 900000);
      return `LTH-${digits}`;
};

const Products = () => {
      const [products, setProducts] = useState([]);
      const [categories, setCategories] = useState([]);
      const [loading, setLoading] = useState(true);
      const [search, setSearch] = useState("");
      const [selectedCategory, setSelectedCategory] = useState("");

      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingProduct, setEditingProduct] = useState(null);
      const [imageSource, setImageSource] = useState("file"); // "file" or "url"
      const [uploadingImage, setUploadingImage] = useState(false);
      const [formData, setFormData] = useState({
            name: "",
            sku: "",
            categoryId: "",
            description: "",
            price: "",
            quantity: "0",
            minimumStock: "5",
            imageUrl: ""
      });
      const [formError, setFormError] = useState("");
      const [isSubmitting, setIsSubmitting] = useState(false);

      const [deleteId, setDeleteId] = useState(null);

      const fetchProductsData = async () => {
            setLoading(true);
            try {
                  const params = {};
                  if (search) params.search = search;
                  if (selectedCategory) params.categoryId = selectedCategory;

                  const [prodRes, catRes] = await Promise.all([
                        productApi.getAll(params),
                        categoryApi.getAll()
                  ]);

                  if (prodRes.success) setProducts(prodRes.data);
                  if (catRes.success) setCategories(catRes.data);
            } catch (err) {
                  console.error("Error loading products:", err);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchProductsData();
      }, [search, selectedCategory]);

      const handleOpenModal = (product = null) => {
            setFormError("");
            setImageSource("file");
            if (product) {
                  setEditingProduct(product);
                  setFormData({
                        name: product.name,
                        sku: product.sku,
                        categoryId: product.categoryId.toString(),
                        description: product.description || "",
                        price: product.price.toString(),
                        quantity: product.quantity.toString(),
                        minimumStock: product.minimumStock.toString(),
                        imageUrl: product.imageUrl || ""
                  });
                  if (product.imageUrl) setImageSource("url");
            } else {
                  setEditingProduct(null);
                  setFormData({
                        name: "",
                        sku: generateSKU(),
                        categoryId: categories[0]?.id?.toString() || "",
                        description: "",
                        price: "",
                        quantity: "0",
                        minimumStock: "5",
                        imageUrl: ""
                  });
            }
            setIsModalOpen(true);
      };

      const handleImageFileUpload = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploadingImage(true);
            setFormError("");
            try {
                  const res = await uploadApi.uploadImage(file);
                  if (res.success && res.url) {
                        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
                  }
            } catch (err) {
                  setFormError(err.response?.data?.message || "Failed to upload image to Cloudinary.");
            } finally {
                  setUploadingImage(false);
            }
      };

      const handleFormSubmit = async (e) => {
            e.preventDefault();
            setFormError("");

            if (!formData.name || !formData.sku || !formData.categoryId || formData.price === "") {
                  setFormError("Please fill in all required fields (Name, SKU, Category, Price).");
                  return;
            }

            if (parseFloat(formData.price) < 0 || parseInt(formData.quantity) < 0 || parseInt(formData.minimumStock) < 0) {
                  setFormError("Price, Quantity, and Minimum Stock must be non-negative.");
                  return;
            }

            setIsSubmitting(true);
            try {
                  if (editingProduct) {
                        await productApi.update(editingProduct.id, formData);
                  } else {
                        await productApi.create(formData);
                  }
                  setIsModalOpen(false);
                  fetchProductsData();
            } catch (err) {
                  setFormError(err.response?.data?.message || err.message || "Failed to save product.");
            } finally {
                  setIsSubmitting(false);
            }
      };

      const handleDelete = async (id) => {
            try {
                  await productApi.delete(id);
                  setDeleteId(null);
                  fetchProductsData();
            } catch (err) {
                  alert(err.response?.data?.message || "Failed to delete product.");
            }
      };

      const getStatusBadge = (status) => {
            switch (status) {
                  case "In Stock":
                        return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle className="w-3 h-3" /> មានក្នុងស្តុក
                              </span>
                        );
                  case "Low Stock":
                        return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <TrendingDown className="w-3 h-3" /> ស្តុកតិច
                              </span>
                        );
                  case "Out of Stock":
                        return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    <XCircle className="w-3 h-3" /> អស់ពីស្តុក
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
                              <h1 className="text-2xl font-bold text-slate-100">បញ្ជីទំនិញទាំងអស់</h1>
                        </div>
                        <button
                              onClick={() => handleOpenModal()}
                              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                        >
                              <Plus className="w-4 h-4" /> បន្ថែមទំនិញថ្មី
                        </button>
                  </div>

                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input
                                    type="text"
                                    placeholder="ស្វែងរកតាមឈ្មោះទំនិញ, លេខកូដ SKU, ការពិពណ៌នា..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                        </div>

                        <div className="sm:w-64 relative">
                              <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                              <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
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

                  {loading ? (
                        <Loading message="កំពុងទាញយកទិន្នន័យទំនិញ..." />
                  ) : products.length === 0 ? (
                        <EmptyState
                              title="មិនមានទំនិញទេ"
                              description="សូមកែប្រែការស្វែងរក ឬបន្ថែមទំនិញដំបូងរបស់អ្នក។"
                              action={
                                    <button
                                          onClick={() => handleOpenModal()}
                                          className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                          <Plus className="w-4 h-4" /> បន្ថែមទំនិញដំបូង
                                    </button>
                              }
                        />
                  ) : (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                              <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-300">
                                          <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                                <tr>
                                                      <th className="py-3.5 px-4">ទំនិញ</th>
                                                      <th className="py-3.5 px-4">លេខកូដ SKU</th>
                                                      <th className="py-3.5 px-4">ប្រភេទទំនិញ</th>
                                                      <th className="py-3.5 px-4 text-right">តម្លៃ</th>
                                                      <th className="py-3.5 px-4 text-center">ចំនួនក្នុងស្តុក</th>
                                                      <th className="py-3.5 px-4 text-center">ស្តុកអប្បបរមា</th>
                                                      <th className="py-3.5 px-4">ស្ថានភាព</th>
                                                      <th className="py-3.5 px-4 text-center">សកម្មភាព</th>
                                                </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-800/60">
                                                {products.map((p) => (
                                                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                                                            <td className="py-3.5 px-4">
                                                                  <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                                                              {p.imageUrl ? (
                                                                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                                              ) : (
                                                                                    <Package className="w-5 h-5 text-slate-500" />
                                                                              )}
                                                                        </div>
                                                                        <div>
                                                                              <p className="font-medium text-slate-100">{p.name}</p>
                                                                              {p.description && <p className="text-xs text-slate-500 truncate max-w-xs">{p.description}</p>}
                                                                        </div>
                                                                  </div>
                                                            </td>
                                                            <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-semibold">{p.sku}</td>
                                                            <td className="py-3.5 px-4 text-slate-400">{p.category?.name || "គ្មានប្រភេទ"}</td>
                                                            <td className="py-3.5 px-4 text-right font-bold text-slate-200">${p.price.toFixed(2)}</td>
                                                            <td className="py-3.5 px-4 text-center font-extrabold text-slate-100">{p.quantity}</td>
                                                            <td className="py-3.5 px-4 text-center text-slate-500">{p.minimumStock}</td>
                                                            <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>
                                                            <td className="py-3.5 px-4 text-center">
                                                                  <div className="flex items-center justify-center gap-2">
                                                                        <button
                                                                              onClick={() => handleOpenModal(p)}
                                                                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                                              title="កែប្រែ"
                                                                        >
                                                                              <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                              onClick={() => setDeleteId(p.id)}
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

                  <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={editingProduct ? "កែប្រែទំនិញ" : "បន្ថែមទំនិញថ្មី"}
                  >
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                              {formError && (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                                          <AlertCircle className="w-4 h-4 shrink-0" />
                                          <span>{formError}</span>
                                    </div>
                              )}

                              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                          រូបភាពទំនិញ
                                    </label>
                                    <div className="flex items-center gap-4">
                                          <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                                                {uploadingImage ? (
                                                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                                                ) : formData.imageUrl ? (
                                                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                      <ImageIcon className="w-6 h-6 text-slate-600" />
                                                )}
                                          </div>

                                          <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2 text-xs">
                                                      <button
                                                            type="button"
                                                            onClick={() => setImageSource("file")}
                                                            className={`px-2.5 py-1 border border-indigo-600 cursor-pointer rounded-lg font-medium transition-colors flex items-center gap-1 ${imageSource === "file"
                                                                  ? "bg-indigo-600 text-white"
                                                                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
                                                                  }`}
                                                      >
                                                            <Upload className="w-3.5 h-3.5" /> ផ្ទុកឡើងរូបភាព
                                                      </button>
                                                      <button
                                                            type="button"
                                                            onClick={() => setImageSource("url")}
                                                            className={`px-2.5 py-1 border border-indigo-600 cursor-pointer rounded-lg font-medium transition-colors flex items-center gap-1 ${imageSource === "url"
                                                                  ? "bg-indigo-600 text-white"
                                                                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
                                                                  }`}
                                                      >
                                                            <Link className="w-3.5 h-3.5" /> តំណភ្ជាប់រូបភាព
                                                      </button>
                                                </div>

                                                {imageSource === "file" ? (
                                                      <div className="relative">
                                                            <input
                                                                  type="file"
                                                                  accept="image/*"
                                                                  onChange={handleImageFileUpload}
                                                                  disabled={uploadingImage}
                                                                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-400 hover:file:bg-slate-700 cursor-pointer"
                                                            />
                                                      </div>
                                                ) : (
                                                      <input
                                                            type="url"
                                                            value={formData.imageUrl}
                                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                            placeholder="https://res.com/..."
                                                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                      />
                                                )}
                                          </div>
                                    </div>
                              </div>

                              <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                          ឈ្មោះទំនិញ *
                                    </label>
                                    <input
                                          type="text"
                                          required
                                          value={formData.name}
                                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                          placeholder="បញ្ជូលឈ្មោះទំនិញ..."
                                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                    <div>
                                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                                លេខកូដ SKU *
                                          </label>
                                          <div className="flex gap-0.5">
                                                <input
                                                      type="text"
                                                      required
                                                      value={formData.sku}
                                                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                      placeholder="LTH-000000"
                                                      className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                {!editingProduct && (
                                                      <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, sku: generateSKU() })}
                                                            title="បង្កើត SKU ថ្មី"
                                                            className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                                                      >
                                                            <RefreshCw className="w-4 h-4" />
                                                      </button>
                                                )}
                                          </div>
                                          {!editingProduct && (
                                                <p className="mt-1 text-[10px] text-slate-500">បង្កើតស្វ័យប្រវត្តិ។ ចុច <span className="text-indigo-400">↻</span> ដើម្បីបង្កើតថ្មី។</p>
                                          )}
                                    </div>

                                    <div>
                                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                                ប្រភេទទំនិញ *
                                          </label>
                                          <select
                                                required
                                                value={formData.categoryId}
                                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                          >
                                                <option value="" disabled>ជ្រើសរើសប្រភេទទំនិញ</option>
                                                {categories.map((c) => (
                                                      <option key={c.id} value={c.id}>
                                                            {c.name}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                    <div>
                                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                                តម្លៃ ($) *
                                          </label>
                                          <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                    </div>

                                    <div>
                                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                                ចំនួនដើម
                                          </label>
                                          <input
                                                type="number"
                                                min="0"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                    </div>

                                    <div>
                                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                                ស្តុកអប្បបរមា
                                          </label>
                                          <input
                                                type="number"
                                                min="0"
                                                value={formData.minimumStock}
                                                onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                    </div>
                              </div>

                              <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                          ការពិពណ៌នា
                                    </label>
                                    <textarea
                                          rows="3"
                                          value={formData.description}
                                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                          placeholder="ព័ត៌មានលម្អិតអំពីទំនិញ..."
                                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                              </div>

                              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                                    <button
                                          type="button"
                                          onClick={() => setIsModalOpen(false)}
                                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-colors cursor-pointer"
                                    >
                                          បោះបង់
                                    </button>
                                    <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                          <span>{editingProduct ? "រក្សាទុកការកែប្រែ" : "រក្សាទុកទំនិញ"}</span>
                                    </button>
                              </div>
                        </form>
                  </Modal>

                  <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="បញ្ជាក់ការលុប">
                        <div className="space-y-4">
                              <p className="text-sm text-slate-300">
                                    តើអ្នកប្រាកដជាចង់លុបទំនិញនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
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

export default Products;
