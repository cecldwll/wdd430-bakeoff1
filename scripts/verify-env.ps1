# PowerShell version of environment verification

function Test-EnvironmentSetup {
    Write-Host "🔍 Verifying environment variables..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if .env.local exists
    if (-not (Test-Path "frontend\.env.local")) {
        Write-Host "❌ frontend\.env.local not found" -ForegroundColor Red
        Write-Host "   Please copy .env.example to frontend\.env.local and fill in your credentials"
        return $false
    }
    
    # Check required variables
    $requiredVars = @("PUBLIC_SUPABASE_URL", "PUBLIC_SUPABASE_ANON_KEY")
    $missingVars = @()
    
    $envContent = Get-Content "frontend\.env.local"
    
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch "^$var=") {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "❌ Missing required variables:" -ForegroundColor Red
        foreach ($var in $missingVars) {
            Write-Host "   - $var"
        }
        return $false
    }
    
    Write-Host "✅ All required environment variables are configured" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend environment:" -ForegroundColor Cyan
    $envContent | Select-String "PUBLIC_SUPABASE_URL" | ForEach-Object { $_ -replace "=.*", "=***" }
    Write-Host ""
    Write-Host "🚀 Ready to run: npm run dev" -ForegroundColor Green
    
    return $true
}

# Run verification
Test-EnvironmentSetup
