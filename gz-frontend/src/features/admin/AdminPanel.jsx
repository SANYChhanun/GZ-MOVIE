// src/features/admin/AdminPanel.jsx
// Root composition for the whole Admin Dashboard: owns which section is active
// and renders AdminLayout around the matching page from pages/admin/.
//
// NOTE: this is a stand-in for real routing. Once router.jsx / AdminRoute.jsx
// are wired up, each `case` below becomes a <Route path="..." element={<Page/>} />
// under an /admin/* branch, and AdminSidebar's onClick becomes a navigate() call.
import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { NAV } from "../../utils/constants";

import AdminDashboardPage from "../../pages/admin/AdminDashboardPage";
import MovieListPage from "../../pages/admin/MovieListPage";
import CategoryGenreManagementPage from "../../pages/admin/CategoryGenreManagementPage";
import BannerFeaturedContentPage from "../../pages/admin/BannerFeaturedContentPage";
import WalletTopUpManagementPage from "../../pages/admin/WalletTopUpManagementPage";
import PaymentManagementPage from "../../pages/admin/PaymentManagementPage";
import MembershipPlanManagementPage from "../../pages/admin/MembershipPlanManagementPage";
import UserListPage from "../../pages/admin/UserListPage";
import NotificationManagementPage from "../../pages/admin/NotificationManagementPage";
import SupportTicketManagementPage from "../../pages/admin/SupportTicketManagementPage";
import ReportsSystemSettingsPage from "../../pages/admin/ReportsSystemSettingsPage";

export default function AdminPanel() {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeLabel = NAV.flatMap((g) => g.items).find((i) => i.id === active)?.label || "Dashboard";

  const renderPage = () => {
    switch (active) {
      case "overview": return <AdminDashboardPage />;
      case "movies": return <MovieListPage />;
      case "categories": return <CategoryGenreManagementPage />;
      case "banners": return <BannerFeaturedContentPage />;
      case "wallet": return <WalletTopUpManagementPage />;
      case "payments": return <PaymentManagementPage />;
      case "membership": return <MembershipPlanManagementPage />;
      case "users": return <UserListPage />;
      case "notifications": return <NotificationManagementPage />;
      case "support": return <SupportTicketManagementPage />;
      case "settings": return <ReportsSystemSettingsPage />;
      default: return <AdminDashboardPage />;
    }
  };

  return (
    <AdminLayout
      active={active}
      setActive={setActive}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      sectionLabel={activeLabel}
    >
      {renderPage()}
    </AdminLayout>
  );
}
