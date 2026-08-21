# restore-from-git-correct.ps1
Write-Host "🔄 Restoring files from Git..." -ForegroundColor Yellow

# ស្តារឯកសារទាំងអស់ពី Git
$filesToRestore = @(
    "src/components/Header.jsx",
    "src/components/Footer.jsx",
    "src/pages/LoginPage.jsx",
    "src/pages/SignUpPage.jsx",
    "src/pages/HomePage.jsx",
    "src/pages/PricingPage.jsx",
    "src/pages/admin/AdminDashboardPage.jsx",
    "src/pages/admin/BannerFeaturedContentPage.jsx",
    "src/pages/admin/CategoryGenreManagementPage.jsx",
    "src/pages/admin/MembershipPlanManagementPage.jsx",
    "src/pages/admin/MovieListPage.jsx",
    "src/pages/admin/NotificationManagementPage.jsx",
    "src/pages/admin/PaymentManagementPage.jsx",
    "src/pages/admin/ReportsSystemSettingsPage.jsx",
    "src/pages/admin/SupportTicketManagementPage.jsx",
    "src/pages/admin/UserListPage.jsx",
    "src/pages/admin/WalletTopUpManagementPage.jsx",
    "src/pages/movies/MovieDetailPage.jsx",
    "src/pages/movies/MovieLibraryPage.jsx",
    "src/pages/watch/VideoPlayerPage.jsx",
    "src/components/common/Badge.jsx",
    "src/components/common/Field.jsx",
    "src/components/common/GenreDropdown.jsx",
    "src/components/common/IconBtn.jsx",
    "src/components/common/SectionHeader.jsx",
    "src/components/common/StatCard.jsx",
    "src/components/common/Table.jsx",
    "src/components/common/Toggle.jsx"
)

$successCount = 0
$failCount = 0

foreach ($file in $filesToRestore) {
    # ស្តារឯកសារពី Git
    git checkout HEAD -- $file 2>$null
    
    if ($?) {
        Write-Host "✅ Restored: $file" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "⚠️ Not found: $file" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host "`n📊 Results:" -ForegroundColor Cyan
Write-Host "✅ Restored: $successCount files" -ForegroundColor Green
Write-Host "❌ Failed: $failCount files" -ForegroundColor Red

Write-Host "`n🎉 Restoration completed!" -ForegroundColor Cyan
