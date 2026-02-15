@echo off
setlocal EnableDelayedExpansion

echo ===================================================
echo   GitHub Setup & Push Helper for FarmerProject
echo ===================================================
echo.
echo This script will help you push your code to:
echo https://github.com/Arpitj9974/farmer_project
echo.
echo ---------------------------------------------------
echo IMPORTANT: You need a GitHub Personal Access Token (PAT).
echo If you don't have one, create it here:
echo https://github.com/settings/tokens
echo (Select 'repo' scope when creating the token)
echo ---------------------------------------------------
echo.

:ASK_TOKEN
set /p TOKEN="Enter your GitHub Personal Access Token (starts with ghp_): "
if "%TOKEN%"=="" (
    echo Token cannot be empty.
    goto ASK_TOKEN
)

echo.
echo Configuring remote 'origin' with your token...
git remote remove origin 2>nul
git remote add origin https://Arpitj9974:%TOKEN%@github.com/Arpitj9974/farmer_project.git

echo.
echo Verifying remote URL...
git remote -v

echo.
echo Dimensions checked. Pushing code to main branch...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ PUSH FAILED!
    echo.
    echo Possible causes:
    echo 1. The token is invalid or expired.
    echo 2. The repository 'farmer_project' does not exist on GitHub.
    echo    (Create it here: https://github.com/new)
    echo 3. You don't have permission to push to this repo.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ PUSH SUCCESSFUL!
echo.
pause
