import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardApi, stockApi } from "../services/apiModules";
import { Loading, EmptyState } from "../components/UIStates";
import {
  Package,
  Boxes,
  Truck,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  FolderTree,
  TrendingDown,
  ChevronRight
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [lowStockList, setLowStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, lowStockRes] = await Promise.all([
        dashboardApi.getStats(),
        stockApi.getLowStock()
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (lowStockRes.success) {
        setLowStockList(lowStockRes.data);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading message="កំពុងទាញយកទិន្នន័យផ្ទាំគ្រប់គ្រងស្តុក..." />;

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-center">
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "ទំនិញសរុប",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/20",
      link: "/products"
    },
    {
      title: "ស្តុកទំនិញសរុប",
      value: stats?.totalStock || 0,
      icon: Boxes,
      color: "from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/20",
      link: "/products"
    },
    {
      title: "ប្រភេទទំនិញ",
      value: stats?.totalCategories || 0,
      icon: FolderTree,
      color: "from-purple-600/20 to-pink-600/20 text-purple-400 border-purple-500/20",
      link: "/categories"
    },
    {
      title: "អ្នកផ្គត់ផ្គង់",
      value: stats?.totalSuppliers || 0,
      icon: Truck,
      color: "from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/20",
      link: "/suppliers"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ</h1>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-colors flex items-center gap-2 self-start sm:self-auto border border-slate-700 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> ធ្វើបច្ចុប្បន្នភាពទិន្នន័យ
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border backdrop-blur-xl hover:scale-[1.02] transition-all duration-200 group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</span>
                <div className="p-2 rounded-xl bg-slate-900/60 text-current">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-100">{card.value.toLocaleString()}</span>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100">ចលនាស្តុកថ្មីៗ</h3>
            </div>
            <Link
              to="/stock-history"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              មើលទាំងអស់ <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {!stats?.recentMovements || stats.recentMovements.length === 0 ? (
            <EmptyState title="មិនទាន់មានចលនាស្តុកថ្មីៗទេ" description="ការផ្លាស់ប្តូរស្តុកនឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">ប្រភេទ</th>
                    <th className="py-3 px-4">ទំនិញ</th>
                    <th className="py-3 px-4 text-center">ចំនួន</th>
                    <th className="py-3 px-4">កាលបរិច្ឆេទ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.recentMovements.slice(0, 5).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${m.type === "IN"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : m.type === "OUT"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                        >
                          {m.type === "IN" && <ArrowDownLeft className="w-3 h-3" />}
                          {m.type === "OUT" && <ArrowUpRight className="w-3 h-3" />}
                          {m.type === "ADJUSTMENT" && <RefreshCw className="w-3 h-3" />}
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {m.product?.name}
                        <span className="block text-xs font-mono text-slate-500">{m.product?.sku}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200">{m.quantity}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* low stock */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-100">ស្តុកទាប</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
              {lowStockList.length} មុខទំនិញ
            </span>
          </div>

          {lowStockList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-2">
                <Boxes className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">ស្តុកមានស្ថានភាពល្អ</p>
              <p className="text-xs text-slate-500">គ្មានមុខទំនិញណាដែលមានចំនួនទាបជាងកម្រិតអប្បបរមាឡើយ។</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
              {lowStockList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-500/20 flex items-center justify-between hover:border-rose-500/40 transition-all"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{item.quantity} ក្នុងស្តុក</span>
                    </div>
                    <span className="text-[10px] text-slate-400">អប្បបរមា៖ {item.minimumStock}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-slate-800">
            <Link
              to="/stock-in"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/20"
            >
              <ArrowDownLeft className="w-4 h-4" /> នាំចូលស្តុកបន្ថែមឥឡូវនេះ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;