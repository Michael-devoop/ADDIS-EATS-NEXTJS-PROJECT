"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";

export default function AdminSidebar() {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    selectedStore,
    setSelectedStore,
    metrics,
    dishes,
    users,
    session,
    showToast,
  } = useAdmin();

  const [storeSelectorOpen, setStoreSelectorOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close admin navigation sidebar"
          tabIndex={-1}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden cursor-default"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col justify-between transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex-1 overflow-y-auto min-h-0 overscroll-contain">
          {/* Top Brand Logo matching screenshot */}
          <div className="flex items-center justify-between pb-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logoimage-cropped.png"
                alt="Addis Eats Restaurant Brand Logo"
                width={140}
                height={40}
                priority
                className="h-9 w-auto object-contain"
              />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-dark text-xl"
              aria-label="Close sidebar"
            >
              ×
            </button>
          </div>

          {/* Store Selector Pill matching screenshot */}
          <div className="mb-6 relative">
            <span className="block text-[11px] font-semibold text-[#9ca3af] mb-1.5">
              Store
            </span>
            <button
              type="button"
              onClick={() => setStoreSelectorOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 rounded-xl border border-gray-200/80 bg-white px-3 py-2.5 text-xs font-semibold text-[#111827] shadow-xs hover:border-gray-300 transition"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50 text-xs">
                  🏪
                </span>
                <span className="truncate">{selectedStore}</span>
              </div>
              <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {storeSelectorOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl p-1 z-30 animate-in fade-in">
                {["Chengxi Store", "Addis Eats Downtown", "Bole Branch"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setSelectedStore(st);
                      setStoreSelectorOpen(false);
                      showToast(`Switched active branch to ${st}`);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition ${
                      selectedStore === st ? "bg-[#fef2ee] text-[#f95738]" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menu Navigation Group */}
          <div className="space-y-1">
            <span className="block text-[11px] font-semibold text-[#9ca3af] mb-2 px-3">
              Menu
            </span>

            {/* Dashboard Link */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("dashboard");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-[#f95738] text-white shadow-sm shadow-[#f95738]/30"
                  : "text-[#6b7280] hover:text-[#111827] hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Dashboard</span>
            </button>

            {/* Orders Link (Active Coral Pill in reference screenshot) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("orders");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "orders"
                  ? "bg-[#f95738] text-white shadow-sm shadow-[#f95738]/30"
                  : "text-[#6b7280] hover:text-[#111827] hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Orders</span>
              {metrics.pending > 0 && (
                <span
                  className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === "orders" ? "bg-white text-[#f95738]" : "bg-orange-100 text-[#f95738]"
                  }`}
                >
                  {metrics.pending}
                </span>
              )}
            </button>

            {/* Tables Link */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("tables");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "tables"
                  ? "bg-[#f95738] text-white shadow-sm shadow-[#f95738]/30"
                  : "text-[#6b7280] hover:text-[#111827] hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Tables</span>
            </button>

            {/* Kitchen Link */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("kitchen");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "kitchen"
                  ? "bg-[#f95738] text-white shadow-sm shadow-[#f95738]/30"
                  : "text-[#6b7280] hover:text-[#111827] hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Kitchen</span>
              {metrics.preparing > 0 && (
                <span
                  className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === "kitchen" ? "bg-white text-[#f95738]" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {metrics.preparing}
                </span>
              )}
            </button>

            {/* Menus Link */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("menus");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "menus"
                  ? "bg-[#f95738] text-white shadow-sm shadow-[#f95738]/30"
                  : "text-[#6b7280] hover:text-[#111827] hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Menus</span>
              <span
                className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === "menus" ? "bg-white text-[#f95738]" : "bg-gray-100 text-gray-600"
                }`}
              >
                {dishes.length}
              </span>
            </button>

            {/* Users Link */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("users");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "users"
                  ? "bg-[#f95738] text-white shadow-sm shadow-[#f95738]/30"
                  : "text-[#6b7280] hover:text-[#111827] hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Users</span>
              <span
                className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === "users" ? "bg-white text-[#f95738]" : "bg-gray-100 text-gray-600"
                }`}
              >
                {users.length}
              </span>
            </button>

            {/* Analytics Link */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("analytics");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "analytics"
                  ? "bg-[#f95738] text-white shadow-sm shadow-[#f95738]/30"
                  : "text-[#6b7280] hover:text-[#111827] hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span>Analytics</span>
            </button>
          </div>

          {/* Others Group */}
          <div className="space-y-1 mt-6 pt-4 border-t border-gray-100">
            <span className="block text-[11px] font-semibold text-[#9ca3af] mb-2 px-3">
              Others
            </span>
            <button
              type="button"
              onClick={() => showToast("Help & documentation center is ready.")}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6b7280] hover:text-[#111827] hover:bg-gray-50 transition"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "settings"
                  ? "bg-[#f95738] text-white"
                  : "text-[#6b7280] hover:text-[#111827] hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Profile Card at bottom (John Holland Admin) */}
        <div className="p-4 border-t border-gray-100 relative shrink-0 bg-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#f95738] to-orange-400 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/service-1.jpg"
                    alt="Admin Avatar"
                    width={36}
                    height={36}
                    className="object-cover h-full w-full"
                  />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#111827] truncate">
                  {session?.user?.name || "John Holland"}
                </p>
                <p className="text-[10px] text-[#9ca3af] truncate uppercase font-semibold">
                  {session?.user?.role || "Admin"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setProfileMenuOpen((o) => !o)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-dark transition cursor-pointer"
              aria-label="Profile actions"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {profileMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-40 animate-in fade-in">
              <Link
                href="/menu"
                className="w-full text-left px-3 py-2 text-xs rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <span>🌐</span> View Customer Menu
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-xs rounded-lg font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
