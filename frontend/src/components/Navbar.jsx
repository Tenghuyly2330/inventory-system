import React from "react";
import { Menu, User, Bell, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = ({ onMenuClick, title }) => {
      const { user } = useAuth();
      const { theme, toggleTheme } = useTheme();

      return (
            <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                        <button
                              onClick={onMenuClick}
                              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
                              aria-label="Toggle menu"
                        >
                              <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-100">{title || "Dashboard"}</h2>
                  </div>

                  <div className="flex items-center gap-4">
                        <button
                              onClick={toggleTheme}
                              className="p-2 text-slate-400 hover:text-amber-400 dark:hover:text-amber-300 hover:bg-indigo-300 dark:hover:bg-slate-800/80 rounded-xl transition-all border border-slate-800 flex items-center gap-2 text-xs font-semibold cursor-pointer"
                              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                        >
                              {theme === "dark" ? (
                                    <>
                                          <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                                          {/* <span className="hidden md:inline text-slate-300">Light Mode</span> */}
                                    </>
                              ) : (
                                    <>
                                          <Moon className="w-4 h-4 text-indigo-500" />
                                          {/* <span className="hidden md:inline text-slate-700">Dark Mode</span> */}
                                    </>
                              )}
                        </button>

                        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/60 rounded-full border border-slate-700/50">
                              <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                                    {user?.name?.charAt(0) || "A"}
                              </div>
                              <span className="text-xs font-medium text-slate-300 hidden sm:inline">{user?.name || "Admin"}</span>
                        </div>
                  </div>
            </header>
      );
};

export default Navbar;
