# fix-quotes.ps1
Write-Host "🔧 Fixing quotation marks in all files..." -ForegroundColor Yellow

# ជួសជុលឯកសារទាំងអស់ដែលមានបញ្ហា
Get-ChildItem -Path "src\features\admin\pages" -Filter "*.jsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # កែ import statements ដែលមានបញ្ហា
    $content = $content -replace "from\s+""([^""]+)"";", "from '$1';"
    $content = $content -replace "from\s+'([^']+)"";", "from '$1';"
    $content = $content -replace "from\s+""([^""]+)';", "from '$1';"
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✅ Fixed quotes: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Quotation marks fixed!" -ForegroundColor Cyan
