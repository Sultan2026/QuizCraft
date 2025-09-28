@echo off
echo QuizCraft Git Setup Fix
echo =======================

echo Current Git configuration:
git config --global user.name
git config --global user.email

echo.
echo To fix the push issue, you have two options:
echo.
echo Option 1: Update your Git credentials to match the repository owner
echo   git config --global user.name "Sultan2026"
echo   git config --global user.email "your-email@example.com"
echo.
echo Option 2: Update the remote URL to your own repository
echo   git remote set-url origin https://github.com/YOUR_USERNAME/QuizCraft.git
echo.
echo Option 3: Use SSH instead of HTTPS (recommended)
echo   git remote set-url origin git@github.com:Sultan2026/QuizCraft.git
echo.

echo Current remote URL:
git remote -v

echo.
echo After fixing, run auto-push.bat to push your changes.
pause


