# fix-all-remaining-imports.ps1
Write-Host "🔧 Fixing all remaining import paths..." -ForegroundColor Yellow

$successCount = 0
$failCount = 0

# មុខងារសម្រាប់កែសម្រួលឯកសារ
function Fix-Import {
    param(
        [string]$FilePath,
        [string]$OldPattern,
        [string]$NewPattern
    )
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        $original = $content
        
        $content = $content -replace [regex]::Escape($OldPattern), $NewPattern
        
        if ($content -ne $original) {
            Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed: $FilePath" -ForegroundColor Green
            Write-Host "   $OldPattern → $NewPattern" -ForegroundColor Gray
            return $true
        } else {
            Write-Host "⚠️ Not found in: $FilePath" -ForegroundColor Yellow
            Write-Host "   Looking for: $OldPattern" -ForegroundColor Gray
            return $false
        }
    } else {
        Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
        return $false
    }
}

# 1. កែ Auth Pages - contexts/AuthContext
Write-Host "`n1. Fixing Auth Pages..." -ForegroundColor Cyan
$result = Fix-Import -FilePath "src\features\auth\pages\LoginPage.jsx" -OldPattern "from '../../contexts/AuthContext'" -NewPattern "from '../../../contexts/AuthContext'"
if ($result) { $successCount++ } else { $failCount++ }

$result = Fix-Import -FilePath "src\features\auth\pages\SignUpPage.jsx" -OldPattern "from '../../contexts/AuthContext'" -NewPattern "from '../../../contexts/AuthContext'"
if ($result) { $successCount++ } else { $failCount++ }

# 2. កែ Movie Pages - components/layout
Write-Host "`n2. Fixing Movie Pages..." -ForegroundColor Cyan
$result = Fix-Import -FilePath "src\features\movies\pages\MovieLibraryPage.jsx" -OldPattern "from '../components/layout/Footer'" -NewPattern "from '../../../components/layout/Footer'"
if ($result) { $successCount++ } else { $failCount++ }

$result = Fix-Import -FilePath "src\features\movies\pages\MovieDetailPage.jsx" -OldPattern "from '../components/layout/Header'" -NewPattern "from '../../../components/layout/Header'"
if ($result) { $successCount++ } else { $failCount++ }

$result = Fix-Import -FilePath "src\features\movies\pages\MovieDetailPage.jsx" -OldPattern "from '../components/layout/Footer'" -NewPattern "from '../../../components/layout/Footer'"
if ($result) { $successCount++ } else { $failCount++ }

# 3. កែ Admin Pages - config/constants
Write-Host "`n3. Fixing Admin Pages - config/constants..." -ForegroundColor Cyan

$adminPages = @(
    "src\features\admin\pages\UserListPage.jsx",
    "src\features\admin\pages\BannerFeaturedContentPage.jsx",
    "src\features\admin\pages\MembershipPlanManagementPage.jsx",
    "src\features\admin\pages\NotificationManagementPage.jsx",
    "src\features\admin\pages\SupportTicketManagementPage.jsx",
    "src\features\admin\pages\PaymentManagementPage.jsx",
    "src\features\admin\pages\WalletTopUpManagementPage.jsx",
    "src\features\admin\pages\ReportsSystemSettingsPage.jsx"
)

foreach ($page in $adminPages) {
    $result = Fix-Import -FilePath $page -OldPattern "from '../config/constants'" -NewPattern "from '../../../config/constants'"
    if ($result) { $successCount++ } else { $failCount++ }
}

# 4. កែ Header - api/axiosClient
Write-Host "`n4. Fixing Header - api/axiosClient..." -ForegroundColor Cyan
$result = Fix-Import -FilePath "src\components\layout\Header.jsx" -OldPattern "from '../api/axiosClient'" -NewPattern "from '../../api/axiosClient'"
if ($result) { $successCount++ } else { $failCount++ }

# 5. កែ Footer - api/axiosClient (បើមាន)
$result = Fix-Import -FilePath "src\components\layout\Footer.jsx" -OldPattern "from '../api/axiosClient'" -NewPattern "from '../../api/axiosClient'"
if ($result) { $successCount++ } else { $failCount++ }

# បង្ហាញលទ្ធផល
Write-Host "`n📊 Results:" -ForegroundColor Cyan
Write-Host "✅ Fixed: $successCount files" -ForegroundColor Green
Write-Host "❌ Failed: $failCount files" -ForegroundColor Red

Write-Host "`n🎉 All fixes completed!" -ForegroundColor Cyan
