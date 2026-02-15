@echo off
setlocal

echo ==========================================
echo GitHub Push Helper for FarmerConnect
echo ==========================================
echo.
echo Please enter your GitHub Personal Access Token (PAT).
echo Generate one here: https://github.com/settings/tokens (Select 'repo' scope)
echo.
set /p TOKEN="Enter Token: "

if "%TOKEN%"=="" (
    echo Token is required!
    exit /b 1
)

echo.
echo Pushing to https://github.com/Arpitj9974/farmer_project.git...
git remote set-url origin https://%TOKEN%@github.com/Arpitj9974/farmer_project.git
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Push failed! Check your token or repo name.
) else (
    echo.
    echo ✅ Push successful!
)

pause
