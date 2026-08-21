// src/features/admin/mockData.js
// Placeholder data standing in for real calls to src/api/adminApi.js, moviesApi.js, etc.
// Swap each export for a fetch from the matching endpoint listed in the backend spec
// (e.g. INITIAL_MOVIES -> GET /api/movies/, TOPUPS -> GET /api/wallet/history/).

export const REVENUE_DATA = [
  { day: "Jul 26", revenue: 820 }, { day: "Jul 27", revenue: 932 },
  { day: "Jul 28", revenue: 901 }, { day: "Jul 29", revenue: 1120 },
  { day: "Jul 30", revenue: 1050 }, { day: "Jul 31", revenue: 1284 },
  { day: "Aug 01", revenue: 1390 }, { day: "Aug 02", revenue: 1210 },
  { day: "Aug 03", revenue: 1330 }, { day: "Aug 04", revenue: 1470 },
  { day: "Aug 05", revenue: 1510 }, { day: "Aug 06", revenue: 1605 },
  { day: "Aug 07", revenue: 1690 }, { day: "Aug 08", revenue: 1420 },
];

export const TOP_MOVIES_DATA = [
  { title: "Sunrise / Tonle Sap", views: 894 },
  { title: "Last Boat to Kampot", views: 1120 },
  { title: "Mekong Nights", views: 679 },
  { title: "The Grand Sokha", views: 541 },
  { title: "Angkor Twilight", views: 482 },
];

export const INITIAL_MOVIES = [
  { id: 1, title: "Angkor Twilight", category: "Drama", access: "Member", status: "Published", year: 2024, views: "48.2K", rating: 8.4 },
  { id: 2, title: "The Last Boat to Kampot", category: "Drama", access: "Free", status: "Published", year: 2023, views: "112K", rating: 7.9 },
  { id: 3, title: "Neon Phnom", category: "Action", access: "Purchase", status: "Published", year: 2025, views: "31.7K", rating: 8.7 },
  { id: 4, title: "Mekong Nights", category: "Thriller", access: "Member", status: "Published", year: 2024, views: "67.9K", rating: 8.1 },
  { id: 5, title: "Bokor Hill Mystery", category: "Mystery", access: "Purchase", status: "Draft", year: 2025, views: "—", rating: "—" },
  { id: 6, title: "Sunrise Over Tonle Sap", category: "Documentary", access: "Free", status: "Published", year: 2022, views: "89.4K", rating: 8.9 },
  { id: 7, title: "The Grand Sokha", category: "Comedy", access: "Member", status: "Published", year: 2023, views: "54.1K", rating: 7.6 },
  { id: 8, title: "Iron Silk", category: "Action", access: "Purchase", status: "Published", year: 2025, views: "22.3K", rating: 8.2 },
];

export const INITIAL_USERS = [
  { id: 1, name: "Sokha Chan", email: "sokha.chan@gmail.com", tier: "VIP", devices: 2, joined: "Jan 12, 2025" },
  { id: 2, name: "Dara Pich", email: "dara.pich@yahoo.com", tier: "Free", devices: 1, joined: "Mar 04, 2025" },
  { id: 3, name: "Ranith Kim", email: "ranith.kim@gmail.com", tier: "Premium", devices: 3, joined: "Nov 21, 2024" },
  { id: 4, name: "Sreymom Heng", email: "sreymom.h@gmail.com", tier: "VIP", devices: 2, joined: "Feb 18, 2025" },
  { id: 5, name: "John Alvarez", email: "j.alvarez@outlook.com", tier: "Basic", devices: 1, joined: "Jun 09, 2025" },
  { id: 6, name: "Li Wei", email: "li.wei88@gmail.com", tier: "Free", devices: 1, joined: "Jul 30, 2025" },
];

export const TOPUPS = [
  { id: "TXN-8841", user: "Sokha Chan", amount: "$10.00", method: "ABA KHQR", status: "Completed", date: "Aug 07, 2026" },
  { id: "TXN-8840", user: "Ranith Kim", amount: "$25.00", method: "ABA KHQR", status: "Completed", date: "Aug 07, 2026" },
  { id: "TXN-8839", user: "John Alvarez", amount: "$5.00", method: "Bakong", status: "Pending", date: "Aug 06, 2026" },
  { id: "TXN-8838", user: "Li Wei", amount: "$10.00", method: "ABA KHQR", status: "Failed", date: "Aug 06, 2026" },
  { id: "TXN-8837", user: "Sreymom Heng", amount: "$50.00", method: "ABA KHQR", status: "Completed", date: "Aug 05, 2026" },
];

export const PAYMENTS = [
  { id: "PAY-2291", user: "Sokha Chan", item: "VIP Membership — Monthly", amount: "$9.99", method: "ABA KHQR", status: "Completed", date: "Aug 07, 2026" },
  { id: "PAY-2290", user: "Ranith Kim", item: "Iron Silk (Purchase)", amount: "$2.49", method: "Wallet", status: "Completed", date: "Aug 07, 2026" },
  { id: "PAY-2289", user: "Dara Pich", item: "Premium Membership — Yearly", amount: "$59.99", method: "ABA KHQR", status: "Refunded", date: "Aug 05, 2026" },
  { id: "PAY-2288", user: "John Alvarez", item: "Neon Phnom (Purchase)", amount: "$1.99", method: "Wallet", status: "Completed", date: "Aug 04, 2026" },
];

export const PLANS = [
  { name: "Free", price: "$0", period: "forever", subscribers: "5,204", features: ["Ad-supported catalog", "SD quality", "1 device"] },
  { name: "Basic", price: "$2.99", period: "/mo", subscribers: "1,842", features: ["No ads", "HD quality", "1 device", "Offline downloads"] },
  { name: "Premium", price: "$5.99", period: "/mo", subscribers: "2,110", features: ["No ads", "Full HD", "2 devices", "Early access"] },
  { name: "VIP", price: "$9.99", period: "/mo", subscribers: "1,204", highlighted: true, features: ["No ads", "4K + HDR", "4 devices", "Early access", "Exclusive originals"] },
];

export const INITIAL_TICKETS = [
  { id: "TCK-1042", subject: "Cannot play Angkor Twilight on Smart TV", user: "Sreymom Heng", priority: "High", status: "Open", date: "Aug 08, 2026" },
  { id: "TCK-1041", subject: "Top-up not reflected in wallet", user: "John Alvarez", priority: "High", status: "In Progress", date: "Aug 07, 2026" },
  { id: "TCK-1040", subject: "Request refund for duplicate charge", user: "Dara Pich", priority: "Medium", status: "Open", date: "Aug 06, 2026" },
  { id: "TCK-1039", subject: "Subtitle sync issue on Mekong Nights", user: "Li Wei", priority: "Low", status: "Resolved", date: "Aug 04, 2026" },
];

export const INITIAL_NOTIFS = [
  { id: 1, title: "VIP membership renews in 3 days", audience: "VIP members expiring soon", sent: "Aug 07, 2026", reach: "312" },
  { id: 2, title: "New this week: Iron Silk", audience: "All users", sent: "Aug 05, 2026", reach: "8,932" },
  { id: 3, title: "Weekend promo: 20% off Premium", audience: "Free tier users", sent: "Aug 02, 2026", reach: "5,204" },
];

export const BANNERS = [
  { title: "Iron Silk — Now Streaming", slot: "Hero", active: true },
  { title: "20% Off Premium — Weekend Promo", slot: "Homepage strip", active: true },
  { title: "Angkor Twilight — VIP Early Access", slot: "Hero", active: false },
];
