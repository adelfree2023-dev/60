"use client";

import { useState } from "react";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  TrendingUp,
  AlertCircle
} from "lucide-react";

// Admin Dashboard - Overview page (Admin-#01, #17, #27)
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600">APEX Admin</h1>
        </div>
        <nav className="mt-6">
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="Overview" 
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <NavItem 
            icon={<Package size={20} />} 
            label="Products" 
            active={activeTab === "products"}
            onClick={() => setActiveTab("products")}
          />
          <NavItem 
            icon={<ShoppingCart size={20} />} 
            label="Orders" 
            active={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Customers" 
            active={activeTab === "customers"}
            onClick={() => setActiveTab("customers")}
          />
          <NavItem 
            icon={<TrendingUp size={20} />} 
            label="Analytics" 
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === "overview" && <OverviewPanel />}
        {activeTab === "products" && <ProductsPanel />}
        {activeTab === "orders" && <OrdersPanel />}
        {activeTab === "customers" && <CustomersPanel />}
        {activeTab === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${
        active 
          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" 
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function OverviewPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Revenue" value="$12,345" change="+12%" />
        <StatCard title="Orders" value="156" change="+8%" />
        <StatCard title="Customers" value="1,234" change="+15%" />
        <StatCard title="Conversion" value="3.2%" change="-2%" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="pb-3">Order ID</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            <TableRow id="#1234" customer="John Doe" status="Processing" total="$299" date="2026-01-15" />
            <TableRow id="#1235" customer="Jane Smith" status="Shipped" total="$149" date="2026-01-14" />
            <TableRow id="#1236" customer="Bob Johnson" status="Delivered" total="$599" date="2026-01-13" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsPanel() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Product
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500">Product management interface (Admin-#21 Bulk Import/Export)</p>
      </div>
    </div>
  );
}

function OrdersPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500">Order management with status workflow (Admin-#17 Order Management)</p>
      </div>
    </div>
  );
}

function CustomersPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customers</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500">Customer management with RBAC (Admin-#27 Staff RBAC)</p>
      </div>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Store Logo</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500">Upload logo (Admin-#01 Identity Settings)</p>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Store Name</h3>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="My Awesome Store"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className={`text-sm mt-2 ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {change} from last month
      </p>
    </div>
  );
}

function TableRow({ id, customer, status, total, date }: { 
  id: string; 
  customer: string; 
  status: string; 
  total: string; 
  date: string;
}) {
  const statusColors: Record<string, string> = {
    Processing: "bg-yellow-100 text-yellow-700",
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
  };

  return (
    <tr className="border-t border-gray-100">
      <td className="py-3 font-medium">{id}</td>
      <td className="py-3">{customer}</td>
      <td className="py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100"}`}>
          {status}
        </span>
      </td>
      <td className="py-3">{total}</td>
      <td className="py-3 text-gray-500">{date}</td>
    </tr>
  );
}
