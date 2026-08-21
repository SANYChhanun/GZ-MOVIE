# fix-all-import-paths.ps1
Write-Host "🔧 Fixing all import paths..." -ForegroundColor Yellow

# បញ្ជីឯកសារដែលត្រូវកែ និងការជំនួស
$fixes = @(
    # [ឯកសារ] [ពាក្យចាស់] [ពាក្យថ្មី]
    
    # AuthContext.jsx
    @{ File = "src\contexts\AuthContext.jsx"; Old = "from './authApi'"; New = "from '../features/auth/authApi'" },
    
    # Auth Pages
    @{ File = "src\features\auth\pages\LoginPage.jsx"; Old = "from '../AuthContext'"; New = "from '../../contexts/AuthContext'" },
    @{ File = "src\features\auth\pages\SignUpPage.jsx"; Old = "from '../AuthContext'"; New = "from '../../contexts/AuthContext'" },
    
    # Admin Pages - SectionHeader
    @{ File = "src\features\admin\pages\WalletTopUpManagementPage.jsx"; Old = "from '../../../components/common/SectionHeader'"; New = "from '../../../components/ui/SectionHeader'" },
    @{ File = "src\features\admin\pages\PaymentManagementPage.jsx"; Old = "from '../../../components/common/SectionHeader'"; New = "from '../../../components/ui/SectionHeader'" },
    @{ File = "src\features\admin\pages\MembershipPlanManagementPage.jsx"; Old = "from '../../../components/common/SectionHeader'"; New = "from '../../../components/ui/SectionHeader'" },
    @{ File = "src\features\admin\pages\NotificationManagementPage.jsx"; Old = "from '../../../components/common/SectionHeader'"; New = "from '../../../components/ui/SectionHeader'" },
    @{ File = "src\features\admin\pages\MovieListPage.jsx"; Old = "from '../../../components/common/SectionHeader'"; New = "from '../../../components/ui/SectionHeader'" },
    @{ File = "src\features\admin\pages\SupportTicketManagementPage.jsx"; Old = "from '../../../components/common/SectionHeader'"; New = "from '../../../components/ui/SectionHeader'" },
    @{ File = "src\features\admin\pages\UserListPage.jsx"; Old = "from '../../../components/common/SectionHeader'"; New = "from '../../../components/ui/SectionHeader'" },
    @{ File = "src\features\admin\pages\ReportsSystemSettingsPage.jsx"; Old = "from '../../../components/common/SectionHeader'"; New = "from '../../../components/ui/SectionHeader'" },
    @{ File = "src\features\admin\pages\AdminDashboardPage.jsx"; Old = "from '../../../components/common/SectionHeader'"; New = "from '../../../components/ui/SectionHeader'" },
    @{ File = "src\features\admin\pages\BannerFeaturedContentPage.jsx"; Old = "from '../../../components/common/SectionHeader'"; New = "from '../../../components/ui/SectionHeader'" },
    
    # Admin Pages - constants
    @{ File = "src\features\admin\pages\CategoryGenreManagementPage.jsx"; Old = "from '../config/constants'"; New = "from '../../../config/constants'" },
    @{ File = "src\features\admin\components\EditPlanDrawer.jsx"; Old = "from '../config/constants'"; New = "from '../../../config/constants'" },
    
    # Movies Pages
    @{ File = "src\features\movies\pages\MovieLibraryPage.jsx"; Old = "from '../components/layout/Header'"; New = "from '../../../components/layout/Header'" },
    @{ File = "src\features\movies\pages\MovieDetailPage.jsx"; Old = "from '../contexts/AuthContext'"; New = "from '../../../contexts/AuthContext'" },
    
    # Watch Pages
    @{ File = "src\features\watch\pages\VideoPlayerPage.jsx"; Old = "from '../contexts/AuthContext'"; New = "from '../../../contexts/AuthContext'" },
    
    # Movies Components
    @{ File = "src\features\movies\components\MovieCard.jsx"; Old = "from '../contexts/AuthContext'"; New = "from '../../../contexts/AuthContext'" },
    @{ File = "src\features\movies\components\AddMovieDrawer.jsx"; Old = "from '../config/constants'"; New = "from '../../../config/constants'" },
    
    # Layout Components
    @{ File = "src\components\layout\Header.jsx"; Old = "from '../contexts/AuthContext'"; New = "from '../../contexts/AuthContext'" },
    @{ File = "src\components\layout\Footer.jsx"; Old = "from '../contexts/AuthContext'"; New = "from '../../contexts/AuthContext'" }
)

$successCount = 0
$failCount = 0

foreach ($fix in $fixes) {
    if (Test-Path $fix.File) {
        $content = Get-Content $fix.File -Raw
        $original = $content
        
        $content = $content -replace [regex]::Escape($fix.Old), $fix.New
        
        if ($content -ne $original) {
            Set-Content -Path $fix.File -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed: $($fix.File)" -ForegroundColor Green
            Write-Host "   $($fix.Old) → $($fix.New)" -ForegroundColor Gray
            $successCount++
        } else {
            Write-Host "⚠️ Pattern not found in: $($fix.File)" -ForegroundColor Yellow
            Write-Host "   Looking for: $($fix.Old)" -ForegroundColor Gray
            $failCount++
        }
    } else {
        Write-Host "❌ File not found: $($fix.File)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n📊 Results:" -ForegroundColor Cyan
Write-Host "✅ Fixed: $successCount files" -ForegroundColor Green
Write-Host "❌ Failed: $failCount files" -ForegroundColor Red

Write-Host "`n🎉 Import path fixing completed!" -ForegroundColor Cyan
