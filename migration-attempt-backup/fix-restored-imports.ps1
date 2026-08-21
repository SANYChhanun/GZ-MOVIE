# fix-restored-imports.ps1
Write-Host "🔧 Fixing imports for restored files..." -ForegroundColor Yellow

# ជួសជុល Admin Pages
Get-ChildItem -Path "src\features\admin\pages" -Filter "*.jsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # កែ components/common/ → components/ui/
    $content = $content -replace "from ['""](?:\.\./)*components/common/", "from '../../../components/ui/"
    $content = $content -replace "components/common/", "components/ui/"
    
    # កែ config/constants
    $content = $content -replace "from ['""](?:\.\./)*config/constants['""]", "from '../../../config/constants'"
    
    # កែ utils/constants → config/constants
    $content = $content -replace "from ['""](?:\.\./)*utils/constants['""]", "from '../../../config/constants'"
    
    # កែ adminApi
    $content = $content -replace "from ['""](?:\.\./)*api/adminApi['""]", "from '../adminApi'"
    $content = $content -replace "from ['""](?:\.\./)*features/admin/adminApi['""]", "from '../adminApi'"
    
    # កែ AuthContext
    $content = $content -replace "from ['""](?:\.\./)*contexts/AuthContext['""]", "from '../../../contexts/AuthContext'"
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✅ Fixed: $($_.Name)" -ForegroundColor Green
    }
}

# ជួសជុល Admin Components
Get-ChildItem -Path "src\features\admin\components" -Filter "*.jsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # កែ components/common/ → components/ui/
    $content = $content -replace "components/common/", "components/ui/"
    
    # កែ config/constants
    $content = $content -replace "from ['""](?:\.\./)*config/constants['""]", "from '../../../config/constants'"
    
    # កែ adminApi
    $content = $content -replace "from ['""](?:\.\./)*api/adminApi['""]", "from '../adminApi'"
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✅ Fixed: $($_.Name)" -ForegroundColor Green
    }
}

# ជួសជុល Auth Pages
Get-ChildItem -Path "src\features\auth\pages" -Filter "*.jsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # កែ AuthContext
    $content = $content -replace "from ['""](?:\.\./)*contexts/AuthContext['""]", "from '../../../contexts/AuthContext'"
    
    # កែ authApi
    $content = $content -replace "from ['""](?:\.\./)*api/authApi['""]", "from '../authApi'"
    
    # កែ config/constants
    $content = $content -replace "from ['""](?:\.\./)*config/constants['""]", "from '../../../config/constants'"
    $content = $content -replace "from ['""](?:\.\./)*utils/constants['""]", "from '../../../config/constants'"
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✅ Fixed: $($_.Name)" -ForegroundColor Green
    }
}

# ជួសជុល Movie Pages
Get-ChildItem -Path "src\features\movies\pages" -Filter "*.jsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # កែ components/common/ → components/ui/
    $content = $content -replace "components/common/", "components/ui/"
    
    # កែ components/layout/
    $content = $content -replace "from ['""](?:\.\./)*components/layout/", "from '../../../components/layout/"
    
    # កែ config/constants
    $content = $content -replace "from ['""](?:\.\./)*config/constants['""]", "from '../../../config/constants'"
    
    # កែ moviesApi
    $content = $content -replace "from ['""](?:\.\./)*api/moviesApi['""]", "from '../moviesApi'"
    
    # កែ AuthContext
    $content = $content -replace "from ['""](?:\.\./)*contexts/AuthContext['""]", "from '../../../contexts/AuthContext'"
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✅ Fixed: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 All restored files fixed!" -ForegroundColor Cyan
