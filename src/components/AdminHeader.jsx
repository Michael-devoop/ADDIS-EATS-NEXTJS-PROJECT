"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminHeader() {
  const { activeTab, setActiveTab, setSidebarOpen } = useAdmin();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const getTitle = () => {
    switch (activeTab) {
      case "orders":
        return "Orders";
      case "dashboard":
        return "Dashboard";
      case "menus":
        return "Menu Management";
      case "users":
        return "User Management";
      case "tables":
        return "Dining Tables";
      case "kitchen":
        return "Kitchen Display (KDS)";
      case "analytics":
        return "Business Analytics";
      case "settings":
        return "Restaurant Settings";
      default:
        return "Orders";
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case "orders":
        return "Manage all orders of the restaurant.";
      case "dashboard":
        return "Live restaurant operational snapshot & kitchen metrics.";
      case "menus":
        return "Configure dishes, pricing in USD & ETB, categories and stock.";
      case "users":
        return "Manage customer accounts, roles and staff access privileges.";
      case "tables":
        return "Real-time dining floor layout and table occupancy.";
      case "kitchen":
        return "Live kitchen tickets organized by preparation stage.";
      case "analytics":
        return "Sales breakdown, popular items, and revenue performance.";
      case "settings":
        return "Configure branch details, currency conversion, and delivery fees.";
      default:
        return "Manage all orders of the restaurant.";
    }
  };

  return (
    <header
      id="admin-header"
      className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs"
    >
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100"
          aria-label="Toggle navigation drawer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight capitalize">
            {getTitle()}
          </h1>
          <p className="text-xs text-[#6b7280]">{getSubtitle()}</p>
        </div>
      </div>

      {/* Right Icons: Notifications (8+) & Settings Gear matching screenshot */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Orange Badge (8+) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((o) => !o)}
            className="relative p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-[#f95738] px-1 text-[9px] font-black text-white shadow-xs">
              8+
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-gray-100 p-4 shadow-2xl z-40 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                <span className="text-xs font-bold text-[#111827]">Live Kitchen Alerts</span>
                <span className="text-[10px] text-[#f95738] font-semibold cursor-pointer">Mark read</span>
              </div>
              <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
                <div className="p-2 bg-orange-50/60 rounded-lg">
                  <p className="font-semibold text-[#111827]">New Order #20251011064916</p>
                  <p className="text-[10px] text-gray-500">Table 1 · Special Kitfo Platter</p>
                </div>
                <div className="p-2 hover:bg-gray-50 rounded-lg">
                  <p className="font-semibold text-[#111827]">Table 4 requested check</p>
                  <p className="text-[10px] text-gray-500">Order #20251011064919 settled via Telebirr</p>
                </div>
                <div className="p-2 hover:bg-gray-50 rounded-lg">
                  <p className="font-semibold text-[#111827]">Kitchen ticket ready</p>
                  <p className="text-[10px] text-gray-500">Order #20251011064927 ready for serving</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Gear */}
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className="p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
          aria-label="Settings"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
