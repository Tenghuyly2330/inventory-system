import React from "react";
import { NavLink } from "react-router-dom";
import {
      LayoutDashboard,
      Package,
      FolderTree,
      Truck,
      ArrowDownLeft,
      ArrowUpRight,
      History,
      LogOut,
      Boxes
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
      const { logout, user } = useAuth();

      const navItems = [
            { name: "ផ្ទាំងគ្រប់គ្រង", path: "/dashboard", icon: LayoutDashboard },
            { name: "ទំនិញ", path: "/products", icon: Package },
            { name: "ប្រភេទទំនិញ", path: "/categories", icon: FolderTree },
            { name: "អ្នកផ្គត់ផ្គង់", path: "/suppliers", icon: Truck },
            { name: "នាំទំនិញចូល", path: "/stock-in", icon: ArrowDownLeft },
            { name: "បញ្ចេញទំនិញ", path: "/stock-out", icon: ArrowUpRight },
            { name: "ប្រវត្តិស្តុក", path: "/stock-history", icon: History },
      ];

      return (
            <>
                  {isOpen && (
                        <div
                              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
                              onClick={() => setIsOpen(false)}
                        />
                  )}

                  <aside
                        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#0F172B] border-r border-slate-800 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        <div className="flex flex-col h-full">
                              <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
                                    <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
                                          <Boxes className="w-6 h-6" />
                                    </div>
                                    <a href="/dashboard" className>
                                          <h1 className="font-bold text-slate-100 text-base leading-tight">ប្រព័ន្ធគ្រប់គ្រងស្តុក</h1>
                                    </a>
                              </div>

                              <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                                    {navItems.map((item) => {
                                          const Icon = item.icon;
                                          return (
                                                <NavLink
                                                      key={item.path}
                                                      to={item.path}
                                                      onClick={() => setIsOpen(false)}
                                                      className={({ isActive }) =>
                                                            `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                                                  : "hover:text-white hover:bg-indigo-600"
                                                            }`
                                                      }
                                                >
                                                      <Icon className="w-5 h-5 shrink-0" />
                                                      <span>{item.name}</span>
                                                </NavLink>
                                          );
                                    })}
                              </div>

                              <div className="p-4 border-t border-slate-800">
                                    <div className="flex items-center justify-between mb-3 px-2">
                                          <div className="truncate">
                                                <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || "អ្នកប្រើប្រាស់"}</p>
                                                <p className="text-xs text-slate-400 truncate">{user?.email || "admin@example.com"}</p>
                                          </div>
                                    </div>
                                    <button
                                          onClick={logout}
                                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-400 hover:text-black hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer border border-rose-500/20"
                                    >
                                          <LogOut className="w-4 h-4" />
                                          <span>ចាកចេញ</span>
                                    </button>
                              </div>
                        </div>
                  </aside>
            </>
      );
};

export default Sidebar;
