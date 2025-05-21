import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminMenuPage from "./pages/AdminMenuPage";
import MenuListPage from "./pages/MenuListPage";
import TakeOrderPage from "./pages/TakeOrderPage";
import OrderSummaryPage from "./pages/OrderSummaryPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-center space-x-6">
          <Link to="/take-order" className="text-blue-500">Waiter Order Page</Link>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Menu List
          </Link>
          <Link
            to="/admin"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Admin Panel
          </Link>
          <Link to="/order-summary">View Orders</Link>
        </header>

        {/* Full-width Main */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<MenuListPage />} />
            <Route path="/admin" element={<AdminMenuPage />} />
            <Route path="/take-order" element={<TakeOrderPage />} />
           <Route path="/order-summary" element={<OrderSummaryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
