@echo off
SET GIT="C:\Program Files\Git\cmd\git.exe"

echo =============================================
echo   Global-Setu GitHub Push Script
echo =============================================
echo.

cd /d "M:\sih project\DD"

echo Current git status:
%GIT% status
echo.

echo Enter your GitHub repository name (e.g. global-setu):
set /p REPO_NAME="> "

echo.
echo Adding remote origin...
%GIT% remote remove origin 2>nul
%GIT% remote add origin https://github.com/Prem032506/%REPO_NAME%.git

echo.
echo Pushing to GitHub...
echo (When prompted, enter your GitHub username and Personal Access Token as password)
echo.
%GIT% push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Project pushed to GitHub!
    echo Visit: https://github.com/Prem032506/%REPO_NAME%
) else (
    echo Push failed. Check your credentials and repo name.
)

echo.
pause
