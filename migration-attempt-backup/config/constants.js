// Shared design tokens, form options, and sidebar nav config for the Admin Dashboard.
// Location matches: src/utils/constants.js

import {
  LayoutDashboard, Film, Tags, Image as ImageIcon, Wallet, CreditCard,
  Crown, Users, Bell, LifeBuoy, Settings,
} from "lucide-react";

export const FONT_DISPLAY = { fontFamily: "'Fraunces', serif" };
export const FONT_MONO = { fontFamily: "'IBM Plex Mono', monospace" };

export const inputClass =
  "bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 " +
  "placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50";

export const CATEGORIES = ["Drama", "Action", "Thriller", "Documentary", "Comedy", "Mystery", "Romance"];
export const ACCESS_TYPES = ["Free", "Member", "Purchase"];

// Sidebar nav groups. Each item's `id` is the key AdminPanel.jsx uses to pick which
// admin page to render (swap this for real routes in router.jsx + AdminRoute.jsx later).
export const NAV = [
  { group: "Overview", items: [{ id: "overview", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Content", items: [
    { id: "movies", label: "Movies", icon: Film },
    { id: "categories", label: "Categories & Genres", icon: Tags },
    { id: "banners", label: "Banners & Featured", icon: ImageIcon },
  ] },
  { group: "Revenue", items: [
    { id: "wallet", label: "Wallet Top-ups", icon: Wallet },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "membership", label: "Membership Plans", icon: Crown },
  ] },
  { group: "Audience", items: [{ id: "users", label: "Users", icon: Users }] },
  { group: "Operations", items: [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "support", label: "Support Tickets", icon: LifeBuoy },
    { id: "settings", label: "Reports & Settings", icon: Settings },
  ] },
];
