# restore-khmer-from-git.ps1
Write-Host "🔄 Restoring files with correct Khmer text from Git..." -ForegroundColor Yellow

# បញ្ជីឯកសារដែលត្រូវស្តារ (ពី Git → ទៅកន្លែងថ្មី)
$restoreMap = @(
    @{ Git = "src/components/Header.jsx"; New = "src/components/layout/Header.jsx" },
    @{ Git = "src/components/Footer.jsx"; New = "src/components/layout/Footer.jsx" },
    @{ Git = "src/pages/LoginPage.jsx"; New = "src/features/auth/pages/LoginPage.jsx" },
    @{ Git = "src/pages/SignUpPage.jsx"; New = "src/features/auth/pages/SignUpPage.jsx" },
    @{ Git = "src/pages/HomePage.jsx"; New = "src/pages/HomePage.jsx" },
    @{ Git = "src/pages/PricingPage.jsx"; New = "src/pages/PricingPage.jsx" },
    @{ Git = "src/pages/admin/AdminDashboardPage.jsx"; New = "src/features/admin/pages/AdminDashboardPage.jsx" },
    @{ Git = "src/pages/admin/BannerFeaturedContentPage.jsx"; New = "src/features/admin/pages/BannerFeaturedContentPage.jsx" },
    @{ Git = "src/pages/admin/CategoryGenreManagementPage.jsx"; New = "src/features/admin/pages/CategoryGenreManagementPage.jsx" },
    @{ Git = "src/pages/admin/MembershipPlanManagementPage.jsx"; New = "src/features/admin/pages/MembershipPlanManagementPage.jsx" },
    @{ Git = "src/pages/admin/MovieListPage.jsx"; New = "src/features/admin/pages/MovieListPage.jsx" },
    @{ Git = "src/pages/admin/NotificationManagementPage.jsx"; New = "src/features/admin/pages/NotificationManagementPage.jsx" },
    @{ Git = "src/pages/admin/PaymentManagementPage.jsx"; New = "src/features/admin/pages/PaymentManagementPage.jsx" },
    @{ Git = "src/pages/admin/ReportsSystemSettingsPage.jsx"; New = "src/features/admin/pages/ReportsSystemSettingsPage.jsx" },
    @{ Git = "src/pages/admin/SupportTicketManagementPage.jsx"; New = "src/features/admin/pages/SupportTicketManagementPage.jsx" },
    @{ Git = "src/pages/admin/UserListPage.jsx"; New = "src/features/admin/pages/UserListPage.jsx" },
    @{ Git = "src/pages/admin/WalletTopUpManagementPage.jsx"; New = "src/features/admin/pages/WalletTopUpManagementPage.jsx" },
    @{ Git = "src/pages/movies/MovieDetailPage.jsx"; New = "src/features/movies/pages/MovieDetailPage.jsx" },
    @{ Git = "src/pages/movies/MovieLibraryPage.jsx"; New = "src/features/movies/pages/MovieLibraryPage.jsx" },
    @{ Git = "src/pages/watch/VideoPlayerPage.jsx"; New = "src/features/watch/pages/VideoPlayerPage.jsx" },
    @{ Git = "src/components/common/Badge.jsx"; New = "src/components/ui/Badge.jsx" },
    @{ Git = "src/components/common/Field.jsx"; New = "src/components/ui/Field.jsx" },
    @{ Git = "src/components/common/GenreDropdown.jsx"; New = "src/components/ui/GenreDropdown.jsx" },
    @{ Git = "src/components/common/IconBtn.jsx"; New = "src/components/ui/IconBtn.jsx" },
    @{ Git = "src/components/common/SectionHeader.jsx"; New = "src/components/ui/SectionHeader.jsx" },
    @{ Git = "src/components/common/StatCard.jsx"; New = "src/components/ui/StatCard.jsx" },
    @{ Git = "src/components/common/Table.jsx"; New = "src/components/ui/Table.jsx" },
    @{ Git = "src/components/common/Toggle.jsx"; New = "src/components/ui/Toggle.jsx" }
)

$successCount = 0
$failCount = 0

foreach ($map in $restoreMap) {
    # ពិនិត្យមើលថាឯកសារមាននៅក្នុង Git ទេ
    $gitContent = git show "HEAD:$($map.Git)" 2>$null
    
    if ($gitContent) {
        # រក្សាទុកទៅកន្លែងថ្មី
        $gitContent | Out-File -FilePath $map.New -Encoding UTF8 -Force
        Write-Host "✅ Restored: $($map.Git) → $($map.New)" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "⚠️ Not found in Git: $($map.Git)" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host "`n📊 Results:" -ForegroundColor Cyan
Write-Host "✅ Restored: $successCount files" -ForegroundColor Green
Write-Host "❌ Failed: $failCount files" -ForegroundColor Red

Write-Host "`n🎉 Restoration completed!" -ForegroundColor Cyan
