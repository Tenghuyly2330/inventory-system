import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import Suppliers from "../pages/Suppliers";
import StockIn from "../pages/StockIn";
import StockOut from "../pages/StockOut";
import StockHistory from "../pages/StockHistory";

const AppRoutes = () => {
      return (
            <Routes>
                  <Route path="/login" element={<Login />} />

                  <Route
                        path="/"
                        element={
                              <ProtectedRoute>
                                    <DashboardLayout />
                              </ProtectedRoute>
                        }
                  >
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="suppliers" element={<Suppliers />} />
                        <Route path="stock-in" element={<StockIn />} />
                        <Route path="stock-out" element={<StockOut />} />
                        <Route path="stock-history" element={<StockHistory />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
      );
};

export default AppRoutes;
