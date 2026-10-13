"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import DailyRevenueChart from "@/components/admin/charts/DailyRevenueChart";
import DailyOrdersChart from "@/components/admin/charts/DailyOrdersChart";
import AggregatedDataTable from "@/components/admin/charts/AggregatedDataTable";
import AnalyticsEmptyState from "@/components/admin/charts/EmptyState";

// Currency & date formatters
const formatCurrency = (val) => {
  const num = typeof val === "number" ? val : parseFloat(val) || 0;
  return `$${num.toFixed(2)}`;
};

const formatETB = (usd) => {
  const num = typeof usd === "number" ? usd : parseFloat(usd) || 0;
  return `ETB ${(num * 125.5).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatDate = (isoStr) => {
  if (!isoStr) return "Date: 2026-10-14  Time: 09:32:28";
  try {
    const d = new Date(isoStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `Date: ${yyyy}-${mm}-${dd}  Time: ${hh}:${min}:${ss}`;
  } catch {
    return isoStr;
  }
};

export default function AdminDashboard({ analyticsData = null }) {
  const {
    activeTab,
    setActiveTab,
    orders,
    setOrders,
    dishes,
    setDishes,
    users,
    setUsers,
    metrics,
    toast,
    showToast,
    selectedStore,
    setSelectedStore,
  } = useAdmin();

  // Orders Tab filters & pagination state
  const [orderStatusFilter, setOrderStatusFilter] = useState("All"); // "All" | "Pending" | "Preparing" | "Served" | "Completed" | "Cancelled"
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selectedOrder, setSelectedOrder] = useState(null); // For Details inspection modal
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Menu Management state
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState("all");
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishFormData, setDishFormData] = useState({
    name: "",
    price: "",
    categories: "maindishes",
    desc: "",
    image: "/images/menu-1.jpg",
  });

  // User Management state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
    status: "active",
  });

  // Keyboard shortcut ⌘K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("admin-order-search-input");
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (orderStatusFilter !== "All") {
        const orderStatus = (order.status || "").toLowerCase();
        const target = orderStatusFilter.toLowerCase();
        if (target === "served") {
          if (orderStatus !== "served" && orderStatus !== "out for delivery") return false;
        } else if (target === "completed") {
          if (orderStatus !== "completed" && orderStatus !== "delivered") return false;
        } else if (orderStatus !== target) {
          return false;
        }
      }

      // Search query filter
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        const matchId = (order.orderId || "").toLowerCase().includes(q);
        const matchTable = (order.tableNumber || "").toLowerCase().includes(q);
        const matchCust = `${order.customer?.firstName || ""} ${order.customer?.lastName || ""} ${order.customer?.phone || ""} ${order.customer?.email || ""}`
          .toLowerCase()
          .includes(q);
        const matchItem = (order.items || []).some((i) => i.name.toLowerCase().includes(q));
        if (!matchId && !matchTable && !matchCust && !matchItem) return false;
      }

      return true;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Paginated orders
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Order status badge styling
  const getStatusBadgeStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending") {
      return "bg-[#fef2ee] text-[#f95738] border border-[#fbd4c9]";
    }
    if (s === "preparing") {
      return "bg-[#fffbeb] text-[#d97706] border border-[#fde68a]";
    }
    if (s === "served" || s === "out for delivery") {
      return "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]";
    }
    if (s === "completed" || s === "delivered") {
      return "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]";
    }
    if (s === "cancelled") {
      return "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]";
    }
    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  // Update order status action
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      showToast(`Order #${orderId} updated to ${newStatus}`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Dish management actions
  const handleSaveDish = async (e) => {
    e.preventDefault();
    try {
      if (editingDish) {
        const res = await fetch(`/api/dishes/${editingDish.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dishFormData.name,
            price: parseFloat(dishFormData.price),
            categories: [dishFormData.categories],
            desc: dishFormData.desc,
            image: dishFormData.image,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update dish");
        setDishes((prev) =>
          prev.map((d) => (d.id === editingDish.id ? { ...d, ...dishFormData, price: parseFloat(dishFormData.price), categories: [dishFormData.categories] } : d))
        );
        showToast(`Dish "${dishFormData.name}" updated successfully.`);
      } else {
        const res = await fetch("/api/dishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dishFormData.name,
            price: parseFloat(dishFormData.price),
            categories: [dishFormData.categories],
            desc: dishFormData.desc,
            image: dishFormData.image,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add dish");
        setDishes((prev) => [data.dish, ...prev]);
        showToast(`New dish "${dishFormData.name}" added to menu.`);
      }
      setDishModalOpen(false);
      setEditingDish(null);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteDish = async (dishId, dishName) => {
    if (!confirm(`Are you sure you want to remove "${dishName}" from the menu?`)) return;
    try {
      const res = await fetch(`/api/dishes/${dishId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete dish");
      setDishes((prev) => prev.filter((d) => d.id !== dishId));
      showToast(`Dish "${dishName}" removed.`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // User management actions
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userFormData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      setUsers((prev) => [data.user, ...prev]);
      showToast(`User "${userFormData.name}" registered.`);
      setUserModalOpen(false);
      setUserFormData({ name: "", email: "", phone: "", role: "customer", status: "active" });
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const nextRole = currentRole === "admin" ? "staff" : currentRole === "staff" ? "customer" : "admin";
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!res.ok) throw new Error("Failed to change user role");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
      );
      showToast(`User role updated to ${nextRole}.`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to change user status");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
      showToast(`User status set to ${nextStatus}.`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="relative font-sans antialiased">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl transition-all animate-in slide-in-from-bottom-5 ${
            toast.type === "error"
              ? "bg-red-600 text-white shadow-red-600/30"
              : "bg-[#111827] text-white shadow-black/30"
          }`}
        >
          <span className="text-base">{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* =====================================================================
          TAB 1: ORDERS (EXACT 1:1 MATCH TO REFERENCE SCREENSHOT)
          ===================================================================== */}
      {activeTab === "orders" && (
        <div className="p-6 lg:p-8 space-y-6">
          {/* 6 Top Metric Cards (19 Total, 6 Pending, 5 Preparing, 5 Served, 5 Completed, 2 Cancelled) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <span className="block text-3xl font-black text-[#111827]">{metrics.total}</span>
              <span className="block text-xs font-semibold text-[#6b7280] mt-1.5">Total Orders</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <span className="block text-3xl font-black text-[#111827]">{metrics.pending}</span>
              <span className="block text-xs font-semibold text-[#6b7280] mt-1.5">Pending Orders</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <span className="block text-3xl font-black text-[#111827]">{metrics.preparing}</span>
              <span className="block text-xs font-semibold text-[#6b7280] mt-1.5">Preparing Orders</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <span className="block text-3xl font-black text-[#111827]">{metrics.served}</span>
              <span className="block text-xs font-semibold text-[#6b7280] mt-1.5">Served Orders</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <span className="block text-3xl font-black text-[#111827]">{metrics.completed}</span>
              <span className="block text-xs font-semibold text-[#6b7280] mt-1.5">Completed</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <span className="block text-3xl font-black text-[#111827]">{metrics.cancelled}</span>
              <span className="block text-xs font-semibold text-[#6b7280] mt-1.5">Cancelled</span>
            </div>
          </div>

          {/* Search Input Bar with ⌘K Badge */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="admin-order-search-input"
              type="text"
              value={orderSearchQuery}
              onChange={(e) => {
                setOrderSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="w-full rounded-2xl border border-gray-200/80 bg-white py-3.5 pl-11 pr-14 text-xs font-medium text-dark placeholder-gray-400 outline-none transition focus:border-[#f95738] focus:ring-1 focus:ring-[#f95738] shadow-xs"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <kbd className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-400 select-none">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Filter Pills Bar (All, Pending, Preparing, Served, Completed, Cancelled) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["All", "Pending", "Preparing", "Served", "Completed", "Cancelled"].map((status) => {
              const isActive = orderStatusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setOrderStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition shrink-0 ${
                    isActive
                      ? "bg-[#feebe6] text-[#f95738] shadow-xs"
                      : "text-[#6b7280] hover:text-[#111827] hover:bg-white"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {/* 2-Column Order Cards Grid */}
          {paginatedOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-gray-500">
                No orders match current filter &ldquo;{orderStatusFilter}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => {
                  setOrderStatusFilter("All");
                  setOrderSearchQuery("");
                }}
                className="mt-3 text-xs font-bold text-[#f95738] hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {paginatedOrders.map((order) => {
                const firstItem = order.items?.[0] || {
                  name: "Chef Dish Platter",
                  image: "/images/menu-1.jpg",
                };

                return (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs hover:shadow-md transition-shadow flex items-center gap-4"
                  >
                    {/* Left Dish Image Thumbnail */}
                    <div className="relative w-32 h-28 sm:w-36 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={firstItem.image || "/images/menu-1.jpg"}
                        alt={firstItem.name || "Order item"}
                        fill
                        sizes="(max-width: 640px) 128px, 144px"
                        className="object-cover"
                      />
                    </div>

                    {/* Right Details Container */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                      {/* Top Line: Order # + Status Pill */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-extrabold text-xs sm:text-sm text-[#111827] truncate">
                          Order #{order.orderId}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${getStatusBadgeStyle(
                            order.status
                          )}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </div>

                      {/* Middle Line: Table Number / Customer */}
                      <p className="text-xs text-[#6b7280] font-medium mt-1 truncate">
                        {order.tableNumber || "Table No: 1"}
                        {order.customer?.firstName && ` · ${order.customer.firstName} ${order.customer.lastName || ""}`}
                      </p>

                      {/* Date & Time Timestamp */}
                      <p className="text-[11px] text-[#9ca3af] font-mono mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>

                      {/* Bottom Row: Price + View Details Button */}
                      <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-gray-50">
                        <div>
                          <span className="text-base sm:text-lg font-black text-[#111827]">
                            {formatCurrency(order.pricing?.total || 43.0)}
                          </span>
                          <span className="text-[10px] text-gray-400 ml-1.5 hidden sm:inline">
                            ({formatETB(order.pricing?.total || 43.0)})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs font-bold text-[#111827] hover:text-[#f95738] flex items-center gap-1 transition group cursor-pointer"
                        >
                          <span>View Details</span>
                          <span className="transition-transform group-hover:translate-x-0.5 text-[#9ca3af] group-hover:text-[#f95738]">
                            &gt;
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination Bar (Matching reference: Page of, 1 2 3 4, 8 data per row) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200/60 text-xs text-[#6b7280]">
            <div className="font-medium">
              Page {currentPage} of {totalPages} ({filteredOrders.length} total orders)
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 rounded-lg border border-gray-200 bg-white font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center transition"
              >
                &lt;
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 rounded-lg font-bold text-xs transition ${
                    currentPage === pageNum
                      ? "bg-[#f95738] text-white shadow-xs"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 rounded-lg border border-gray-200 bg-white font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center transition"
              >
                &gt;
              </button>
            </div>

            {/* Rows per page selector */}
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-[#f95738]"
              >
                <option value={6}>6 data per row</option>
                <option value={8}>8 data per row</option>
                <option value={12}>12 data per row</option>
                <option value={16}>16 data per row</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: DASHBOARD (EXECUTIVE OPERATIONS VIEW)
          ===================================================================== */}
      {activeTab === "dashboard" && (
        <div className="p-6 lg:p-8 space-y-6">

          {/* =================================================================
              TOP 4 EXECUTIVE METRIC CARDS (SERVER-AGGREGATED KPIS)
              ================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <span className="text-xs font-semibold text-[#6b7280]">Gross Revenue</span>
              <p className="text-2xl lg:text-3xl font-black text-[#111827] mt-2">
                {formatCurrency(analyticsData?.kpis?.totalRevenue ?? metrics.totalRevenue)}
              </p>
              <p className="text-xs text-[#9ca3af] mt-1 font-mono">
                {formatETB(analyticsData?.kpis?.totalRevenue ?? metrics.totalRevenue)}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <span className="text-xs font-semibold text-[#6b7280]">Total Orders</span>
              <p className="text-2xl lg:text-3xl font-black text-[#111827] mt-2">
                {analyticsData?.kpis?.totalOrders ?? metrics.total} Orders
              </p>
              <p className="text-xs text-[#9ca3af] mt-1">Across all distinct dates</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <span className="text-xs font-semibold text-[#6b7280]">Avg Ticket (AOV)</span>
              <p className="text-2xl lg:text-3xl font-black text-[#111827] mt-2">
                {formatCurrency(analyticsData?.kpis?.averageOrderValue ?? 43.0)}
              </p>
              <p className="text-xs text-[#9ca3af] mt-1 font-mono">
                {formatETB(analyticsData?.kpis?.averageOrderValue ?? 43.0)}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
              <span className="text-xs font-semibold text-[#6b7280]">Active Queue</span>
              <p className="text-2xl lg:text-3xl font-black text-[#111827] mt-2">
                {analyticsData?.kpis?.activeOrdersCount ?? (metrics.pending + metrics.preparing)} Orders
              </p>
              <p className="text-xs text-[#9ca3af] mt-1">
                {metrics.preparing} in cooking, {metrics.pending} pending
              </p>
            </div>
          </div>

          {/* =================================================================
              EMPTY STATE CHECK VS CHARTS & MASTER TABLE
              ================================================================= */}
          {analyticsData?.summarizedRows?.length === 0 ? (
            <AnalyticsEmptyState isDemonstration={analyticsData?.isDemonstration} />
          ) : (
            <>
              {/* Charts as Client Leaves: Each with Heading, Unit, Fixed Height & Accompanying Data Table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailyRevenueChart data={analyticsData?.chartSeries || []} />
                <DailyOrdersChart data={analyticsData?.chartSeries || []} />
              </div>

              {/* Master Server-Aggregated Data Table with URL Sorting and Link-based Paging */}
              <AggregatedDataTable
                rows={analyticsData?.summarizedRows || []}
                pagination={analyticsData?.pagination}
                sorting={analyticsData?.sorting}
                demoMode={analyticsData?.demoMode === "live" ? "" : analyticsData?.demoMode}
              />
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <h3 className="font-bold text-sm text-[#111827] mb-4">Top Performing Menu Items</h3>
              <div className="space-y-3">
                {dishes.slice(0, 5).map((dish, idx) => (
                  <div key={dish.id} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-300 w-4">0{idx + 1}</span>
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image src={dish.image} alt={dish.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827]">{dish.name}</p>
                        <p className="text-[10px] text-gray-400 capitalize">{dish.categories?.[0] || "Main"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-dark">{formatCurrency(dish.price)}</p>
                      <p className="text-[10px] text-emerald-600 font-bold">In Stock</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-[#111827]">Active Kitchen Queue</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-[#f95738] hover:underline cursor-pointer"
                >
                  View All &gt;
                </button>
              </div>
              <div className="space-y-2.5">
                {orders.slice(0, 4).map((o) => (
                  <div
                    key={o.orderId}
                    className="p-3 rounded-xl border border-gray-100 flex items-center justify-between gap-3 hover:border-gray-200 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-[#f95738]">
                        #
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111827] truncate">
                          Order #{o.orderId} · {o.tableNumber || "Table 1"}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {o.items?.[0]?.name} {o.items?.length > 1 ? `+${o.items.length - 1} more` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeStyle(o.status)}`}>
                        {o.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="text-xs text-gray-400 hover:text-dark cursor-pointer"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: MENUS (MENU MANAGEMENT)
          ===================================================================== */}
      {activeTab === "menus" && (
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[#111827]">Menu Catalog & Dish Inventory</h2>
              <p className="text-xs text-[#6b7280]">
                Manage active dishes, pricing in USD and ETB, categories and instant stock availability.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingDish(null);
                setDishFormData({
                  name: "",
                  price: "",
                  categories: "maindishes",
                  desc: "",
                  image: "/images/menu-1.jpg",
                });
                setDishModalOpen(true);
              }}
              className="rounded-xl bg-[#f95738] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#ea580c] transition flex items-center gap-2 cursor-pointer"
            >
              <span>+</span> Add New Dish
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {["all", "starters", "maindishes", "drinks", "desserts"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMenuCategoryFilter(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition shrink-0 ${
                    menuCategoryFilter === cat
                      ? "bg-[#feebe6] text-[#f95738]"
                      : "text-[#6b7280] hover:bg-white"
                  }`}
                >
                  {cat === "all" ? "All Items" : cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              placeholder="Search dish name..."
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-dark placeholder-gray-400 outline-none focus:border-[#f95738] w-full sm:w-60"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {dishes
              .filter((dish) => {
                if (menuCategoryFilter !== "all" && !dish.categories?.includes(menuCategoryFilter)) {
                  return false;
                }
                if (menuSearchQuery.trim() && !dish.name.toLowerCase().includes(menuSearchQuery.toLowerCase())) {
                  return false;
                }
                return true;
              })
              .map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <Image src={dish.image} alt={dish.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-sm text-[#111827] truncate">{dish.name}</h4>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">
                          Available
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6b7280] line-clamp-2 mt-1">{dish.desc}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-black text-[#111827]">{formatCurrency(dish.price)}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{formatETB(dish.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDish(dish);
                        setDishFormData({
                          name: dish.name,
                          price: dish.price,
                          categories: dish.categories?.[0] || "maindishes",
                          desc: dish.desc || "",
                          image: dish.image || "/images/menu-1.jpg",
                        });
                        setDishModalOpen(true);
                      }}
                      className="font-bold text-[#f95738] hover:underline cursor-pointer"
                    >
                      Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDish(dish.id, dish.name)}
                      className="font-semibold text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: USERS (USER MANAGEMENT)
          ===================================================================== */}
      {activeTab === "users" && (
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[#111827]">User Management & Staff Roles</h2>
              <p className="text-xs text-[#6b7280]">
                Manage customer profiles, assign staff privileges, and inspect order activity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUserModalOpen(true)}
              className="rounded-xl bg-[#f95738] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#ea580c] transition flex items-center gap-2 cursor-pointer"
            >
              <span>+</span> Add User / Staff
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {["all", "admin", "customer", "staff"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setUserRoleFilter(role)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition ${
                    userRoleFilter === role
                      ? "bg-[#feebe6] text-[#f95738]"
                      : "text-[#6b7280] hover:bg-white"
                  }`}
                >
                  {role === "all" ? "All Users" : `${role}s`}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-dark placeholder-gray-400 outline-none focus:border-[#f95738] w-full sm:w-64"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafafa] text-gray-400 font-semibold uppercase text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Orders</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users
                    .filter((u) => {
                      if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
                      if (userSearchQuery.trim()) {
                        const q = userSearchQuery.toLowerCase();
                        return (
                          u.name.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          u.phone?.includes(q)
                        );
                      }
                      return true;
                    })
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-orange-100 text-[#f95738] font-bold text-xs flex items-center justify-center shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#111827]">{user.name}</p>
                              <p className="text-[11px] text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 font-mono">{user.phone}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : user.role === "staff"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-dark">{user.ordersCount || 0}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                              user.status === "active" ? "text-emerald-600" : "text-red-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                user.status === "active" ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            />
                            <span className="capitalize">{user.status}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(user.id, user.role)}
                            className="text-[11px] font-bold text-[#f95738] hover:underline cursor-pointer"
                          >
                            Cycle Role
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(user.id, user.status)}
                            className="text-[11px] font-semibold text-gray-500 hover:text-dark cursor-pointer"
                          >
                            {user.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: TABLES (FLOOR OCCUPANCY PLAN)
          ===================================================================== */}
      {activeTab === "tables" && (
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#111827]">Restaurant Dining Floor Plan</h2>
              <p className="text-xs text-[#6b7280]">Real-time visual table occupancy and server assignment.</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available (7)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#f95738]" /> Occupied (6)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Reserved (3)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((tableNum) => {
              const isOccupied = [1, 2, 3, 4, 5, 6].includes(tableNum);
              const isReserved = [7, 8, 9].includes(tableNum);
              return (
                <div
                  key={tableNum}
                  className={`rounded-2xl p-4 border transition-all text-center flex flex-col justify-between h-36 ${
                    isOccupied
                      ? "bg-orange-50/60 border-orange-200 shadow-xs"
                      : isReserved
                      ? "bg-amber-50/40 border-amber-200"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">4 Seats</span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOccupied ? "bg-[#f95738]" : isReserved ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#111827]">Table {tableNum}</p>
                    <p className="text-[10px] font-semibold text-gray-500 mt-0.5">
                      {isOccupied ? "Dining · Active Order" : isReserved ? "Reserved 19:30" : "Clean & Ready"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast(`Table ${tableNum} controls opened.`)}
                    className="text-[10px] font-bold text-[#f95738] hover:underline cursor-pointer"
                  >
                    {isOccupied ? "View Order >" : "Seat Guests"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: KITCHEN DISPLAY (KDS)
          ===================================================================== */}
      {activeTab === "kitchen" && (
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#111827]">Kitchen Display System (KDS)</h2>
              <p className="text-xs text-[#6b7280]">Live kitchen station tickets organized by cooking status.</p>
            </div>
            <span className="text-xs font-bold text-dark bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-xs">
              Active Chefs on Duty: 4
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                <span className="text-xs font-black uppercase text-[#f95738]">1. To Cook ({metrics.pending})</span>
              </div>
              <div className="space-y-3">
                {orders
                  .filter((o) => (o.status || "").toLowerCase() === "pending")
                  .map((o) => (
                    <div key={o.orderId} className="bg-white rounded-xl p-3 border border-orange-200 shadow-xs">
                      <div className="flex justify-between items-center text-xs font-bold text-dark">
                        <span>Order #{o.orderId}</span>
                        <span className="text-orange-600 font-mono text-[10px]">9m ago</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{o.tableNumber || "Table 1"}</p>
                      <div className="mt-2 space-y-1 text-xs border-t border-gray-100 pt-2">
                        {o.items?.map((it, idx) => (
                          <p key={idx} className="font-semibold text-dark flex justify-between">
                            <span>{it.qty}x {it.name}</span>
                          </p>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(o.orderId, "Preparing")}
                        className="w-full mt-3 rounded-lg bg-orange-500 py-1.5 text-center text-xs font-bold text-white hover:bg-orange-600 transition cursor-pointer"
                      >
                        Start Cooking
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                <span className="text-xs font-black uppercase text-amber-600">2. Cooking ({metrics.preparing})</span>
              </div>
              <div className="space-y-3">
                {orders
                  .filter((o) => (o.status || "").toLowerCase() === "preparing")
                  .map((o) => (
                    <div key={o.orderId} className="bg-white rounded-xl p-3 border border-amber-200 shadow-xs">
                      <div className="flex justify-between items-center text-xs font-bold text-dark">
                        <span>Order #{o.orderId}</span>
                        <span className="text-amber-600 font-mono text-[10px]">14m ago</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{o.tableNumber || "Table 1"}</p>
                      <div className="mt-2 space-y-1 text-xs border-t border-gray-100 pt-2">
                        {o.items?.map((it, idx) => (
                          <p key={idx} className="font-semibold text-dark flex justify-between">
                            <span>{it.qty}x {it.name}</span>
                          </p>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(o.orderId, "Served")}
                        className="w-full mt-3 rounded-lg bg-emerald-600 py-1.5 text-center text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                      >
                        Mark Ready / Served
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                <span className="text-xs font-black uppercase text-blue-600">3. Served & Dining ({metrics.served})</span>
              </div>
              <div className="space-y-3">
                {orders
                  .filter((o) => (o.status || "").toLowerCase() === "served" || (o.status || "").toLowerCase() === "out for delivery")
                  .map((o) => (
                    <div key={o.orderId} className="bg-white rounded-xl p-3 border border-blue-200 shadow-xs">
                      <div className="flex justify-between items-center text-xs font-bold text-dark">
                        <span>Order #{o.orderId}</span>
                        <span className="text-blue-600 font-mono text-[10px]">Delivered</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{o.tableNumber || "Table 1"}</p>
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(o.orderId, "Completed")}
                        className="w-full mt-3 rounded-lg bg-gray-900 py-1.5 text-center text-xs font-bold text-white hover:bg-black transition cursor-pointer"
                      >
                        Complete Order
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 7: SETTINGS
          ===================================================================== */}
      {activeTab === "settings" && (
        <div className="p-6 lg:p-8 max-w-2xl space-y-6">
          <h2 className="text-lg font-black text-[#111827]">Restaurant Operational Settings</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">Active Restaurant Branch</label>
              <input
                type="text"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">ETB Exchange Rate (USD to ETB)</label>
              <input
                type="text"
                defaultValue="125.50"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">Standard Delivery Fee (USD)</label>
              <input
                type="text"
                defaultValue="4.00"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-dark"
              />
            </div>
            <button
              type="button"
              onClick={() => showToast("Settings updated successfully.")}
              className="rounded-xl bg-[#f95738] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#ea580c] transition cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ORDER INSPECTION & STATUS MANAGEMENT MODAL (View Details)
          ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in fade-in zoom-in-95 border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-lg text-[#111827]">
                    Order #{selectedOrder.orderId}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeStyle(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af] mt-0.5">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 hover:text-dark hover:bg-gray-200 flex items-center justify-center font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 bg-gray-50/70 p-3.5 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Location</span>
                <p className="font-bold text-[#111827] mt-0.5">{selectedOrder.tableNumber || "Table No: 1"}</p>
                <p className="text-[11px] text-gray-500">{selectedOrder.orderType || "Dine In"}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Customer</span>
                <p className="font-bold text-[#111827] mt-0.5">
                  {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName || ""}
                </p>
                <p className="text-[11px] text-gray-500 font-mono">{selectedOrder.customer?.phone || "+251 91 123 4567"}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <span className="text-xs font-bold text-[#111827]">Order Items ({selectedOrder.items?.length || 0})</span>
              <div className="divide-y divide-gray-100 border-y border-gray-100 max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image src={item.image || "/images/menu-1.jpg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-dark">{item.name}</p>
                        <p className="text-[11px] text-gray-400">{item.qty} × {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <span className="font-black text-dark">
                      {formatCurrency((item.qty || 1) * item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#fafafa] p-4 rounded-2xl space-y-1.5 text-xs mb-6">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.pricing?.subtotal || selectedOrder.pricing?.total)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax & Service</span>
                <span>{formatCurrency(selectedOrder.pricing?.tax || 3.44)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-[#111827] pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <div>
                  <span>{formatCurrency(selectedOrder.pricing?.total || 43.0)}</span>
                  <span className="text-[11px] font-medium text-gray-500 ml-2">
                    ({formatETB(selectedOrder.pricing?.total || 43.0)})
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <span className="block text-xs font-bold text-[#111827] mb-2">Change Order Status:</span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {["Pending", "Preparing", "Served", "Completed", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updatingOrderId === selectedOrder.orderId}
                    onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, st)}
                    className={`rounded-xl py-2 px-1 text-[11px] font-bold text-center transition border cursor-pointer ${
                      selectedOrder.status === st
                        ? "bg-[#111827] text-white border-[#111827] shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                🖨️ Print Ticket
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-[#f95738] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#ea580c] transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DISH CREATION / EDITING MODAL
          ========================================================================= */}
      {dishModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in">
            <h3 className="font-heading font-black text-lg text-dark mb-4">
              {editingDish ? "Edit Menu Dish" : "Add New Menu Dish"}
            </h3>
            <form onSubmit={handleSaveDish} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-dark mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={dishFormData.name}
                  onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                  placeholder="e.g. Traditional Tibs Platter"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#f95738]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={dishFormData.price}
                    onChange={(e) => setDishFormData({ ...dishFormData, price: e.target.value })}
                    placeholder="28.50"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#f95738]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-dark mb-1">Category</label>
                  <select
                    value={dishFormData.categories}
                    onChange={(e) => setDishFormData({ ...dishFormData, categories: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#f95738]"
                  >
                    <option value="starters">Starters</option>
                    <option value="maindishes">Main Dishes</option>
                    <option value="drinks">Drinks</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Description</label>
                <textarea
                  rows={2}
                  value={dishFormData.desc}
                  onChange={(e) => setDishFormData({ ...dishFormData, desc: e.target.value })}
                  placeholder="Ingredients and culinary notes..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#f95738]"
                />
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Thumbnail Image</label>
                <select
                  value={dishFormData.image}
                  onChange={(e) => setDishFormData({ ...dishFormData, image: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#f95738]"
                >
                  <option value="/images/menu-1.jpg">Menu 1 (Sandwich)</option>
                  <option value="/images/menu-2.jpg">Menu 2 (Drink)</option>
                  <option value="/images/menu-3.jpg">Menu 3 (Burger)</option>
                  <option value="/images/menu-4.jpg">Menu 4 (Adana Kabab)</option>
                  <option value="/images/menu-5.jpg">Menu 5 (Fast Platter)</option>
                  <option value="/images/menu-6.jpg">Menu 6 (Pizza)</option>
                  <option value="/images/menu-7.jpg">Menu 7 (Variety Drink)</option>
                  <option value="/images/menu-8.jpg">Menu 8 (Salad Fries)</option>
                  <option value="/images/ktfo.png">Special Kitfo</option>
                  <option value="/images/burgr1.png">Tower Burger</option>
                  <option value="/images/dorowot1.png">Traditional Doro Wot</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDishModalOpen(false)}
                  className="rounded-xl px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#f95738] px-5 py-2 font-bold text-white hover:bg-[#ea580c] cursor-pointer"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          USER CREATION MODAL
          ========================================================================= */}
      {userModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in">
            <h3 className="font-heading font-black text-lg text-dark mb-4">Add User / Staff Member</h3>
            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-dark mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="e.g. Solomon Kifle"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#f95738]"
                />
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="user@addiseats.com"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#f95738]"
                />
              </div>

              <div>
                <label className="block font-bold text-dark mb-1">Phone Number</label>
                <input
                  type="text"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  placeholder="+251 91 123 4567"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#f95738]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-dark mb-1">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#f95738]"
                  >
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-dark mb-1">Status</label>
                  <select
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#f95738]"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="rounded-xl px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#f95738] px-5 py-2 font-bold text-white hover:bg-[#ea580c] cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
