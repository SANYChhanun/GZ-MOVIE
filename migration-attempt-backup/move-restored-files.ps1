# move-restored-files.ps1
Write-Host "📦 Moving restored files to new locations..." -ForegroundColor Yellow

# ផ្លាស់ទីឯកសារទៅកន្លែងថ្មី
$moveMap = @(
    @{ Old = "src/components/Header.jsx"; New = "src/components/layout/Header.jsx" },
    @{ Old = "src/components/Footer.jsx"; New = "src/components/layout/Footer.jsx" },
    @{ Old = "src/pages/LoginPage.jsx"; New = "src/features/auth/pages/LoginPage.jsx" },
    @{ Old = "src/pages/SignUpPage.jsx"; New = "src/features/auth/pages/SignUpPage.jsx" },
    @{ Old = "src/pages/admin/AdminDashboardPage.jsx"; New = "src/features/admin/pages/AdminDashboardPage.jsx" },
    @{ Old = "src/pages/admin/BannerFeaturedContentPage.jsx"; New = "src/features/admin/pages/BannerFeaturedContentPage.jsx" },
    @{ Old = "src/pages/admin/CategoryGenreManagementPage.jsx"; New = "src/features/admin/pages/CategoryGenreManagementPage.jsx" },
    @{ Old = "src/pages/admin/MembershipPlanManagementPage.jsx"; New = "src/features/admin/pages/MembershipPlanManagementPage.jsx" },
    @{ Old = "src/pages/admin/MovieListPage.jsx"; New = "src/features/admin/pages/MovieListPage.jsx" },
    @{ Old = "src/pages/admin/NotificationManagementPage.jsx"; New = "src/features/admin/pages/NotificationManagementPage.jsx" },
    @{ Old = "src/pages/admin/PaymentManagementPage.jsx"; New = "src/features/admin/pages/PaymentManagementPage.jsx" },
    @{ Old = "src/pages/admin/ReportsSystemSettingsPage.jsx"; New = "src/features/admin/pages/ReportsSystemSettingsPage.jsx" },
    @{ Old = "src/pages/admin/SupportTicketManagementPage.jsx"; New = "src/features/admin/pages/SupportTicketManagementPage.jsx" },
    @{ Old = "src/pages/admin/UserListPage.jsx"; New = "src/features/admin/pages/UserListPage.jsx" },
    @{ Old = "src/pages/admin/WalletTopUpManagementPage.jsx"; New = "src/features/admin/pages/WalletTopUpManagementPage.jsx" },
    @{ Old = "src/pages/movies/MovieDetailPage.jsx"; New = "src/features/movies/pages/MovieDetailPage.jsx" },
    @{ Old = "src/pages/movies/MovieLibraryPage.jsx"; New = "src/features/movies/pages/MovieLibraryPage.jsx" },
    @{ Old = "src/pages/watch/VideoPlayerPage.jsx"; New = "src/features/watch/pages/VideoPlayerPage.jsx" },
    @{ Old = "src/components/common/Badge.jsx"; New = "src/components/ui/Badge.jsx" },
    @{ Old = "src/components/common/Field.jsx"; New = "src/components/ui/Field.jsx" },
    @{ Old = "src/components/common/GenreDropdown.jsx"; New = "src/components/ui/GenreDropdown.jsx" },
    @{ Old = "src/components/common/IconBtn.jsx"; New = "src/components/ui/IconBtn.jsx" },
    @{ Old = "src/components/common/SectionHeader.jsx"; New = "src/components/ui/SectionHeader.jsx" },
    @{ Old = "src/components/common/StatCard.jsx"; New = "src/components/ui/StatCard.jsx" },
    @{ Old = "src/components/common/Table.jsx"; New = "src/components/ui/Table.jsx" },
    @{ Old = "src/components/common/Toggle.jsx"; New = "src/components/ui/Toggle.jsx" }
)

foreach ($map in $moveMap) {
    if (Test-Path $map.Old) {
        # បង្កើត directory បើមិនទាន់មាន
        $dir = Split-Path $map.New -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
        }
        
        # ផ្លាស់ទីឯកសារ
        Move-Item -Force $map.Old $map.New
        Write-Host "✅ Moved: $($map.Old) → $($map.New)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Not found: $($map.Old)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Moving completed!" -ForegroundColor Cyan
