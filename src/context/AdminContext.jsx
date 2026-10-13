"use client";

import { createContext, useContext, useState, useMemo } from "react";

const AdminContext = createContext(null);

export function AdminProvider({
  children,
  initialOrders = [],
  initialDishes = [],
  initialUsers = [],
  serverMetrics = null,
  session = null,
}) {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "orders" | "tables" | "kitchen" | "menus" | "users" | "analytics" | "settings"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState("Chengxi Store");
  const [orders, setOrders] = useState(initialOrders);
  const [dishes, setDishes] = useState(initialDishes);
  const [users, setUsers] = useState(initialUsers);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => (o.status || "").toLowerCase() === "pending").length;
    const preparing = orders.filter((o) => (o.status || "").toLowerCase() === "preparing").length;
    const served = orders.filter((o) => {
      const s = (o.status || "").toLowerCase();
      return s === "served" || s === "out for delivery";
    }).length;
    const completed = orders.filter((o) => {
      const s = (o.status || "").toLowerCase();
      return s === "completed" || s === "delivered";
    }).length;
    const cancelled = orders.filter((o) => (o.status || "").toLowerCase() === "cancelled").length;

    const totalRevenue = orders
      .filter((o) => (o.status || "").toLowerCase() !== "cancelled")
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    return {
      total,
      pending,
      preparing,
      served,
      completed,
      cancelled,
      totalRevenue: serverMetrics?.totalRevenue ?? totalRevenue,
      etbRevenue: serverMetrics?.etbRevenue ?? Math.round(totalRevenue * 125.5),
      todayOrderCount: serverMetrics?.todayOrderCount ?? total,
      todayRevenue: serverMetrics?.todayRevenue ?? totalRevenue,
      averageOrderValue: serverMetrics?.averageOrderValue ?? 43.0,
      dailyOrderCounts: serverMetrics?.dailyOrderCounts ?? [],
      weeklyTrends: serverMetrics?.weeklyTrends ?? [],
      topSellingDishes: serverMetrics?.topSellingDishes ?? [],
    };
  }, [orders, serverMetrics]);

  return (
    <AdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sidebarOpen,
        setSidebarOpen,
        selectedStore,
        setSelectedStore,
        orders,
        setOrders,
        dishes,
        setDishes,
        users,
        setUsers,
        metrics,
        serverMetrics,
        toast,
        showToast,
        session,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return ctx;
}
