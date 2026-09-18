@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo   Global-Setu: Automatic GitHub Sync & Deploy Script
echo ======================================================================
echo.

cd /d "%~dp0"

:: Check if git is available
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set GIT_CMD=git
) else if exist "C:\Program Files\Git\cmd\git.exe" (
    set GIT_CMD="C:\Program Files\Git\cmd\git.exe"
) else (
    echo [ERROR] Git was not found in PATH or standard directory!
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo [1/4] Checking Git repository configuration...
if not exist ".git" (
    echo Initializing Git repository...
    %GIT_CMD% init
)

%GIT_CMD% branch -M main

:: Configure remote origin
set TARGET_REPO=INTERNAL-HACKATHON
set GITHUB_USER=Prem032506
set REMOTE_URL=https://github.com/%GITHUB_USER%/%TARGET_REPO%.git

%GIT_CMD% remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Setting remote origin to %REMOTE_URL%...
    %GIT_CMD% remote add origin %REMOTE_URL%
) else (
    %GIT_CMD% remote set-url origin %REMOTE_URL%
)

echo.
echo [2/4] Checking working tree...
%GIT_CMD% add -A
set COMMIT_MSG=fix: resolve route optimization service connection error and update resilient AI routing engine
%GIT_CMD% commit -m "%COMMIT_MSG%" 2>nul

echo.
echo [3/4] Pushing to GitHub (%REMOTE_URL%)...
echo If prompted, enter your GitHub credentials or Personal Access Token (PAT).
%GIT_CMD% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo   SUCCESS! Your project has been pushed to GitHub!
    echo   Repository: https://github.com/%GITHUB_USER%/%TARGET_REPO%
    echo   Netlify will automatically trigger and deploy this new version.
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo   [NOTICE] Push could not complete automatically.
    echo   If authentication failed, you may need a GitHub Personal Access Token (PAT)
    echo   or you can sign in via Git Credential Manager.
    echo ======================================================================
)

echo.
pause
