# fix-all-empty-imports.ps1
Write-Host "🔧 Fixing all empty imports in Admin Pages..." -ForegroundColor Yellow

# ជួសជុល AdminDashboardPage.jsx
$content = Get-Content "src\features\admin\pages\AdminDashboardPage.jsx" -Raw
$content = $content -replace "from '';", "from '../../../components/ui/SectionHeader';"
$content = $content -replace "from '';", "from '../../../components/ui/StatCard';"
Set-Content -Path "src\features\admin\pages\AdminDashboardPage.jsx" -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ Fixed: AdminDashboardPage.jsx" -ForegroundColor Green

# ជួសជុល BannerFeaturedContentPage.jsx
$content = Get-Content "src\features\admin\pages\BannerFeaturedContentPage.jsx" -Raw
$content = $content -replace "from '';", "from 'react';"
$content = $content -replace "} from '';", "} from '../../../components/ui/IconBtn';"
$content = $content -replace "from '';", "from '../../../components/ui/SectionHeader';"
$content = $content -replace "from '';", "from '../../../components/ui/Badge';"
$content = $content -replace "from '';", "from '../../../components/ui/IconBtn';"
Set-Content -Path "src\features\admin\pages\BannerFeaturedContentPage.jsx" -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ Fixed: BannerFeaturedContentPage.jsx" -ForegroundColor Green

# ជួសជុល CategoryGenreManagementPage.jsx
$content = Get-Content "src\features\admin\pages\CategoryGenreManagementPage.jsx" -Raw
$content = $content -replace "from '';", "from 'react';"
$content = $content -replace "} from '';", "} from '../../../components/ui/IconBtn';"
Set-Content -Path "src\features\admin\pages\CategoryGenreManagementPage.jsx" -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ Fixed: CategoryGenreManagementPage.jsx" -ForegroundColor Green

# ជួសជុល MembershipPlanManagementPage.jsx
$content = Get-Content "src\features\admin\pages\MembershipPlanManagementPage.jsx" -Raw
$content = $content -replace "from '';", "from 'react';"
$content = $content -replace "from '';", "from 'lucide-react';"
$content = $content -replace "from '';", "from '../../../components/ui/SectionHeader';"
$content = $content -replace "from '';", "from '../../../components/ui/Badge';"
$content = $content -replace "from '';", "from '../components/EditPlanDrawer';"
Set-Content -Path "src\features\admin\pages\MembershipPlanManagementPage.jsx" -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ Fixed: MembershipPlanManagementPage.jsx" -ForegroundColor Green

# ជួសជុល MovieListPage.jsx
$content = Get-Content "src\features\admin\pages\MovieListPage.jsx" -Raw
$content = $content -replace "from '';", "from 'react';"
$content = $content -replace "from '';", "from 'lucide-react';"
$content = $content -replace "from '';", "from '../../../components/ui/SectionHeader';"
$content = $content -replace "from '';", "from '../../../components/ui/Badge';"
$content = $content -replace "from '';", "from '../../../components/ui/IconBtn';"
$content = $content -replace "from '';", "from '../../../components/ui/Table';"
$content = $content -replace "from'';", "from '../../../features/movies/components/AddMovieDrawer';"
$content = $content -replace "from '';", "from '../../../features/movies/components/MovieDetailDrawer';"
Set-Content -Path "src\features\admin\pages\MovieListPage.jsx" -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ Fixed: MovieListPage.jsx" -ForegroundColor Green

# ជួសជុល NotificationManagementPage.jsx
$content = Get-Content "src\features\admin\pages\NotificationManagementPage.jsx" -Raw
$content = $content -replace "from '';", "from 'react';"
$content = $content -replace "from '';", "from 'lucide-react';"
$content = $content -replace "from '';", "from '../../../components/ui/SectionHeader';"
$content = $content -replace "from '';", "from '../../../components/ui/Table';"
$content = $content -replace "from '';", "from '../../../components/ui/Field';"
$content = $content -replace "from '';", "from '../mockData';"
Set-Content -Path "src\features\admin\pages\NotificationManagementPage.jsx" -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ Fixed: NotificationManagementPage.jsx" -ForegroundColor Green

# ជួសជុល PaymentManagementPage.jsx
$content = Get-Content "src\features\admin\pages\PaymentManagementPage.jsx" -Raw
$content = $content -replace "from '';", "from '../../../components/ui/SectionHeader';"
$content = $content -replace "from '';", "from '../../../components/ui/Table';"
$content = $content -replace "from '';", "from '../../../components/ui/Badge';"
$content = $content -replace "from '';", "from '../mockData';"
Set-Content -Path "src\features\admin\pages\PaymentManagementPage.jsx" -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ Fixed: PaymentManagementPage.jsx" -ForegroundColor Green

# ជួសជុល ReportsSystemSettingsPage.jsx
$content = Get-Content "src\features\admin\pages\ReportsSystemSettingsPage.jsx" -Raw
$content = $content -replace "from '';", "from 'react';"
$content = $content -replace "from '';", "from '../../../components/ui/SectionHeader';"
$content = $content -replace "from '';", "from '../../../components/ui/Toggle';"
Set-Content -Path "src\features\admin\pages\ReportsSystemSettingsPage.jsx" -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ Fixed: ReportsSystemSettingsPage.jsx" -ForegroundColor Green

# ជួសជុល UserListPage.jsx
$content = Get-Content "src\features\admin\pages\UserListPage.jsx" -Raw
$content = $content -replace "from '';", "from 'react';"
$content = $content -replace "from '';", "from 'lucide-react';"
$content = $content -replace "from '';", "from '../../../components/ui/SectionHeader';"
$content = $content -replace "from '';", "from '../../../components/ui/Table';"
$content = $content -replace "from '';", "from '../../../components/ui/Badge';"
$content = $content -replace "from '';", "from '../../../components/ui/IconBtn';"
$content = $content -replace "from '';", "from '../mockData';"
Set-Content -Path "src\features\admin\pages\UserListPage.jsx" -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ Fixed: UserListPage.jsx" -ForegroundColor Green

# ជួសជុល WalletTopUpManagementPage.jsx
$content = Get-Content "src\features\admin\pages\WalletTopUpManagementPage.jsx" -Raw
$content = $content -replace "from '';", "from '../../../components/ui/SectionHeader';"
$content = $content -replace "from '';", "from '../../../components/ui/Table';"
$content = $content -replace "from '';", "from '../../../components/ui/Badge';"
$content = $content -replace "from '';", "from '../mockData';"
Set-Content -Path "src\features\admin\pages\WalletTopUpManagementPage.jsx" -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ Fixed: WalletTopUpManagementPage.jsx" -ForegroundColor Green

Write-Host "`n🎉 All empty imports fixed!" -ForegroundColor Cyan
