# QuizCraft Auto-Push PowerShell Script
Write-Host "QuizCraft Auto-Push Script" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host "Committing changes..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Auto-commit: $timestamp"

Write-Host "Pushing to repository..." -ForegroundColor Yellow
git push origin Quizcraft

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to repository!" -ForegroundColor Green
} else {
    Write-Host "❌ Push failed. Please check your Git credentials." -ForegroundColor Red
    Write-Host "Run fix-git-setup.bat to resolve authentication issues." -ForegroundColor Yellow
}

Read-Host "Press Enter to continue"










