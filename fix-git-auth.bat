@echo off
echo Fixing Git Authentication for Sultan2026
echo =========================================

echo Current Git configuration:
git config --global user.name
git config --global user.email

echo.
echo Clearing cached credentials...
git config --global --unset credential.helper
git config --global credential.helper manager-core

echo.
echo Clearing Windows Credential Manager cache...
cmdkey /list | findstr git
echo.
echo To clear cached credentials, run:
echo cmdkey /delete:git:https://github.com

echo.
echo After clearing credentials, try pushing again:
echo git push origin Quizcraft

echo.
echo If you still have issues, you may need to:
echo 1. Use a Personal Access Token instead of password
echo 2. Set up SSH keys
echo 3. Check repository permissions

pause


