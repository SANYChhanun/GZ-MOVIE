# fix-all-imports.ps1
# កែសម្រួល import paths ទាំងអស់ត្រង់កន្លែងត្រឹមត្រូវ

Write-Host "🔧 Fixing all import paths..." -ForegroundColor Yellow

# 1. កែ main.jsx
Write-Host "`n1. Fixing main.jsx..." -ForegroundColor Cyan
$mainPath = "src\main.jsx"
if (Test-Path $mainPath) {
    $content = Get-Content $mainPath -Raw
    $content = $content -replace "from ['""]\./app/App\.jsx['""]", "from './App.jsx'"
    $content = $content -replace "from ['""]\./app/App['""]", "from './App'"
    Set-Content -Path $mainPath -Value $content -Encoding UTF8 -NoNewline
    Write-Host "✅ Fixed main.jsx" -ForegroundColor Green
} else {
    Write-Host "❌ main.jsx not found!" -ForegroundColor Red
}

# 2. កែ App.jsx
Write-Host "`n2. Fixing App.jsx..." -ForegroundColor Cyan
$appPath = "src\App.jsx"
if (Test-Path $appPath) {
    $content = Get-Content $appPath -Raw
    
    # កែ router import
    $content = $content -replace "from ['""]\./app/router['""]", "from './router'"
    
    # កែ AuthContext import
    $content = $content -replace "from ['""]\.\./contexts/AuthContext['""]", "from './contexts/AuthContext'"
    
    Set-Content -Path $appPath -Value $content -Encoding UTF8 -NoNewline
    Write-Host "✅ Fixed App.jsx" -ForegroundColor Green
} else {
    Write-Host "❌ App.jsx not found!" -ForegroundColor Red
}

# 3. ពិនិត្យមើលលទ្ធផល
Write-Host "`n3. Verifying fixes..." -ForegroundColor Cyan
Write-Host "`n=== main.jsx ===" -ForegroundColor Yellow
Get-Content $mainPath | Select-Object -First 8

Write-Host "`n=== App.jsx ===" -ForegroundColor Yellow
Get-Content $appPath

Write-Host "`n🎉 All fixes completed!" -ForegroundColor Cyan
