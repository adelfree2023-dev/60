"use client";

import { useState } from "react";
import { 
  Building2, 
  Users, 
  Shield, 
  Zap, 
  Database, 
  Activity,
  Settings,
  Play,
  Pause,
  Trash2,
  Eye
} from "lucide-react";

// Super Admin Dashboard - Platform Control Tower (Super-#01, #02, #03, #04)
export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("tenants");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-yellow-400">⚡ SUPER ADMIN</h1>
          <p className="text-xs text-gray-400 mt-1">Platform Control Tower</p>
        </div>
        <nav className="mt-6">
          <NavItem 
            icon={<Building2 size={20} />} 
            label="Tenants" 
            active={activeTab === "tenants"}
            onClick={() => setActiveTab("tenants")}
          />
          <NavItem 
            icon={<Zap size={20} />} 
            label="Feature Flags" 
            active={activeTab === "features"}
            onClick={() => setActiveTab("features")}
          />
          <NavItem 
            icon={<Shield size={20} />} 
            label="Security" 
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
          />
          <NavItem 
            icon={<Database size={20} />} 
            label="Backups" 
            active={activeTab === "backups"}
            onClick={() => setActiveTab("backups")}
          />
          <NavItem 
            icon={<Activity size={20} />} 
            label="Audit Log" 
            active={activeTab === "audit"}
            onClick={() => setActiveTab("audit")}
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
        {activeTab === "tenants" && <TenantsPanel />}
        {activeTab === "features" && <FeatureFlagsPanel />}
        {activeTab === "security" && <SecurityPanel />}
        {activeTab === "backups" && <BackupsPanel />}
        {activeTab === "audit" && <AuditPanel />}
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
          ? "bg-yellow-400/10 text-yellow-400 border-r-2 border-yellow-400" 
          : "text-gray-300 hover:bg-gray-700"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function TenantsPanel() {
  // Super-#01: Tenant Overview Table
  const tenants = [
    { id: "1", name: "Alpha Store", subdomain: "alpha", plan: "pro", status: "active", created: "2026-01-01" },
    { id: "2", name: "Beta Shop", subdomain: "beta", plan: "basic", status: "active", created: "2026-01-05" },
    { id: "3", name: "Gamma Retail", subdomain: "gamma", plan: "enterprise", status: "suspended", created: "2026-01-10" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tenant Management</h2>
        <button className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500">
          + New Tenant
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Tenants" value="156" />
        <StatCard label="Active" value="142" />
        <StatCard label="Suspended" value="8" />
        <StatCard label="Trial" value="6" />
      </div>

      {/* Tenant Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr className="text-left text-gray-300 text-sm">
              <th className="px-6 py-3">Store Name</th>
              <th className="px-6 py-3">Subdomain</th>
              <th className="px-6 py-3">Plan</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-t border-gray-700">
                <td className="px-6 py-4 font-medium">{tenant.name}</td>
                <td className="px-6 py-4 text-gray-400">{tenant.subdomain}.apex.localhost</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                    {tenant.plan}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    tenant.status === "active" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{tenant.created}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {/* Super-#02: God Mode (Impersonation) */}
                    <button className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30" title="Impersonate">
                      <Eye size={16} />
                    </button>
                    {/* Super-#03: Kill Switch */}
                    <button className="p-2 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30" title="Suspend">
                      <Pause size={16} />
                    </button>
                    <button className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeatureFlagsPanel() {
  // Super-#12: Feature Flags UI
  const flags = [
    { name: "AI Content Writer", key: "ai_writer", enabled: true },
    { name: "AI Image Enhancer", key: "ai_image", enabled: true },
    { name: "B2B Portal", key: "b2b_portal", enabled: false },
    { name: "Affiliates", key: "affiliates", enabled: false },
    { name: "Maintenance Mode", key: "maintenance_mode", enabled: false },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Feature Flags</h2>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        {flags.map((flag) => (
          <div key={flag.key} className="flex items-center justify-between py-4 border-b border-gray-700 last:border-0">
            <div>
              <p className="font-medium">{flag.name}</p>
              <p className="text-sm text-gray-400">{flag.key}</p>
            </div>
            <button
              className={`relative w-12 h-6 rounded-full transition ${
                flag.enabled ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  flag.enabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Security Center</h2>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <p className="text-gray-400">Security controls and compliance tools (Super-#11 Global Audit Log)</p>
      </div>
    </div>
  );
}

function BackupsPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Database Snapshots</h2>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <p className="text-gray-400">Backup and restore tenant databases (Super-#18 Database Snapshots)</p>
      </div>
    </div>
  );
}

function AuditPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Global Audit Log</h2>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <p className="text-gray-400">Immutable audit trail of all platform actions (Super-#11 Global Audit Log)</p>
      </div>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Platform Settings</h2>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <p className="text-gray-400">Global configuration and resource quotas (Super-#04 Resource Quotas)</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
