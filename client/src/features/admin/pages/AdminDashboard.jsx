import { lazy, Suspense, useState } from "react";
import { Shield, Users, Package, ScrollText } from "lucide-react";

const TABS = [
  { id: "users", label: "Users", icon: Users },
  { id: "listings", label: "Listings", icon: Package },
  { id: "logs", label: "Audit Logs", icon: ScrollText },
];

const UsersTab = lazy(() => import("../components/UsersTab"));
const ListingsTab = lazy(() => import("../components/ListingsTab"));
const AuditLogsTab = lazy(() => import("../components/AuditLogsTab"));

const TabLoading = () => (
  <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 animate-pulse">
    <div className="h-10 w-56 rounded-lg bg-slate-200 dark:bg-white/10 mb-4" />
    <div className="space-y-3">
      <div className="h-12 rounded-lg bg-slate-200 dark:bg-white/10" />
      <div className="h-12 rounded-lg bg-slate-200 dark:bg-white/10" />
      <div className="h-12 rounded-lg bg-slate-200 dark:bg-white/10" />
    </div>
  </div>
);

// ── Dashboard Shell ───────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-[radial-gradient(125%_125%_at_50%_80%,#030a1c_40%,#040425_90%)]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <Shield size={20} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage users, listings, and platform activity</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition cursor-pointer ${
                  isActive
                    ? "border-indigo-500 text-indigo-500"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        <Suspense fallback={<TabLoading />}>
          {activeTab === "users" && <UsersTab />}
          {activeTab === "listings" && <ListingsTab />}
          {activeTab === "logs" && <AuditLogsTab />}
        </Suspense>
      </div>
    </main>
  );
};

export default AdminDashboard;
