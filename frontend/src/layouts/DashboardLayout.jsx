import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = () => {
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const location = useLocation();

      const getPageTitle = (path) => {
            switch (path) {
                  case "/dashboard": return "ផ្ទាំងគ្រប់គ្រងទូទៅ";
                  case "/products": return "ការគ្រប់គ្រងទំនិញ";
                  case "/categories": return "ការគ្រប់គ្រងប្រភេទទំនិញ";
                  case "/suppliers": return "ការគ្រប់គ្រងអ្នកផ្គត់ផ្គង់";
                  case "/stock-in": return "ការនាំទំនិញចូល";
                  case "/stock-out": return "ការបញ្ចេញទំនិញ";
                  case "/stock-history": return "ប្រវត្តិស្តុក";
                  default: return "ប្រព័ន្ធគ្រប់គ្រងស្តុក";
            }
      };

      return (
            <div className="min-h-screen bg-white dark:bg-[#030719] flex">
                  <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

                  <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
                        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle(location.pathname)} />

                        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
                              <Outlet />
                        </main>
                  </div>
            </div>
      );
};

export default DashboardLayout;
